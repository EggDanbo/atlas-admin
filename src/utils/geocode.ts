/**
 * 逆地理编码
 *
 * 同时打两个免费的 OSM 服务，谁先给出「具体地名」用谁：
 * - Photon（komoot）偏向返回 POI 名称，点学校就是学校、点酒店就是酒店；
 * - Nominatim 偏向返回行政区划层级，用来补地址。
 *
 * 两者都免 Key。公共实例有频率限制，演示项目够用；上生产建议自建或换付费服务，
 * 只需要替换 reverseGeocode 的实现，上层不用动。
 */
export interface ReverseResult {
  /** 主名称：具体的 POI 名，没有则退到道路 / 街区 */
  name: string
  /** 从大到小的地址 */
  address: string
  /** 命中要素的中心坐标，用于算「离点击点多远」 */
  lng: number
  lat: number
  /** 结果来源，排查问题时有用 */
  source: 'photon' | 'nominatim'
}

const PHOTON = 'https://photon.komoot.io/reverse'
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/** 同一个点附近反复点击时直接用上次结果，少打几次公共接口 */
const cache = new Map<string, ReverseResult>()
const CACHE_KEY_PRECISION = 4

export async function reverseGeocode(
  lng: number,
  lat: number,
  options: { signal?: AbortSignal, timeout?: number } = {},
): Promise<ReverseResult | null> {
  const { signal, timeout = 8000 } = options

  const key = `${lng.toFixed(CACHE_KEY_PRECISION)},${lat.toFixed(CACHE_KEY_PRECISION)}`
  const hit = cache.get(key)
  if (hit)
    return hit

  const attempt = () => Promise.any([
    withTimeout(photonReverse(lng, lat, signal), timeout),
    withTimeout(nominatimReverse(lng, lat, signal), timeout),
  ])

  try {
    // 谁先拿到「有名字」的结果用谁，任一源被墙另一个还能兜住
    const result = await attempt()
    remember(key, result)
    return result
  }
  catch {
    if (signal?.aborted)
      return null

    // 第一次多半是冷启动（DNS / TLS 握手），隔一下再补一次
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      const result = await attempt()
      remember(key, result)
      return result
    }
    catch {
      return null
    }
  }
}

function remember(key: string, result: ReverseResult) {
  if (cache.size > 200)
    cache.clear()
  cache.set(key, result)
}

function withTimeout<T>(task: Promise<T>, timeout: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout)
    task.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/* ==================== Photon ==================== */

async function photonReverse(lng: number, lat: number, signal?: AbortSignal): Promise<ReverseResult> {
  // 注意：Photon 只支持 default/de/en/fr，带 lang=zh 会直接返回错误
  const url = `${PHOTON}?lat=${lat}&lon=${lng}&limit=1`
  const response = await fetch(url, { signal })
  if (!response.ok)
    throw new Error('photon failed')

  const data = await response.json() as any
  const feature = data?.features?.[0]
  if (!feature)
    throw new Error('photon empty')

  const props = feature.properties ?? {}
  const name = String(props.name ?? '').trim()
  // 没名字的要素（纯道路）交给 Nominatim，那边能拼出地址
  if (!name)
    throw new Error('photon no name')

  const address = [
    props.street,
    props.locality,
    props.district,
    props.city,
    props.state,
  ]
    .map((item: any) => String(item ?? '').trim())
    .filter((item: string) => item && item !== name)
    .join(' ')

  return {
    name,
    address: address || String(props.city ?? ''),
    lng: Number(feature.geometry?.coordinates?.[0] ?? lng),
    lat: Number(feature.geometry?.coordinates?.[1] ?? lat),
    source: 'photon',
  }
}

/* ==================== Nominatim ==================== */

/**
 * 名称取值优先级：具体 > 笼统
 *
 * 先看这儿是不是某个具体场所（写字楼、商场、景点），再退到路名、街区，
 * 最后才是「北京商务中心区」这种一整片的商圈名 —— 商圈名优先级太高的话，
 * CBD 里点哪儿都叫同一个名字，等于没定位。
 */
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

async function nominatimReverse(lng: number, lat: number, signal?: AbortSignal): Promise<ReverseResult> {
  const url = `${NOMINATIM}?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh-CN&zoom=18`
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok)
    throw new Error('nominatim failed')

  const data = await response.json() as Recordable
  const address = (data.address ?? {}) as Recordable

  const name = String(data.name ?? '')
    || NAME_KEYS.map(key => String(address[key] ?? '')).find(Boolean)
    || String(data.display_name ?? '').split(',')[0]
    || ''

  if (!name)
    throw new Error('nominatim no name')

  return {
    name,
    address: simplify(String(data.display_name ?? ''), name),
    lng: Number(data.lon ?? lng),
    lat: Number(data.lat ?? lat),
    source: 'nominatim',
  }
}

/** "北京商务中心区, 建外街道, 朝阳区, 北京市, 100022, 中国" → "北京市 朝阳区 建外街道" */
function simplify(displayName: string, name: string) {
  const parts = displayName
    .split(',')
    .map(item => item.trim())
    .filter(item => item && !/^\d{5,6}$/.test(item) && item !== '中国')

  const rest = parts.filter(item => item !== name)
  return rest.reverse().join(' ')
}
