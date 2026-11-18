/**
 * 地点检索（逆地理 + 关键字搜索）
 *
 * 两条数据链路，按是否配置了高德 Key 自动切换：
 *
 * 1. 配了高德 Key（推荐）：走高德 Web 服务 API，门牌级地址 + 周边 POI，
 *    国内数据最全、200ms 级返回，浏览器可直接调用（服务端开了 CORS）。
 * 2. 没配 Key：走免费的 OSM 服务（Photon 为主、Nominatim 兜底），
 *    免注册但国内 POI 覆盖有限，精度到街区/路名一级。
 *
 * 关键设计：逆地理不「猜一个」，而是返回候选列表 —— 用户点哪个就是哪个，
 * 不会把 1 公里外的地标安到点击位置上。
 */
export interface PlaceCandidate {
  id: string
  name: string
  address: string
  lng: number
  lat: number
  /** 距查询点的距离（米） */
  distance: number
  source: 'amap' | 'photon' | 'nominatim'
}

const PHOTON = 'https://photon.komoot.io'
const NOMINATIM = 'https://nominatim.openstreetmap.org'
const AMAP = 'https://restapi.amap.com/v3'

const AMAP_KEY_STORAGE = 'atlas:amap-key'

/** 同一坐标反复点击时不再打接口 */
const nearbyCache = new Map<string, PlaceCandidate[]>()

/** 高德 Key：优先用页面上填的（存 localStorage），其次读环境变量 */
export function getAmapKey(): string {
  try {
    const saved = localStorage.getItem(AMAP_KEY_STORAGE)
    if (saved)
      return saved
  }
  catch {
    // localStorage 不可用（隐私模式）时忽略
  }
  return String(import.meta.env.VITE_MAP_KEY ?? '')
}

export function setAmapKey(key: string) {
  try {
    if (key)
      localStorage.setItem(AMAP_KEY_STORAGE, key)
    else
      localStorage.removeItem(AMAP_KEY_STORAGE)
  }
  catch {
    // 存不进去也不影响本次会话，刷新后会回到环境变量配置
  }
  nearbyCache.clear()
}

export function hasAmapKey() {
  return Boolean(getAmapKey())
}

/** 校验 Key 是否可用：拿天安门试一次，顺便把失败原因带回来 */
export async function verifyAmapKey(key: string): Promise<{ ok: boolean, message: string }> {
  try {
    const data = await fetchJson(`${AMAP}/geocode/regeo?key=${encodeURIComponent(key)}&location=116.397,39.908&extensions=base`, undefined, 6000)
    if (data.status === '1')
      return { ok: true, message: '' }
    return { ok: false, message: amapErrorMessage(String(data.info ?? ''), String(data.infocode ?? '')) }
  }
  catch {
    return { ok: false, message: '网络不通，没连上高德服务' }
  }
}

function amapErrorMessage(info: string, code: string) {
  const map: Record<string, string> = {
    INVALID_USER_KEY: 'Key 无效，检查是否复制完整',
    USERKEY_PLAT_NOMATCH: '这个 Key 不是「Web服务」类型，去控制台改一下服务类型',
    DAILY_QUERY_OVER_LIMIT: '今天的调用量已用完，明天再试或换个 Key',
    INSUFFICIENT_PRIVILEGES: '这个 Key 没有逆地理编码权限',
    SERVICE_NOT_AVAILABLE: '高德服务暂时不可用',
  }
  return map[info] || `${info || '未知错误'}${code ? `（${code}）` : ''}`
}

const CACHE_PRECISION = 4

/** 附近有哪些地方：逆地理返回候选列表 */
export async function searchNearby(
  lng: number,
  lat: number,
  options: { limit?: number, signal?: AbortSignal, timeout?: number } = {},
): Promise<PlaceCandidate[]> {
  const { limit = 8, signal, timeout = 8000 } = options

  const amapKey = getAmapKey()
  const key = `${lng.toFixed(CACHE_PRECISION)},${lat.toFixed(CACHE_PRECISION)},${limit},${amapKey ? 'amap' : 'osm'}`
  const hit = nearbyCache.get(key)
  if (hit)
    return hit

  // 配了高德就先用高德：门牌级地址 + 周边 POI，比 OSM 准得多
  if (amapKey) {
    try {
      const list = await amapNearby(lng, lat, amapKey, limit, signal, timeout)
      if (list.length) {
        remember(key, list)
        return list
      }
    }
    catch {
      // Key 失效、超额、网络问题都往下走 OSM，不把面板留空
    }
  }

  const attempt = async () => {
    const list = await photonNearby(lng, lat, limit, signal, timeout)
    if (list.length)
      return list
    // Photon 这一带没数据时用 Nominatim 拼一条出来
    const single = await nominatimReverse(lng, lat, signal, timeout)
    return single ? [single] : []
  }

  let list: PlaceCandidate[] = []
  try {
    list = await attempt()
    if (!list.length && !signal?.aborted) {
      await delay(600)
      list = await attempt()
    }
  }
  catch {
    list = []
  }

  if (!list.length)
    return []

  remember(key, list)
  return list
}

function remember(key: string, list: PlaceCandidate[]) {
  if (nearbyCache.size > 100)
    nearbyCache.clear()
  nearbyCache.set(key, list)
}

/* ==================== 高德 ==================== */

async function amapNearby(
  lng: number,
  lat: number,
  key: string,
  limit: number,
  signal?: AbortSignal,
  timeout = 8000,
): Promise<PlaceCandidate[]> {
  const url = `${AMAP}/geocode/regeo?key=${encodeURIComponent(key)}&location=${lng.toFixed(6)},${lat.toFixed(6)}&extensions=all&radius=1000&sortrule=distance&batch=false`
  const data = await fetchJson(url, signal, timeout)

  if (data.status !== '1')
    throw new Error(amapErrorMessage(String(data.info ?? ''), String(data.infocode ?? '')))

  const regeo = data.regeocode
  if (!regeo)
    return []

  const fullAddress = String(regeo.formatted_address ?? '')
  const comp = (regeo.addressComponent ?? {}) as Recordable

  const list: PlaceCandidate[] = []

  // 先放「此处地址」：POI 里可能没有用户点的那栋楼，这条兜住
  const district = String(comp.district ?? '')
  const township = String(comp.township ?? '')
  list.push({
    id: `addr-${lng},${lat}`,
    name: township || district || '此处地址',
    address: fullAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lng,
    lat,
    distance: 0,
    source: 'amap',
  })

  // 再放周边 POI：高德已经把最近的排在前面
  for (const poi of (regeo.pois ?? []).slice(0, limit)) {
    const [poiLng, poiLat] = String(poi.location ?? '').split(',').map(Number)
    const name = String(poi.name ?? '').trim()
    if (!name || !Number.isFinite(poiLng) || !Number.isFinite(poiLat))
      continue

    list.push({
      id: String(poi.id ?? `${poiLng},${poiLat}`),
      name,
      address: String(poi.address || fullAddress),
      lng: poiLng,
      lat: poiLat,
      distance: Number(poi.distance ?? 0) || Math.round(distanceInMeters(lng, lat, poiLng, poiLat)),
      source: 'amap',
    })
  }

  return list.slice(0, limit + 1)
}

/** 按关键字搜地点，用于「搜索名称」 */
export async function searchByKeyword(
  keyword: string,
  center: { lng: number, lat: number },
  options: { limit?: number, signal?: AbortSignal, timeout?: number } = {},
): Promise<PlaceCandidate[]> {
  const { limit = 8, signal, timeout = 8000 } = options
  const word = keyword.trim()
  if (!word)
    return []

  const amapKey = getAmapKey()
  if (amapKey) {
    try {
      const url = `${AMAP}/place/text?key=${encodeURIComponent(amapKey)}&keywords=${encodeURIComponent(word)}&location=${center.lng.toFixed(6)},${center.lat.toFixed(6)}&radius=50000&offset=${limit}&page=1&extensions=base`
      const data = await fetchJson(url, signal, timeout)
      if (data.status === '1' && Array.isArray(data.pois)) {
        const list = data.pois
          .map((poi: any) => {
            const [poiLng, poiLat] = String(poi.location ?? '').split(',').map(Number)
            const name = String(poi.name ?? '').trim()
            if (!name || !Number.isFinite(poiLng) || !Number.isFinite(poiLat))
              return null
            return {
              id: String(poi.id ?? `${poiLng},${poiLat}`),
              name,
              address: String(poi.address || poi.cityname || ''),
              lng: poiLng,
              lat: poiLat,
              distance: Math.round(distanceInMeters(center.lng, center.lat, poiLng, poiLat)),
              source: 'amap' as const,
            }
          })
          .filter(Boolean) as PlaceCandidate[]

        if (list.length)
          return list
      }
    }
    catch {
      // 搜索失败回落到 Photon
    }
  }

  const url = `${PHOTON}/api?q=${encodeURIComponent(keyword)}&lat=${center.lat}&lon=${center.lng}&limit=${limit}`
  try {
    const data = await fetchJson(url, signal, timeout)
    return mapFeatures(data, center)
  }
  catch {
    return []
  }
}

/* ==================== Photon ==================== */

async function photonNearby(
  lng: number,
  lat: number,
  limit: number,
  signal?: AbortSignal,
  timeout = 8000,
) {
  // 注意：Photon 只支持 default/de/en/fr，带 lang=zh 会直接报错
  const url = `${PHOTON}/reverse?lat=${lat}&lon=${lng}&limit=${limit}`
  const data = await fetchJson(url, signal, timeout)
  return mapFeatures(data, { lng, lat })
}

function mapFeatures(data: any, center: { lng: number, lat: number }): PlaceCandidate[] {
  const features = Array.isArray(data?.features) ? data.features : []
  const list: PlaceCandidate[] = []

  for (const feature of features) {
    const props = feature.properties ?? {}
    const name = String(props.name ?? '').trim()
    // 没名字的要素（纯道路、行政区）跳过，选了也没意义
    if (!name)
      continue

    const coords = feature.geometry?.coordinates ?? [center.lng, center.lat]
    const lng = Number(coords[0])
    const lat = Number(coords[1])

    list.push({
      id: `${props.osm_type ?? 'N'}${props.osm_id ?? `${lng},${lat}`}`,
      name,
      address: buildAddress(props, name),
      lng,
      lat,
      distance: Math.round(distanceInMeters(center.lng, center.lat, lng, lat)),
      source: 'photon',
    })
  }

  return list.sort((a, b) => a.distance - b.distance)
}

function buildAddress(props: any, name: string) {
  return [props.street, props.locality, props.district, props.city, props.state]
    .map(item => String(item ?? '').trim())
    .filter(item => item && item !== name)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .join(' ')
}

/* ==================== Nominatim ==================== */

const NAME_KEYS = [
  'amenity',
  'office',
  'building',
  'shop',
  'tourism',
  'leisure',
  'road',
  'neighbourhood',
  'suburb',
  'commercial',
  'quarter',
  'village',
  'city_district',
]

async function nominatimReverse(
  lng: number,
  lat: number,
  signal?: AbortSignal,
  timeout = 8000,
): Promise<PlaceCandidate | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh-CN&zoom=18`
  try {
    const data = await fetchJson(url, signal, timeout)
    const address = (data.address ?? {}) as Recordable
    const name = String(data.name ?? '')
      || NAME_KEYS.map(key => String(address[key] ?? '')).find(Boolean)
      || String(data.display_name ?? '').split(',')[0]
      || ''
    if (!name)
      return null

    const hitLng = Number(data.lon ?? lng)
    const hitLat = Number(data.lat ?? lat)

    return {
      id: `${hitLng},${hitLat}`,
      name,
      address: simplifyDisplayName(String(data.display_name ?? ''), name),
      lng: hitLng,
      lat: hitLat,
      distance: Math.round(distanceInMeters(lng, lat, hitLng, hitLat)),
      source: 'nominatim',
    }
  }
  catch {
    return null
  }
}

/** "北京商务中心区, 建外街道, 朝阳区, 北京市, 100022, 中国" → "北京市 朝阳区 建外街道" */
function simplifyDisplayName(displayName: string, name: string) {
  const parts = displayName
    .split(',')
    .map(item => item.trim())
    .filter(item => item && !/^\d{5,6}$/.test(item) && item !== '中国')

  const rest = parts.filter(item => item !== name)
  return rest.reverse().join(' ')
}

/* ==================== 工具 ==================== */

async function fetchJson(url: string, signal?: AbortSignal, timeout = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    return await response.json()
  }
  finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 两点间的近似距离（米）：小范围下平面近似足够 */
export function distanceInMeters(aLng: number, aLat: number, bLng: number, bLat: number) {
  const rad = Math.PI / 180
  const x = (bLng - aLng) * rad * 6378137 * Math.cos(((aLat + bLat) / 2) * rad)
  const y = (bLat - aLat) * rad * 6378137
  return Math.sqrt(x * x + y * y)
}

/** 320 米 / 1.2 公里 */
export function formatDistance(meters: number) {
  if (meters < 1000)
    return `${meters} 米`
  return `${(meters / 1000).toFixed(1)} 公里`
}
