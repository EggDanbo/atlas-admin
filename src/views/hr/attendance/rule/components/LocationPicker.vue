<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { hasAMapKey, loadAMap } from '@/utils/amap'
import { gaodeTileLayer } from '@/utils/map'
import toast from '@/utils/toast'
import 'ol/ol.css'

/** 选中的打卡地点 */
export interface LocationPoint {
  id: string
  name: string
  address: string
  lng?: number
  lat?: number
  x?: number
  y?: number
}

const emit = defineEmits<{ (e: 'confirm', value: LocationPoint): void }>()

/**
 * 预置地点：示意地图用来摆标注，真实地图用来做逆地理编码的近似匹配
 * （演示项目没有后端地理编码服务，就近取一个已知地点，够用且离线可跑）
 */
const POINTS: LocationPoint[] = [
  { id: 'hq', name: '总部大厦', address: '北京市朝阳区创新大道 88 号', x: 318, y: 232, lng: 116.404, lat: 39.915 },
  { id: 'rd', name: '研发中心', address: '北京市海淀区科苑路 12 号 A 座', x: 642, y: 286, lng: 116.43, lat: 39.912 },
  { id: 'wh', name: '中心仓库', address: '北京市大兴区物流园 3 号库', x: 934, y: 512, lng: 116.45, lat: 39.9 },
  { id: 'sc', name: '客户服务中心', address: '北京市东城区人民路 205 号', x: 452, y: 566, lng: 116.392, lat: 39.9 },
  { id: 'pl', name: '生产线一厂', address: '北京市通州区工业大道 7 号', x: 762, y: 636, lng: 116.442, lat: 39.895 },
  { id: 'br', name: '滨江办事处', address: '北京市西城区滨江路 66 号', x: 208, y: 448, lng: 116.38, lat: 39.905 },
]

const modalRef = ref<ModalInst | null>(null)
const picked = ref<LocationPoint | null>(null)
const mapEl = ref<HTMLElement | null>(null)

/** ol = OpenLayers 拉瓦片（默认，不需要 Key）；amap = 高德 SDK（需要 Key）；svg = 示意地图 */
const provider = (import.meta.env.VITE_MAP_PROVIDER || 'ol').toLowerCase()
const renderFailed = ref(false)
const mapLoading = ref(false)

const mode = computed<'ol' | 'amap' | 'svg'>(() => {
  if (renderFailed.value)
    return 'svg'
  if (provider === 'amap')
    return hasAMapKey() ? 'amap' : 'svg'
  if (provider === 'ol')
    return 'ol'
  return 'svg'
})

let olMap: any = null
let markerSource: any = null
/** ol 是动态引入的，构造器存下来给落点复用 */
let OlFeatureCtor: any = null
let OlPointCtor: any = null
let olFromLonLat: ((coord: number[]) => number[]) | null = null
let amap: any = null
let amapMarker: any = null
let geocoder: any = null

function open(current?: LocationPoint | null) {
  picked.value = current ?? null
  modalRef.value?.setProps({
    title: '选择打卡地点',
    width: '90vw',
    height: '90vh',
    okText: '确定',
    cancelText: '取消',
  })
  modalRef.value?.open()

  if (mode.value === 'ol')
    nextTick(() => initOlMap())
  else if (mode.value === 'amap')
    nextTick(() => initAMap())
}

function pick(point: LocationPoint) {
  picked.value = point
}

/* ==================== OpenLayers ==================== */

async function initOlMap() {
  if (!mapEl.value || olMap)
    return

  mapLoading.value = true

  try {
    const [
      { default: OlMap },
      { default: View },
      { fromLonLat, toLonLat },
      { default: VectorLayer },
      { default: VectorSource },
      { default: Feature },
      { default: Point },
      { Circle: CircleStyle, Fill, Stroke, Style },
    ] = await Promise.all([
      import('ol/Map'),
      import('ol/View'),
      import('ol/proj'),
      import('ol/layer/Vector'),
      import('ol/source/Vector'),
      import('ol/Feature'),
      import('ol/geom/Point'),
      import('ol/style'),
    ])

    OlFeatureCtor = Feature
    OlPointCtor = Point
    olFromLonLat = fromLonLat

    const center = [picked.value?.lng ?? 116.404, picked.value?.lat ?? 39.915]

    markerSource = new VectorSource()
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: '#f97316' }),
          stroke: new Stroke({ color: '#ffffff', width: 3 }),
        }),
      }),
    })

    olMap = new OlMap({
      target: mapEl.value,
      layers: [gaodeTileLayer(), markerLayer],
      view: new View({ center: fromLonLat(center), zoom: 15, minZoom: 4, maxZoom: 18 }),
    })

    if (picked.value?.lng && picked.value?.lat)
      setOlMarker(picked.value.lng, picked.value.lat)

    // 点地图任意位置落点，再按就近原则给出地址
    olMap.on('singleclick', (event: any) => {
      const [lng, lat] = toLonLat(event.coordinate) as [number, number]
      const point = { lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)) }
      setOlMarker(point.lng, point.lat)
      picked.value = describe(point.lng, point.lat)
    })

    // 弹窗刚展开时容器尺寸还没稳定，稍等再量一次
    setTimeout(() => olMap?.updateSize(), 160)
  }
  catch (error) {
    renderFailed.value = true
    toast.warning(`${(error as Error).message || '地图加载失败'}，已切换为示意地图`)
  }
  finally {
    mapLoading.value = false
  }
}

function setOlMarker(lng: number, lat: number) {
  if (!markerSource || !OlFeatureCtor || !OlPointCtor)
    return
  markerSource.clear()
  markerSource.addFeature(new OlFeatureCtor({ geometry: new OlPointCtor(olFromLonLat!([lng, lat])) }))
}

/* ==================== 高德 SDK ==================== */

async function initAMap() {
  if (!mapEl.value || amap)
    return

  mapLoading.value = true
  try {
    const AMap = await loadAMap(import.meta.env.VITE_MAP_KEY)
    geocoder = new AMap.Geocoder({ radius: 200, extensions: 'all' })
    amap = new AMap.Map(mapEl.value, {
      zoom: 14,
      center: [picked.value?.lng ?? 116.404, picked.value?.lat ?? 39.915],
      viewMode: '2D',
    })

    if (picked.value?.lng && picked.value?.lat)
      setAmapMarker(picked.value.lng, picked.value.lat)

    amap.on('click', (event: any) => {
      const lng = Number(event.lnglat.getLng().toFixed(6))
      const lat = Number(event.lnglat.getLat().toFixed(6))
      setAmapMarker(lng, lat)
      geocoder.getAddress([lng, lat], (status: string, result: any) => {
        if (status === 'complete' && result?.regeocode) {
          const info = result.regeocode
          picked.value = {
            id: `${lng},${lat}`,
            name: info.pois?.[0]?.name || info.formattedAddress || '自定义位置',
            address: info.formattedAddress || `${lat}, ${lng}`,
            lng,
            lat,
          }
        }
        else {
          picked.value = describe(lng, lat)
        }
      })
    })
  }
  catch (error) {
    renderFailed.value = true
    amap = null
    toast.warning(`${(error as Error).message || '地图加载失败'}，已切换为示意地图`)
  }
  finally {
    mapLoading.value = false
  }
}

function setAmapMarker(lng: number, lat: number) {
  if (!amap)
    return
  if (amapMarker)
    amapMarker.setPosition([lng, lat])
  else
    amapMarker = new (window as any).AMap.Marker({ position: [lng, lat], map: amap })
}

/* ==================== 公共 ==================== */

/** 没有后端地理编码服务时，就近匹配预置地点 */
function describe(lng: number, lat: number): LocationPoint {
  let nearest = POINTS[0]!
  let min = Number.POSITIVE_INFINITY
  for (const point of POINTS) {
    const distance = (point.lng! - lng) ** 2 + (point.lat! - lat) ** 2
    if (distance < min) {
      min = distance
      nearest = point
    }
  }
  // 约 3 公里内认为是同一个地点，再远就当自定义位置
  if (min <= 0.0009) {
    return { ...nearest, id: `${lng},${lat}`, lng, lat }
  }
  return {
    id: `${lng},${lat}`,
    name: '自定义位置',
    address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lng,
    lat,
  }
}

/** 没选点就不让关，省得用户以为已经选上了 */
function handleOk({ done }: { done: (close?: boolean) => void }) {
  if (!picked.value) {
    toast.warning('请先在地图上选择打卡地点')
    done(false)
    return
  }
  emit('confirm', picked.value)
  done()
}

defineExpose({ open })
</script>

<template>
  <SpModal ref="modalRef" @ok="handleOk">
    <div class="map" :class="`is-${mode}`">
      <!-- 真实地图：OpenLayers 拉瓦片（默认）或高德 SDK -->
      <div v-if="mode !== 'svg'" ref="mapEl" class="map__real" />
      <div v-if="mode !== 'svg' && mapLoading" class="map__loading">
        地图加载中…
      </div>

      <!-- 示意地图：没配 provider、或上面两种都失败时的兜底 -->
      <div v-else class="map__canvas">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" class="map__svg" role="img">
          <rect x="0" y="0" width="1200" height="800" class="map__bg" />

          <path
            class="map__water"
            d="M0,120 C160,150 240,220 300,320 C360,420 420,470 520,500 C640,535 760,520 880,560 C980,592 1080,640 1200,660 L1200,800 L0,800 Z"
          />
          <path class="map__river" d="M0,120 C160,150 240,220 300,320 C360,420 420,470 520,500 C640,535 760,520 880,560 C980,592 1080,640 1200,660" />

          <rect x="120" y="180" width="200" height="130" rx="12" class="map__park" />
          <rect x="820" y="120" width="240" height="150" rx="12" class="map__park" />

          <g class="map__blocks">
            <rect x="360" y="140" width="180" height="120" rx="8" />
            <rect x="580" y="150" width="200" height="110" rx="8" />
            <rect x="360" y="300" width="150" height="130" rx="8" />
            <rect x="560" y="330" width="200" height="120" rx="8" />
            <rect x="820" y="420" width="180" height="120" rx="8" />
            <rect x="130" y="520" width="170" height="140" rx="8" />
            <rect x="340" y="600" width="180" height="130" rx="8" />
            <rect x="600" y="560" width="150" height="120" rx="8" />
          </g>

          <g class="map__roads">
            <path d="M0,470 L1200,470" />
            <path d="M0,300 L520,300" />
            <path d="M700,0 L700,470" />
            <path d="M350,0 L350,800" />
            <path d="M0,620 L1200,700" />
            <path d="M980,0 L1120,470" />
          </g>

          <g
            v-for="point in POINTS"
            :key="point.id"
            class="map__pin"
            :class="{ 'is-active': picked?.id === point.id }"
            :transform="`translate(${point.x}, ${point.y})`"
            @click="pick(point)"
          >
            <circle class="map__pin-halo" r="26" />
            <circle class="map__pin-dot" r="11" />
            <circle class="map__pin-core" r="4" />
            <text class="map__pin-label" y="-26" text-anchor="middle">{{ point.name }}</text>
          </g>
        </svg>

        <div class="map__legend">
          点击标注选择打卡地点 · 当前为示意地图
        </div>
      </div>

      <div v-if="mode !== 'svg' && !mapLoading" class="map__legend">
        点击地图任意位置选择打卡地点
      </div>

      <div class="map__picked" :class="{ 'is-empty': !picked }">
        <template v-if="picked">
          <b>{{ picked.name }}</b>
          <span>{{ picked.address }}</span>
        </template>
        <span v-else>尚未选择地点</span>
      </div>
    </div>
  </SpModal>
</template>

<style scoped lang="less">
.map {
  // 示意地图的配色，暗色下走下面的覆盖
  --map-bg: #e8eef7;
  --map-road: #ffffff;
  --map-road-line: #dbe3ee;
  --map-block: #d6e0ec;
  --map-water: rgb(59 130 246 / 8%);
  --map-park: rgb(34 197 94 / 15%);

  // 弹窗 90vh 减去 header / footer / 内边距，剩下的都给地图
  position: relative;
  height: calc(90vh - 130px);
  min-height: 420px;

  &__real {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--atlas-radius-sm);
    background: var(--atlas-surface-soft);
  }

  &__loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--atlas-text-tertiary);
    background: var(--map-bg);
  }

  &__canvas {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: var(--atlas-radius-sm);
    background: var(--map-bg);
  }

  &__svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__bg {
    fill: var(--map-bg);
  }

  &__water {
    fill: var(--map-water);
  }

  &__river {
    fill: none;
    stroke: var(--map-water);
    stroke-width: 18;
    stroke-linecap: round;
  }

  &__park {
    fill: var(--map-park);
  }

  &__blocks rect {
    fill: var(--map-block);
  }

  &__roads path {
    fill: none;
    stroke: var(--map-road);
    stroke-width: 22;
    stroke-linecap: round;
  }

  &__pin {
    cursor: pointer;

    &-halo {
      fill: color-mix(in srgb, var(--atlas-brand) 18%, transparent);
      transition: fill 0.2s ease;
    }

    &-dot {
      fill: var(--atlas-brand);
      stroke: var(--map-bg);
      stroke-width: 3;
    }

    &-core {
      fill: #fff;
    }

    &-label {
      font-size: 15px;
      fill: var(--atlas-text);
      paint-order: stroke;
      stroke: var(--map-bg);
      stroke-width: 4;
      stroke-linejoin: round;
    }

    &:hover &-halo {
      fill: color-mix(in srgb, var(--atlas-brand) 30%, transparent);
    }

    &.is-active &-halo {
      fill: color-mix(in srgb, var(--atlas-brand) 34%, transparent);
    }

    &.is-active &-label {
      font-weight: 600;
    }
  }

  &__legend {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: var(--atlas-text-secondary);
    background: color-mix(in srgb, var(--atlas-canvas) 88%, transparent);
    backdrop-filter: blur(4px);
  }

  &__picked {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 14px;
    border-radius: var(--atlas-radius-sm);
    font-size: 12px;
    color: var(--atlas-text-secondary);
    background: color-mix(in srgb, var(--atlas-canvas) 92%, transparent);
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);

    b {
      font-size: 14px;
      color: var(--atlas-text);
    }

    &.is-empty {
      color: var(--atlas-text-tertiary);
    }
  }
}
</style>

<!-- 暗色底图配色写在非 scoped 块里：scoped + :global 会被 less 压成 html.dark，丢掉选择器 -->
<style lang="less">
/* 暗色下真实地图压一点亮度，否则一整块亮底图糊在深色弹窗里很刺眼 */
html.dark .map__real canvas,
html[data-vxe-ui-theme='dark'] .map__real canvas {
  filter: brightness(0.84) contrast(1.04) saturate(0.92);
}

html.dark .map,
html[data-vxe-ui-theme='dark'] .map {
  --map-bg: #151a24;
  --map-road: #333d4f;
  --map-road-line: #384457;
  --map-block: #1e2633;
  --map-water: rgb(56 132 255 / 12%);
  --map-park: rgb(34 197 94 / 18%);
}
</style>
