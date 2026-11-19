/**
 * 高德 JS API（Web 端 Key）的加载与查询
 *
 * 高德的 Key 分平台：控制台里选「Web 服务」的走 restapi，「Web 端 (JS API)」的
 * 只能加载 JS SDK，且 2.0 之后必须配「安全密钥」，否则请求会被拒。
 * 两条链路的返回结构接近，这里统一成 PlaceCandidate。
 */
import type { PlaceCandidate } from './geocode'
import { distanceInMeters } from './geo-calc'

export interface AmapJsConfig {
  key: string
  /** 安全密钥，2.0 版本必填；老 Key 没有可以留空 */
  securityCode: string
}

const JS_STORAGE = 'atlas:amap-js'

/** 配置从哪来：环境变量 / 页面里填的 / 没配 */
export function getAmapConfigSource(): 'env' | 'local' | '' {
  const envKey = String(import.meta.env.VITE_MAP_KEY ?? '')
  const envSecurity = String(import.meta.env.VITE_MAP_SECURITY_CODE ?? '')
  if (envKey && envSecurity)
    return 'env'

  try {
    const raw = localStorage.getItem(JS_STORAGE)
    if (raw && JSON.parse(raw)?.key)
      return 'local'
  }
  catch {
    // 忽略
  }
  return ''
}

export function getAmapJsConfig(): AmapJsConfig | null {
  // 部署配置优先：Key + 安全密钥都给了才认为是 JS API 类型
  const envKey = String(import.meta.env.VITE_MAP_KEY ?? '')
  const envSecurity = String(import.meta.env.VITE_MAP_SECURITY_CODE ?? '')
  if (envKey && envSecurity)
    return { key: envKey, securityCode: envSecurity }

  try {
    const raw = localStorage.getItem(JS_STORAGE)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as AmapJsConfig
    return parsed.key ? parsed : null
  }
  catch {
    return null
  }
}

export function setAmapJsConfig(config: AmapJsConfig | null) {
  try {
    if (config?.key)
      localStorage.setItem(JS_STORAGE, JSON.stringify(config))
    else
      localStorage.removeItem(JS_STORAGE)
  }
  catch {
    // localStorage 不可用时只影响持久化
  }
}

let loading: Promise<any> | null = null

/** 注入安全密钥 + 加载 JS SDK，插件按需带上 Geocoder / PlaceSearch */
export function loadAMapJs(config: AmapJsConfig): Promise<any> {
  if (loading)
    return loading

  loading = new Promise((resolve, reject) => {
    const existed = (window as any).AMap
    if (existed?.Geocoder) {
      resolve(existed)
      return
    }

    if (config.securityCode)
      (window as any)._AMapSecurityConfig = { securityJsCode: config.securityCode }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(config.key)}&plugin=AMap.Geocoder,AMap.PlaceSearch`
    script.async = true
    script.onload = () => {
      const amap = (window as any).AMap
      if (amap)
        resolve(amap)
      else
        reject(new Error('高德脚本加载完成但没拿到 AMap'))
    }
    script.onerror = () => {
      loading = null
      reject(new Error('高德脚本加载失败，检查网络或 Key'))
    }
    document.head.appendChild(script)
  })

  return loading
}

/** 逆地理：返回「此处地址 + 周边 POI」的候选列表 */
export async function amapJsNearby(
  lng: number,
  lat: number,
  config: AmapJsConfig,
  limit = 8,
): Promise<PlaceCandidate[]> {
  const AMap = await loadAMapJs(config)

  return new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder({ radius: 800, extensions: 'all' })
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status !== 'complete' || !result?.regeocode) {
        reject(new Error('高德没返回地址'))
        return
      }

      const regeocode = result.regeocode
      const formatted = String(regeocode.formattedAddress ?? '')
      const comp = regeocode.addressComponent ?? {}
      const township = String(comp.township ?? '')
      const district = String(comp.district ?? '')

      // 具体 POI 优先，「此处坐标」放到最后兜底
      const list: PlaceCandidate[] = []

      for (const poi of (regeocode.pois ?? []).slice(0, limit)) {
        const [poiLng, poiLat] = String(poi.location ?? '').split(',').map(Number)
        const name = String(poi.name ?? '').trim()
        if (!name || !Number.isFinite(poiLng) || !Number.isFinite(poiLat))
          continue

        list.push({
          id: String(poi.id ?? `${poiLng},${poiLat}`),
          name,
          address: String(poi.address || formatted),
          lng: poiLng,
          lat: poiLat,
          distance: Number(poi.distance ?? 0) || Math.round(distanceInMeters(lng, lat, poiLng, poiLat)),
          source: 'amap',
        })
      }

      list.push({
        id: `addr-${lng},${lat}`,
        name: township || district || '此处坐标',
        address: formatted || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lng,
        lat,
        distance: 0,
        source: 'amap',
      })

      resolve(list.slice(0, limit + 1))
    })
  })
}

/** 关键字搜索：PlaceSearch 按中心点附近搜 */
export async function amapJsSearch(
  keyword: string,
  center: { lng: number, lat: number },
  config: AmapJsConfig,
  limit = 8,
): Promise<PlaceCandidate[]> {
  const AMap = await loadAMapJs(config)

  return new Promise((resolve) => {
    const search = new AMap.PlaceSearch({ pageSize: limit, pageIndex: 1 })
    search.searchNearBy(keyword, [center.lng, center.lat], 50000, (status: string, result: any) => {
      const pois = result?.poiList?.pois
      if (status !== 'complete' || !Array.isArray(pois)) {
        resolve([])
        return
      }

      const list: PlaceCandidate[] = []
      for (const poi of pois) {
        const [poiLng, poiLat] = String(poi.location ?? '').split(',').map(Number)
        if (!Number.isFinite(poiLng) || !Number.isFinite(poiLat))
          continue
        list.push({
          id: String(poi.id ?? `${poiLng},${poiLat}`),
          name: String(poi.name ?? ''),
          address: String(poi.address || poi.cityname || ''),
          lng: poiLng,
          lat: poiLat,
          distance: Number(poi.distance ?? 0) || Math.round(distanceInMeters(center.lng, center.lat, poiLng, poiLat)),
          source: 'amap',
        })
      }
      resolve(list)
    })
  })
}

/** 校验 JS API 配置是否可用 */
export async function verifyAmapJs(config: AmapJsConfig): Promise<{ ok: boolean, message: string }> {
  try {
    const list = await amapJsNearby(116.397, 39.908, config, 3)
    return list.length > 1
      ? { ok: true, message: '' }
      : { ok: false, message: 'Key 能加载，但没取到地址，检查安全密钥' }
  }
  catch (error) {
    return { ok: false, message: (error as Error).message || '高德 Key 校验失败' }
  }
}
