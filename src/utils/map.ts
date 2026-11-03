import type Map from 'ol/Map'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ } from 'ol/source'
import printJS from 'print-js'

// 高德瓦片参数说明：size无用，scl=1代表标记，scl=2代表底图，style=6代表卫星图，style=7矢量路网，style=8影像路网，wprd地址标注字体太大，使用webrd字体小

export function tencentTileLayer() {
  return new TileLayer({
    source: new XYZ({
      tileSize: 256,
      tileUrlFunction(xyz) {
        const z = xyz[0]
        const x = xyz[1]
        const y = xyz[2]
        // const newY = Math.pow(2, z) - 1 - y;
        // return `https://rt2.map.gtimg.com/realtimerender?z=${z}&x=${x}&y=${newY}&type=vector&style=0`;
        // return `https://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x=${x}&y=${y}&z=${z}`;
        return `https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${x}&y=${y}&z=${z}`
      },
      wrapX: true,
      crossOrigin: 'Anonymous',
    }),
  })
}

/**
 * 地图打印
 * @param map 地图实例
 * @param texts 打印文本
 * @param format a0 a1 a2 a3 a4 a5
 * @param resolution dpi 72 (fast) 150 300(slow)
 */
export function printMap(map: Map, texts: any = [], format = 'a4', resolution = 96) {
  const dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 207], // 297 210
    a5: [210, 148],
  }
  const dim = dims[format]
  const width = Math.round((dim[0] * resolution) / 25.4)
  const height = Math.round((dim[1] * resolution) / 25.4)
  const size = map.getSize()
  if (!size)
    return
  const viewResolution = map.getView().getResolution()
  if (!viewResolution)
    return

  map.once('rendercomplete', () => {
    const mapCanvas = document.createElement('canvas')
    mapCanvas.width = width
    mapCanvas.height = height
    const mapContext = mapCanvas.getContext('2d')
    Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), (canvas) => {
      if (canvas.width > 0) {
        const opacity = canvas.parentNode.style.opacity
        if (!mapContext)
          return
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
        const transform = canvas.style.transform
        // Get the transform parameters from the style's transform matrix
        const matrix = transform

          .match(/^matrix\(([^(]*)\)$/)[1]
          .split(',')
          .map(Number)
        // Apply the transform to the export map context
        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix)
        mapContext.drawImage(canvas, 0, 0)
      }
    })

    // 绘制文字
    if (mapContext) {
      const h = 30
      let y = height - texts.length * h + 24
      mapContext.font = '24px Arial'
      for (const word of texts) {
        mapContext.fillStyle = 'white'
        const w = mapContext.measureText(word).width
        mapContext.fillRect(0, y - 24, w, h)
        mapContext.fillStyle = 'black'
        mapContext.fillText(word, 0, y)
        y += h
      }
    }

    // 导出图片
    // mapCanvas.toBlob(function (blob) {
    //   if (blob) downloadByData(blob, '地图.jpeg');
    //   // 重置地图大小
    //   map.updateSize();
    //   map.getView().setResolution(viewResolution);
    // });

    const imageData = mapCanvas.toDataURL('png')
    // 重置地图大小
    map.updateSize()
    map.getView().setResolution(viewResolution)

    setTimeout(() => {
      printJS({
        printable: imageData,
        type: 'image',
        targetStyles: [],
      })
    }, 500)
  })

  // Set print size
  const printSize = [width, height]
  map.setSize(printSize)
  const scaling = Math.min(width / size[0], height / size[1])
  map.getView().setResolution(viewResolution / scaling)
}
