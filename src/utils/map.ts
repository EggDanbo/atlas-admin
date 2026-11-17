import type Map from 'ol/Map'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ } from 'ol/source'

/**
 * 高德底图瓦片
 *
 * 直接按 XYZ 拉瓦片，不加载地图 SDK、也不需要 Key —— 和 aio-pc 里
 * `tencentTileLayer` 的做法一致（那边注释里也保留着同一套高德地址）。
 *
 * `webrd` 是「路网 + 注记」样式，比 `wprd` 的字号小，信息密度更适合后台页面。
 */
export function gaodeTileLayer() {
  return new TileLayer({
    source: new XYZ({
      tileSize: 256,
      url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      crossOrigin: 'Anonymous',
      wrapX: true,
    }),
  })
}

/** 地图实例的通用清理：容器销毁前把 target 摘掉，避免内存泄漏 */
export function disposeMap(map: Map | null) {
  if (!map)
    return
  map.setTarget(undefined)
  map.dispose()
}
