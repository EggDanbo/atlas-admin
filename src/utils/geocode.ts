/**
 * 逆地理编码
 *
 * 用 OpenStreetMap 的 Nominatim 反查地址：免费、不需要 Key，返回中文地名，
 * 精度到街道 / 商圈一级，比本地预置地标准确得多。
 *
 * 说明：Nominatim 的公共实例有 1 req/s 的频率限制，演示项目够用；
 * 真要上生产建议自建或换付费服务，把这里换掉即可，上层不用动。
 */
export interface ReverseResult {
  /** 主名称：商圈 / 街道 / 道路 */
  name: string
  /** 从大到小的地址，去掉邮编与国家 */
  address: string
  /** 命中要素的中心坐标，用于算「离点击点多远」 */
  lng: number
  lat: number
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'

/**
 * 名称取值优先级
 *
 * 具体 > 笼统：先看这儿是不是某个具体的场所（写字楼、商场、景点），
 * 再退到路名、街区，最后才是「北京商务中心区」这种一整片的商圈名 ——
 * 商圈名优先级太高的话，CBD 里点哪儿都叫同一个名字，等于没定位。
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

export async function reverseGeocode(
  lng: number,
  lat: number,
  options: { signal?: AbortSignal, timeout?: number } = {},
): Promise<ReverseResult | null> {
  const { signal, timeout = 6000 } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  // 外部取消（比如用户又点了一下）和超时都走同一个 abort
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const url = `${ENDPOINT}?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh-CN&zoom=18`
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok)
      return null

    const data = await response.json() as Recordable
    const address = (data.address ?? {}) as Recordable

    const name = String(data.name ?? '')
      || NAME_KEYS.map(key => String(address[key] ?? '')).find(Boolean)
      || String(data.display_name ?? '').split(',')[0]
      || ''

    if (!name)
      return null

    return {
      name,
      address: simplify(String(data.display_name ?? ''), name),
      lng: Number(data.lon ?? lng),
      lat: Number(data.lat ?? lat),
    }
  }
  catch {
    // 超时、被墙、取消都当没查到，交给本地地标兜底
    return null
  }
  finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
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
