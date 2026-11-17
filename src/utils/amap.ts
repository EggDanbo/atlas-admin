/**
 * 高德地图 JS API 的按需加载
 *
 * 只在配置了 VITE_MAP_KEY 时才会走到这里；没配 key 的环境（CI、演示部署）
 * 用组件内置的示意地图，不依赖外网，也不会因为脚本加载失败白屏。
 */
let loading: Promise<any> | null = null

export interface AMapLike {
  Map: any
  Marker: any
  Geocoder: any
}

export function hasAMapKey() {
  return Boolean(import.meta.env.VITE_MAP_KEY)
}

export function loadAMap(key: string): Promise<AMapLike> {
  if (loading)
    return loading

  loading = new Promise((resolve, reject) => {
    const existed = (window as any).AMap
    if (existed) {
      resolve(existed)
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Geocoder`
    script.async = true
    script.onload = () => {
      const amap = (window as any).AMap
      if (amap)
        resolve(amap)
      else
        reject(new Error('高德地图加载完成但未找到 AMap'))
    }
    script.onerror = () => {
      loading = null
      reject(new Error('高德地图脚本加载失败'))
    }
    document.head.appendChild(script)
  })

  return loading
}
