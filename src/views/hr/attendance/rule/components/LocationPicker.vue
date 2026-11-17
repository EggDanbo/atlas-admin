<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { hasAMapKey, loadAMap } from '@/utils/amap'
import toast from '@/utils/toast'

/** 选中的打卡地点：示意地图给 x/y，真实地图给经纬度 */
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

/** 示意地图上的几个地点（只在没有配置地图 Key 时使用） */
const POINTS: LocationPoint[] = [
  { id: 'hq', name: '总部大厦', address: '创新大道 88 号', x: 318, y: 232, lng: 116.404, lat: 39.915 },
  { id: 'rd', name: '研发中心', address: '科苑路 12 号 A 座', x: 642, y: 286, lng: 116.43, lat: 39.912 },
  { id: 'wh', name: '中心仓库', address: '物流园 3 号库', x: 934, y: 512, lng: 116.45, lat: 39.9 },
  { id: 'sc', name: '客户服务中心', address: '人民路 205 号', x: 452, y: 566, lng: 116.392, lat: 39.9 },
  { id: 'pl', name: '生产线一厂', address: '工业大道 7 号', x: 762, y: 636, lng: 116.442, lat: 39.895 },
  { id: 'br', name: '滨江办事处', address: '滨江路 66 号', x: 208, y: 448, lng: 116.38, lat: 39.905 },
]

const modalRef = ref<ModalInst | null>(null)
const picked = ref<LocationPoint | null>(null)
const mapEl = ref<HTMLElement | null>(null)

/** 配了 Key 就用高德，没配或加载失败就用内置示意地图（CI、演示环境走这条） */
const realMapFailed = ref(false)
const isRealMap = computed(() => hasAMapKey() && !realMapFailed.value)
const mapLoading = ref(false)

let amap: any = null
let marker: any = null
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

  if (isRealMap.value)
    nextTick(() => initRealMap())
}

function pick(point: LocationPoint) {
  picked.value = point
}

async function initRealMap() {
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
      dropMarker(picked.value.lng, picked.value.lat)

    // 点地图任意位置选点，再逆地理编码成地址
    amap.on('click', (event: any) => {
      const lng = Number(event.lnglat.getLng().toFixed(6))
      const lat = Number(event.lnglat.getLat().toFixed(6))
      dropMarker(lng, lat)
      reverseGeocode(lng, lat)
    })
  }
  catch (error) {
    // Key 无效或网络不通时退回示意地图，别让用户卡在空白弹窗里
    realMapFailed.value = true
    amap = null
    toast.warning(`${(error as Error).message || '地图加载失败'}，已切换为示意地图`)
  }
  finally {
    mapLoading.value = false
  }
}

function dropMarker(lng: number, lat: number) {
  if (!amap)
    return
  if (marker)
    marker.setPosition([lng, lat])
  else
    marker = new (window as any).AMap.Marker({ position: [lng, lat], map: amap })
}

function reverseGeocode(lng: number, lat: number) {
  if (!geocoder)
    return
  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status !== 'complete' || !result?.regeocode) {
      picked.value = { id: `${lng},${lat}`, name: '自定义位置', address: `${lng}, ${lat}`, lng, lat }
      return
    }
    const info = result.regeocode
    picked.value = {
      id: `${lng},${lat}`,
      name: info.pois?.[0]?.name || info.formattedAddress || '自定义位置',
      address: info.formattedAddress || `${lng}, ${lat}`,
      lng,
      lat,
    }
  })
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
    <div class="map" :class="{ 'is-real': isRealMap }">
      <!-- 真实地图：高德 -->
      <div v-if="isRealMap" ref="mapEl" class="map__real" />
      <div v-if="isRealMap && mapLoading" class="map__loading">
        地图加载中…
      </div>

      <!-- 示意地图：没有配 Key 时使用 -->
      <div v-else-if="!isRealMap" class="map__canvas">
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
          点击标注选择打卡地点 · 未配置地图 Key，当前为示意地图
        </div>
      </div>

      <div v-if="isRealMap && !mapLoading" class="map__legend">
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
  // 地图用自己的配色，不跟页面卡片走：亮色下是浅色底图，暗色下是深蓝灰
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
