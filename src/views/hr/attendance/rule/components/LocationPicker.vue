<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import type { PlaceCandidate } from '@/utils/geocode'
import { Collection } from 'ol'
import { defaults as defaultControls, Zoom } from 'ol/control'
import Feature from 'ol/Feature'
import Circle from 'ol/geom/Circle'
import Point from 'ol/geom/Point'
import Translate from 'ol/interaction/Translate'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import Map from 'ol/Map'
import { fromLonLat, toLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import View from 'ol/View'
import { getAmapJsConfig, setAmapJsConfig, verifyAmapJs } from '@/utils/amap-js'
import { formatDistance, hasAmapKey, searchByKeyword, searchNearby, setAmapKey, verifyAmapKey } from '@/utils/geocode'
import toast from '@/utils/toast'
import 'ol/ol.css'

/**
 * 打卡地点选择
 *
 * 交互参考 aio-pc 的 scope 组件（ol 地图 + 落点 + 半径圈 + 拖拽微调），
 * 但那边的地址来自后端 regeo，这里改成同时打 Photon / Nominatim 拿到
 * 「附近的一串候选」，点哪个算哪个 —— 不再由程序猜一个地名。
 */
export interface LocationPoint {
  name: string
  address: string
  lng: number
  lat: number
  /** 打卡范围（米） */
  radius?: number
}

const emit = defineEmits<{ (e: 'confirm', value: LocationPoint): void }>()

const modalRef = ref<ModalInst | null>(null)
const mapEl = ref<HTMLElement | null>(null)

const radius = ref(300)
const candidates = ref<PlaceCandidate[]>([])
const selectedId = ref('')
const manualName = ref('')
const keyword = ref('')
const loading = ref(false)
/** 数据源：js = Web端 JS API（Key+安全密钥），rest = Web服务 Key，空 = OSM */
const amapMode = ref<'js' | 'rest' | ''>(getAmapJsConfig() ? 'js' : (hasAmapKey() ? 'rest' : ''))
const usingAmap = computed(() => Boolean(amapMode.value))
const keyInput = ref('')
const securityInput = ref('')
const keySaving = ref(false)

const current = ref<{ lng: number, lat: number }>({ lng: 116.404, lat: 39.915 })
const hasPoint = ref(false)

let olMap: Map | null = null
let markerFeature: Feature<Point> | null = null
let circleFeature: Feature<Circle> | null = null

function open(point?: LocationPoint | null) {
  reset(point)
  modalRef.value?.setProps({
    title: '选择打卡地点',
    width: '90vw',
    height: '90vh',
    showFooter: false,
  })
  modalRef.value?.open()
  nextTick(() => initMap())
}

function reset(point?: LocationPoint | null) {
  candidates.value = []
  selectedId.value = ''
  manualName.value = point?.name ?? ''
  keyword.value = ''
  radius.value = point?.radius ?? 300
  hasPoint.value = Boolean(point?.lng)
  current.value = {
    lng: point?.lng ?? 116.404,
    lat: point?.lat ?? 39.915,
  }
}

/* ==================== 地图 ==================== */

function initMap() {
  if (!mapEl.value)
    return

  if (olMap) {
    olMap.setTarget(mapEl.value)
    setTimeout(() => olMap?.updateSize(), 120)
    return
  }

  const source = new VectorSource()
  const layer = new VectorLayer({
    source,
    style: (feature) => {
      if (feature.get('kind') === 'circle') {
        return new Style({
          stroke: new Stroke({ width: 2, color: 'rgba(249, 115, 22, 0.6)' }),
          fill: new Fill({ color: 'rgba(249, 115, 22, 0.12)' }),
        })
      }
      return new Style({
        image: new CircleStyle({
          radius: 9,
          fill: new Fill({ color: '#f97316' }),
          stroke: new Stroke({ color: '#ffffff', width: 3 }),
        }),
      })
    },
  })

  const tileLayer = new TileLayer({
    source: new XYZ({
      url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      crossOrigin: 'Anonymous',
      wrapX: true,
    }),
  })

  olMap = new Map({
    target: mapEl.value,
    layers: [tileLayer, layer],
    controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([
      new Zoom({ zoomInTipLabel: '放大', zoomOutTipLabel: '缩小' }),
    ]),
    view: new View({
      center: fromLonLat([current.value.lng, current.value.lat]),
      zoom: 16,
      minZoom: 4,
      maxZoom: 18,
    }),
  })

  markerFeature = new Feature({ kind: 'marker' })
  circleFeature = new Feature({ kind: 'circle' })
  source.addFeature(circleFeature)
  source.addFeature(markerFeature)

  // 拖拽 marker 微调位置（aio-pc 的 scope 组件也是这么做的）
  const translate = new Translate({ features: new Collection([markerFeature]) })
  translate.on('translateend', () => {
    const geometry = markerFeature?.getGeometry()
    if (!geometry)
      return
    const [lng, lat] = toLonLat(geometry.getCoordinates())
    applyPoint(Number(lng.toFixed(6)), Number(lat.toFixed(6)), { moveMarker: false })
  })
  olMap.addInteraction(translate)

  olMap.on('singleclick', (event) => {
    const [lng, lat] = toLonLat(event.coordinate)
    applyPoint(Number(lng.toFixed(6)), Number(lat.toFixed(6)))
  })

  setTimeout(() => olMap?.updateSize(), 150)

  if (hasPoint.value)
    applyPoint(current.value.lng, current.value.lat, { moveMarker: true })
  else
    setCircle(current.value.lng, current.value.lat)
}

/** 落点 + 圆 + 拉候选 */
function applyPoint(lng: number, lat: number, options: { moveMarker?: boolean, keepSelection?: boolean } = {}) {
  const { moveMarker = true, keepSelection = false } = options

  current.value = { lng, lat }
  hasPoint.value = true

  if (moveMarker && markerFeature) {
    const coord = fromLonLat([lng, lat])
    markerFeature.setGeometry(new Point(coord))
    olMap?.getView().setCenter(coord)
  }

  setCircle(lng, lat)

  if (!keepSelection) {
    selectedId.value = ''
    manualName.value = ''
  }

  loadNearby(lng, lat)
}

function setCircle(lng: number, lat: number) {
  if (!circleFeature)
    return
  circleFeature.setGeometry(new Circle(fromLonLat([lng, lat]), radius.value))
}

function updateCircle(value: number | null) {
  radius.value = value ?? 300
  if (hasPoint.value)
    setCircle(current.value.lng, current.value.lat)
}

/* ==================== 候选 ==================== */

let controller: AbortController | null = null

async function loadNearby(lng: number, lat: number) {
  controller?.abort()
  const currentController = new AbortController()
  controller = currentController

  loading.value = true
  try {
    const list = await searchNearby(lng, lat, { signal: currentController.signal, limit: 8 })
    if (currentController.signal.aborted)
      return
    candidates.value = list
    // 默认选中最近的一个，但不写回名称 —— 由用户确认
    if (list.length) {
      selectedId.value = list[0]!.id
      manualName.value = list[0]!.name
    }
  }
  finally {
    if (controller === currentController)
      loading.value = false
  }
}

async function doSearch() {
  if (!keyword.value.trim()) {
    toast.info('输入地点名称再搜索')
    return
  }
  loading.value = true
  try {
    const list = await searchByKeyword(keyword.value.trim(), current.value, { limit: 8 })
    candidates.value = list
    if (!list.length) {
      toast.warning('没搜到，换个关键词试试')
      return
    }
    selectedId.value = list[0]!.id
    manualName.value = list[0]!.name
    olMap?.getView().setCenter(fromLonLat([list[0]!.lng, list[0]!.lat]))
  }
  finally {
    loading.value = false
  }
}

function select(item: PlaceCandidate) {
  selectedId.value = item.id
  manualName.value = item.name
  // 选中候选后把点挪到它的真实位置，半径圈跟着走
  applyPoint(item.lng, item.lat, { keepSelection: true })
}

/* ==================== 数据源 ==================== */

async function saveKey() {
  const key = keyInput.value.trim()
  const security = securityInput.value.trim()

  if (!key) {
    setAmapKey('')
    setAmapJsConfig(null)
    amapMode.value = ''
    toast.success('已切回 OpenStreetMap 数据')
    reloadCandidates()
    return
  }

  keySaving.value = true
  try {
    // 填了安全密钥说明是「Web 端 (JS API)」类型的 Key，走 SDK
    if (security) {
      const result = await verifyAmapJs({ key, securityCode: security })
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      setAmapJsConfig({ key, securityCode: security })
      setAmapKey('')
      amapMode.value = 'js'
    }
    else {
      const result = await verifyAmapKey(key)
      if (!result.ok) {
        toast.error(`${result.message}。如果 Key 是「Web 端 (JS API)」类型，请同时填安全密钥`)
        return
      }
      setAmapKey(key)
      setAmapJsConfig(null)
      amapMode.value = 'rest'
    }

    keyInput.value = ''
    securityInput.value = ''
    toast.success('已切换到高德数据，地名会精确到门牌')
    reloadCandidates()
  }
  finally {
    keySaving.value = false
  }
}

function reloadCandidates() {
  if (hasPoint.value)
    loadNearby(current.value.lng, current.value.lat)
}

/* ==================== 确定 ==================== */

function confirm() {
  if (!hasPoint.value) {
    toast.warning('请先在地图上点一个位置')
    return
  }

  const selected = candidates.value.find(item => item.id === selectedId.value)
  const name = manualName.value.trim() || selected?.name || '自定义位置'
  const address = selected?.address
    || `${current.value.lat.toFixed(5)}, ${current.value.lng.toFixed(5)}`

  emit('confirm', {
    name,
    address,
    lng: current.value.lng,
    lat: current.value.lat,
    radius: radius.value,
  })
  modalRef.value?.close()
}

function close() {
  modalRef.value?.close()
}

defineExpose({ open })
</script>

<template>
  <SpModal ref="modalRef" :show-footer="false" :mask-closable="false" @close="controller?.abort()">
    <div class="picker">
      <!-- 顶部工具条：搜索 / 范围 / 坐标 / 操作 -->
      <div class="picker__bar">
        <n-input-group class="picker__search">
          <n-input
            v-model:value="keyword"
            placeholder="搜索地点名称，如「国贸」"
            clearable
            @keyup.enter="doSearch"
          />
          <n-button type="primary" ghost @click="doSearch">
            搜索
          </n-button>
        </n-input-group>

        <span class="picker__field">
          <span class="picker__label">打卡范围</span>
          <n-input-number
            v-model:value="radius"
            :min="50"
            :max="5000"
            :step="50"
            :show-button="false"
            class="picker__radius"
            @update:value="updateCircle"
          >
            <template #suffix>
              米
            </template>
          </n-input-number>
        </span>

        <span class="picker__coord">
          {{ current.lng.toFixed(5) }}, {{ current.lat.toFixed(5) }}
        </span>

        <n-popover trigger="click" placement="bottom-end" :width="340">
          <template #trigger>
            <n-button text type="primary" size="small" class="picker__source">
              <template #icon>
                <Icon :icon="usingAmap ? 'ant-design:check-circle-filled' : 'ant-design:info-circle-outlined'" />
              </template>
              {{ amapMode === 'js' ? '高德 · JS API' : (amapMode === 'rest' ? '高德 · Web服务' : 'OSM 数据') }}
            </n-button>
          </template>

          <div class="source">
            <p class="source__title">
              地名数据源
            </p>
            <p class="source__desc">
              <template v-if="usingAmap">
                当前走高德，门牌级地址 + 周边 POI。
              </template>
              <template v-else>
                当前走 OpenStreetMap 免费服务，国内 POI 覆盖有限，只能到街区 / 路名。
                填一个高德「Web 服务」Key 即可精确到门牌，免费额度够日常使用。
              </template>
            </p>
            <div class="source__form">
              <n-input v-model:value="keyInput" placeholder="Key" size="small" />
              <n-input v-model:value="securityInput" placeholder="安全密钥（Web端 JS API 必填）" size="small" />
            </div>
            <div class="source__actions">
              <n-button size="small" :loading="keySaving" type="primary" ghost @click="saveKey">
                {{ keyInput.trim() ? '保存并验证' : '清除' }}
              </n-button>
              <span class="source__hint">
                Key 与安全密钥都在
                <a href="https://console.amap.com/dev/key/app" target="_blank" rel="noreferrer">高德控制台</a>
                的 Key 详情里
              </span>
            </div>
          </div>
        </n-popover>

        <div class="picker__actions">
          <n-button @click="close">
            取消
          </n-button>
          <n-button type="primary" @click="confirm">
            确定
          </n-button>
        </div>
      </div>

      <div class="picker__body">
        <div class="picker__map-wrap">
          <div ref="mapEl" class="picker__map" />
          <div class="picker__hint">
            点击地图选点，圆点是打卡范围，标记可拖动微调
          </div>
        </div>

        <aside class="picker__side">
          <header class="picker__side-head">
            <span>附近地点</span>
            <em v-if="candidates.length">{{ candidates.length }}</em>
          </header>

          <div v-if="loading" class="picker__empty">
            正在查找附近的地点…
          </div>
          <div v-else-if="!candidates.length" class="picker__empty">
            这里没查到地名。<br>
            可以直接点确定保存坐标，或手动填一个名字。<br>
            <em v-if="!usingAmap">配一个高德 Key 能显著提升命中率</em>
          </div>
          <ul v-else class="place-list">
            <li
              v-for="item in candidates"
              :key="item.id"
              class="place-item"
              :class="{ 'is-active': item.id === selectedId }"
              @click="select(item)"
            >
              <div class="place-item__head">
                <b>{{ item.name }}</b>
                <em>{{ formatDistance(item.distance) }}</em>
              </div>
              <span class="place-item__addr">
                {{ item.address || '—' }}
              </span>
            </li>
          </ul>

          <div class="picker__manual">
            <span class="picker__label">地点名称</span>
            <n-input v-model:value="manualName" placeholder="选中候选，或直接填一个名字" />
          </div>
        </aside>
      </div>
    </div>
  </SpModal>
</template>

<style scoped lang="less">
.picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(90vh - 96px);

  &__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__search {
    width: 260px;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }

  &__radius {
    width: 120px;
  }

  &__coord {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--atlas-text-tertiary);
  }

  &__source {
    font-size: 12px;
    font-weight: 400;
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  &__body {
    display: flex;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  &__map-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
    border: 1px solid var(--atlas-border);
    border-radius: var(--atlas-radius-sm);
    overflow: hidden;
  }

  &__map {
    width: 100%;
    height: 100%;
    background: var(--atlas-surface-soft);
  }

  &__hint {
    position: absolute;
    left: 12px;
    bottom: 12px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: var(--atlas-text-secondary);
    background: color-mix(in srgb, var(--atlas-canvas) 90%, transparent);
    backdrop-filter: blur(4px);
    pointer-events: none;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 320px;
    flex: none;
    min-height: 0;
  }

  &__side-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--atlas-text);

    em {
      font-style: normal;
      font-size: 11px;
      padding: 1px 7px;
      border-radius: 999px;
      color: var(--atlas-text-tertiary);
      background: var(--atlas-surface-soft);
    }
  }

  &__empty {
    padding: 16px;
    border: 1px dashed var(--atlas-border);
    border-radius: var(--atlas-radius-sm);
    font-size: 12px;
    line-height: 1.7;
    color: var(--atlas-text-tertiary);
    text-align: center;
  }

  &__manual {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid var(--atlas-border);
  }
}

.source {
  padding: 4px 2px;

  &__title {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--atlas-text);
  }

  &__desc {
    margin: 0 0 10px;
    font-size: 12px;
    line-height: 1.65;
    color: var(--atlas-text-tertiary);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  &__hint {
    font-size: 11px;
    line-height: 1.5;
    color: var(--atlas-text-tertiary);

    a {
      color: var(--atlas-brand);
      text-decoration: none;
    }
  }
}

.picker__empty em {
  font-style: normal;
  color: var(--atlas-brand);
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0 2px 0 0;
  overflow-y: auto;
  list-style: none;
}

.place-item {
  padding: 9px 12px;
  border: 1px solid var(--atlas-border);
  border-radius: var(--atlas-radius-sm);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &__head {
    display: flex;
    align-items: baseline;
    gap: 8px;

    b {
      font-size: 13px;
      font-weight: 600;
      color: var(--atlas-text);
    }

    em {
      margin-left: auto;
      font-style: normal;
      font-size: 11px;
      color: var(--atlas-text-tertiary);
    }
  }

  &__addr {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--atlas-text-tertiary);
  }

  &:hover {
    border-color: var(--atlas-brand-ring);
    background: var(--atlas-surface-soft);
  }

  &.is-active {
    border-color: var(--atlas-brand);
    background: var(--atlas-brand-soft);

    b {
      color: var(--atlas-brand);
    }
  }
}
</style>

<!-- ol 自带的缩放控件在暗色下是白底，压一层适配 -->
<style lang="less">
.picker__map .ol-zoom {
  top: 10px;
  left: 10px;
  background: transparent;
  padding: 0;

  button {
    width: 28px;
    height: 28px;
    margin-bottom: 4px;
    border-radius: 6px;
    font-size: 16px;
    line-height: 1;
    color: var(--atlas-text-secondary);
    background: color-mix(in srgb, var(--atlas-canvas) 92%, transparent);
    border: 1px solid var(--atlas-border);
    box-shadow: 0 2px 6px rgb(0 0 0 / 8%);

    &:hover {
      color: var(--atlas-brand);
      border-color: var(--atlas-brand);
    }
  }
}

/* 暗色下瓦片压一点亮度 */
html.dark .picker__map canvas,
html[data-vxe-ui-theme='dark'] .picker__map canvas {
  filter: brightness(0.84) contrast(1.04) saturate(0.92);
}
</style>
