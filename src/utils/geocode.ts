/**
 * 地点检索（逆地理 + 关键字搜索）
 *
 * 数据来自免费的 OSM 服务，都不需要 Key：
 * - Photon（komoot）：按距离返回附近多个 POI，点完能给一串候选让人挑；
 * - Nominatim：兜底，返回地址层级。
 *
 * 关键设计：逆地理不「猜一个」，而是返回候选列表 —— 点在自忠小学，
 * 列表里就有那一带的真实地名，用户点哪个就是哪个，不会张冠李戴。
 *
 * 公共实例有频率限制，演示项目够用；上生产建议自建或换付费服务，
 * 只需替换本文件的实现，上层不用动。
 */
export interface PlaceCandidate {
  id: string
  name: string
  address: string
  lng: number
  lat: number
  /** 距查询点的距离（米） */
  distance: number
  source: 'photon' | 'nominatim' | 'local'
}

const PHOTON = 'https://photon.komoot.io'
const NOMINATIM = 'https://nominatim.openstreetmap.org'

/** 同名结果去重用的缓存：同一坐标反复点击不再打公共接口 */
const nearbyCache = new Map<string, PlaceCandidate[]>()
const CACHE_PRECISION = 4

/** 附近有哪些地方：逆地理返回候选列表 */
export async function searchNearby(
  lng: number,
  lat: number,
  options: { limit?: number, signal?: AbortSignal, timeout?: number } = {},
): Promise<PlaceCandidate[]> {
  const { limit = 8, signal, timeout = 8000 } = options

  const key = `${lng.toFixed(CACHE_PRECISION)},${lat.toFixed(CACHE_PRECISION)},${limit}`
  const hit = nearbyCache.get(key)
  if (hit)
    return hit

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

  if (nearbyCache.size > 100)
    nearbyCache.clear()
  nearbyCache.set(key, list)
  return list
}

/** 按关键字搜地点，用于「搜索名称」 */
export async function searchByKeyword(
  keyword: string,
  center: { lng: number, lat: number },
  options: { limit?: number, signal?: AbortSignal, timeout?: number } = {},
): Promise<PlaceCandidate[]> {
  const { limit = 8, signal, timeout = 8000 } = options
  if (!keyword.trim())
    return []

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
