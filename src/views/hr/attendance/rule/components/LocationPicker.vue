<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { reverseGeocode } from '@/utils/geocode'
import { gaodeTileLayer } from '@/utils/map'
import toast from '@/utils/toast'
import { distanceInMeters, formatDistance, nearestLandmark } from './landmarks'
import 'ol/ol.css'

/** 选中的打卡地点 */
export interface LocationPoint {
  id: string
  name: string
  address: string
  /** 地名介绍，点完就知道选的是哪儿 */
  intro?: string
  /** 距点击点的距离（米），只用于弹窗里展示 */
  distance?: number
  /** 结果来源：逆地理编码 / 本地地标兜底 */
  source?: 'geocode' | 'local'
  lng?: number
  lat?: number
  x?: number
  y?: number
}

const emit = defineEmits<{ (e: 'confirm', value: LocationPoint): void }>()

/**
 * 示意地图里的标注位置
 *
 * 真实地名与介绍统一来自 landmarks，这里只规定它们在示意图上的坐标，
 * 这样两种地图点出来的结果是一致的。
 */
const SVG_PINS = [
  { x: 318, y: 232, lng: 116.397, lat: 39.9163 },
  { x: 642, y: 286, lng: 116.4605, lat: 39.9087 },
  { x: 934, y: 512, lng: 116.4957, lat: 39.9843 },
  { x: 452, y: 566, lng: 116.3975, lat: 39.9087 },
  { x: 762, y: 636, lng: 116.3975, lat: 39.9928 },
  { x: 208, y: 448, lng: 116.3833, lat: 39.9403 },
].map((pin) => {
  const { landmark } = nearestLandmark(pin.lng, pin.lat)
  return { ...pin, id: landmark.id, name: landmark.name }
})

const modalRef = ref<ModalInst | null>(null)
const picked = ref<LocationPoint | null>(null)
const mapEl = ref<HTMLElement | null>(null)

/** 用 OpenLayers 直接拉瓦片；万一地图库或瓦片挂了，退回内置的示意地图 */
const renderFailed = ref(false)
const mapLoading = ref(false)
const mode = computed<'ol' | 'svg'>(() => (renderFailed.value ? 'svg' : 'ol'))

let olMap: any = null
let markerSource: any = null
/** ol 是动态引入的，构造器存下来给落点复用 */
let OlFeatureCtor: any = null
let OlPointCtor: any = null
let olFromLonLat: ((coord: number[]) => number[]) | null = null

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
}

/** 请求中的小状态：地图上点一下会先给本地结果，再被真实地址替换 */
const locating = ref(false)
let pendingAbort: AbortController | null = null

function pick(point: { lng: number, lat: number }) {
  if (mode.value === 'ol')
    setOlMarker(point.lng, point.lat)

  // 先用最近地标给个即时结果，面板不会空着等网络
  const local = { ...describe(point.lng, point.lat), source: 'local' as const }
  picked.value = local
  locating.value = true

  pendingAbort?.abort()
  const controller = new AbortController()
  pendingAbort = controller

  reverseGeocode(point.lng, point.lat, { signal: controller.signal })
    .then((result) => {
      if (controller.signal.aborted)
        return

      // 查不到就保留本地地标的结果，不把面板清空
      if (!result) {
        locating.value = false
        return
      }

      const near = nearestLandmark(result.lng, result.lat)
      picked.value = {
        id: `${point.lng},${point.lat}`,
        name: result.name,
        address: result.address,
        // 只有确实贴近某个知名地点时才带介绍，避免张冠李戴
        intro: near.distance <= 800 ? near.landmark.intro : '',
        distance: Math.round(distanceInMeters(point.lng, point.lat, result.lng, result.lat)),
        source: 'geocode',
        lng: point.lng,
        lat: point.lat,
      }
      locating.value = false
    })
    .catch(() => {
      locating.value = false
    })
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
      pick({ lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)) })
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

/* ==================== 公共 ==================== */

/**
 * 点完地图立刻给出「最近的已知地名 + 介绍」
 *
 * 演示项目没有逆地理编码服务，用预置地标做最近邻匹配；
 * 接后端时把这个函数换成 geocode 接口即可，上层不用动。
 */
function describe(lng: number, lat: number): LocationPoint {
  const { landmark, distance } = nearestLandmark(lng, lat)

  // 超出 20 公里认为不在收录范围，只回坐标，避免误导
  if (distance > 20000) {
    return {
      id: `${lng},${lat}`,
      name: '未收录区域',
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      intro: '这里暂未收录地名，只记录了坐标。',
      distance,
      lng,
      lat,
    }
  }

  return {
    id: landmark.id,
    name: landmark.name,
    address: landmark.address,
    intro: landmark.intro,
    distance,
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
      <!-- 真实地图：OpenLayers 拉高德瓦片，不需要 Key -->
      <div v-if="mode === 'ol'" ref="mapEl" class="map__real" />
      <div v-if="mode === 'ol' && mapLoading" class="map__loading">
        地图加载中…
      </div>

      <!-- 示意地图：地图库加载失败时的兜底 -->
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
            v-for="point in SVG_PINS"
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

      <div v-if="mode === 'ol' && !mapLoading" class="map__legend">
        点击地图任意位置选择打卡地点
      </div>

      <div class="map__picked" :class="{ 'is-empty': !picked }">
        <template v-if="picked">
          <div class="map__picked-head">
            <b>{{ picked.name }}</b>
            <em v-if="picked.distance !== undefined && picked.distance >= 30">{{ formatDistance(picked.distance) }}</em>
            <span v-if="locating" class="map__picked-loading">定位中…</span>
          </div>
          <span class="map__picked-addr">{{ picked.address }}</span>
          <p v-if="picked.intro" class="map__picked-intro">
            {{ picked.intro }}
          </p>
          <span v-if="picked.source === 'local'" class="map__picked-note">
            未取到实时地址，以上为最近的已知地标
          </span>
        </template>
        <span v-else>点击地图任意位置，这里会显示最近的地名</span>
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
    gap: 5px;
    width: 360px;
    padding: 14px 16px;
    border-radius: var(--atlas-radius-sm);
    font-size: 12px;
    color: var(--atlas-text-secondary);
    background: color-mix(in srgb, var(--atlas-canvas) 94%, transparent);
    box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
    backdrop-filter: blur(6px);

    &-head {
      display: flex;
      align-items: baseline;
      gap: 8px;

      b {
        font-size: 16px;
        color: var(--atlas-text);
      }

      em {
        font-style: normal;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 999px;
        color: var(--atlas-brand);
        background: var(--atlas-brand-soft);
      }
    }

    &-addr {
      line-height: 1.5;
      color: var(--atlas-text-secondary);
    }

    &-note {
      font-size: 11px;
      color: var(--atlas-text-tertiary);
    }

    &-loading {
      font-size: 11px;
      color: var(--atlas-text-tertiary);
    }

    &-intro {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: var(--atlas-text-tertiary);
    }

    &.is-empty {
      width: auto;
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
