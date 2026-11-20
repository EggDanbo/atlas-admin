<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'

/**
 * 运营数据大屏
 *
 * 独立路由 /dashboard/screen，深色固定配色（大屏通常投在电视上，不跟明暗主题）。
 * 数据全部走本地 mock，不依赖接口，保证演示时不空屏。
 */
defineOptions({ name: 'DashboardScreen' })

const clock = ref('')
let clockTimer: number | undefined

const trendRef = ref<HTMLDivElement | null>(null)
const rankRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)

const { setOptions: setTrend } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setRank } = useECharts(rankRef as Ref<HTMLDivElement>)
const { setOptions: setPie } = useECharts(pieRef as Ref<HTMLDivElement>)

const mapEl = ref<HTMLDivElement | null>(null)
const mapReady = shallowRef(false)
let olMap: any = null

/* ==================== 指标 ==================== */

const metrics = [
  { label: '资产总数', value: 12846, unit: '件', trend: +8.2, icon: 'ant-design:database-outlined' },
  { label: '在库资产', value: 10632, unit: '件', trend: +3.1, icon: 'ant-design:inbox-outlined' },
  { label: '维修中', value: 168, unit: '件', trend: -12.4, icon: 'ant-design:tool-outlined' },
  { label: '活跃客户', value: 3268, unit: '家', trend: +5.6, icon: 'ant-design:team-outlined' },
]

const DAYS = ['11-15', '11-16', '11-17', '11-18', '11-19', '11-20', '11-21']
const SUBMITTED = [42, 56, 38, 64, 51, 72, 46]
const APPROVED = [36, 48, 41, 55, 47, 63, 39]

const RANK = [
  { name: '华东区', value: 2864 },
  { name: '华南区', value: 2143 },
  { name: '华北区', value: 1876 },
  { name: '西南区', value: 1245 },
  { name: '西北区', value: 863 },
]

const PIE = [
  { name: '电子设备', value: 4280 },
  { name: '办公家具', value: 3160 },
  { name: '车辆', value: 1980 },
  { name: '工具器械', value: 1650 },
  { name: '其他', value: 1776 },
]

/* ==================== 图表 ==================== */

function renderCharts() {
  const axisColor = 'rgba(255, 255, 255, 0.45)'
  const splitLine = 'rgba(255, 255, 255, 0.08)'

  const trendOption: EChartsOption = {
    color: ['#3BA7F0', '#35D3B0'],
    grid: { top: 34, left: 8, right: 12, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, itemWidth: 8, itemHeight: 8, textStyle: { color: axisColor, fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: DAYS,
      axisLine: { lineStyle: { color: splitLine } },
      axisTick: { show: false },
      axisLabel: { color: axisColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisColor, fontSize: 10 },
      splitLine: { lineStyle: { color: splitLine, type: 'dashed' } },
    },
    series: [
      {
        name: '提交',
        type: 'line',
        smooth: true,
        symbolSize: 5,
        areaStyle: { opacity: 0.18 },
        data: SUBMITTED,
      },
      {
        name: '办结',
        type: 'line',
        smooth: true,
        symbolSize: 5,
        areaStyle: { opacity: 0.12 },
        data: APPROVED,
      },
    ],
  }

  const rankOption: EChartsOption = {
    grid: { top: 6, left: 8, right: 36, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      data: RANK.map(item => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
    },
    series: [{
      type: 'bar',
      barWidth: 12,
      itemStyle: { borderRadius: 6, color: '#3BA7F0' },
      label: { show: true, position: 'right', color: 'rgba(255,255,255,0.65)', fontSize: 10 },
      data: RANK.map(item => item.value),
    }],
  }

  const pieOption: EChartsOption = {
    color: ['#3BA7F0', '#35D3B0', '#F0B34B', '#8B7CF6', '#5B6B85'],
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'center',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    },
    series: [{
      type: 'pie',
      radius: ['46%', '68%'],
      center: ['34%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#0d1526', borderWidth: 2 },
      label: { show: false },
      data: PIE,
    }],
  }

  setTrend(trendOption)
  setRank(rankOption)
  setPie(pieOption)
}

/* ==================== 地图 ==================== */

const POINTS = [
  { name: '华东仓', lng: 121.4737, lat: 31.2304, value: 2864 },
  { name: '华南仓', lng: 113.2644, lat: 23.1291, value: 2143 },
  { name: '华北仓', lng: 116.4074, lat: 39.9042, value: 1876 },
  { name: '西南仓', lng: 104.0665, lat: 30.5728, value: 1245 },
  { name: '西北仓', lng: 108.9480, lat: 34.2632, value: 863 },
]

async function initMap() {
  if (!mapEl.value || olMap)
    return

  const [
    { default: OlMap },
    { default: View },
    { default: TileLayer },
    { default: VectorLayer },
    { default: VectorSource },
    { default: XYZ },
    { default: Feature },
    { default: Point },
    { fromLonLat },
    { Circle: CircleStyle, Fill, Stroke, Style, Text },
  ] = await Promise.all([
    import('ol/Map'),
    import('ol/View'),
    import('ol/layer/Tile'),
    import('ol/layer/Vector'),
    import('ol/source/Vector'),
    import('ol/source/XYZ'),
    import('ol/Feature'),
    import('ol/geom/Point'),
    import('ol/proj'),
    import('ol/style'),
  ])

  const tileLayer = new TileLayer({
    className: 'screen-tile',
    source: new XYZ({
      url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      crossOrigin: 'Anonymous',
    }),
  })

  const source = new VectorSource()
  const max = Math.max(...POINTS.map(point => point.value))

  for (const point of POINTS) {
    const feature = new Feature({ geometry: new Point(fromLonLat([point.lng, point.lat])) })
    feature.set('label', point.name)
    source.addFeature(feature)
  }

  const pointLayer = new VectorLayer({
    source,
    style: (feature) => {
      const label = String(feature.get('label') ?? '')
      const size = POINTS.find(item => item.name === label)?.value ?? 0
      return new Style({
        image: new CircleStyle({
          radius: 6 + (size / max) * 10,
          fill: new Fill({ color: 'rgba(59, 167, 240, 0.55)' }),
          stroke: new Stroke({ color: '#3BA7F0', width: 2 }),
        }),
        text: new Text({
          text: label,
          offsetY: -20,
          font: '11px sans-serif',
          fill: new Fill({ color: 'rgba(255,255,255,0.85)' }),
        }),
      })
    },
  })

  olMap = new OlMap({
    target: mapEl.value,
    layers: [tileLayer, pointLayer],
    controls: [],
    view: new View({
      center: fromLonLat([108, 34]),
      zoom: 4,
      minZoom: 3,
      maxZoom: 8,
    }),
  })

  mapReady.value = true
  setTimeout(() => olMap?.updateSize(), 200)
}

/* ==================== 生命周期 ==================== */

function tick() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  clock.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function toggleFullscreen() {
  if (document.fullscreenElement)
    document.exitFullscreen()
  else
    document.documentElement.requestFullscreen?.()
}

function onResize() {
  olMap?.updateSize()
  for (const instance of [trendRef, rankRef, pieRef]) {
    const el = instance.value
    if (el)
      echarts.getInstanceByDom(el)?.resize()
  }
}

onMounted(() => {
  tick()
  clockTimer = window.setInterval(tick, 1000)
  renderCharts()
  initMap()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (clockTimer)
    window.clearInterval(clockTimer)
  window.removeEventListener('resize', onResize)
  olMap?.setTarget(undefined)
  olMap = null
})
</script>

<template>
  <div class="screen">
    <header class="screen__head">
      <div class="screen__brand">
        <span class="screen__dot" />
        一体化管理系统 · 运营数据大屏
      </div>
      <div class="screen__clock">
        {{ clock }}
        <button type="button" class="screen__full" @click="toggleFullscreen">
          <Icon icon="ant-design:fullscreen-outlined" />
        </button>
      </div>
    </header>

    <div class="screen__body">
      <!-- 左：指标 + 趋势 -->
      <section class="screen__col screen__col--left">
        <div class="metric-grid">
          <div v-for="item in metrics" :key="item.label" class="metric">
            <Icon :icon="item.icon" class="metric__icon" />
            <div class="metric__value">
              {{ item.value.toLocaleString() }}
              <em>{{ item.unit }}</em>
            </div>
            <div class="metric__foot">
              <span class="metric__label">{{ item.label }}</span>
              <span class="metric__trend" :class="item.trend > 0 ? 'is-up' : 'is-down'">
                {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
              </span>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel__title">
            近 7 天单据流转
          </div>
          <div ref="trendRef" class="panel__chart" />
        </div>
      </section>

      <!-- 中：地图 -->
      <section class="screen__col screen__col--center">
        <div class="panel panel--map">
          <div class="panel__title">
            区域资产分布
          </div>
          <div ref="mapEl" class="panel__map" />
        </div>
      </section>

      <!-- 右：排行 + 占比 -->
      <section class="screen__col screen__col--right">
        <div class="panel">
          <div class="panel__title">
            区域排行 Top 5
          </div>
          <div ref="rankRef" class="panel__chart panel__chart--rank" />
        </div>

        <div class="panel">
          <div class="panel__title">
            资产分类占比
          </div>
          <div ref="pieRef" class="panel__chart" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.screen {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 720px;
  padding: 16px;
  color: #e8eef7;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(59, 167, 240, 0.18), transparent 60%), #0d1526;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 4px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #35d3b0;
    box-shadow: 0 0 10px #35d3b0;
  }

  &__clock {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.6);
  }

  &__full {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    background: transparent;
    cursor: pointer;

    &:hover {
      color: #fff;
      border-color: rgba(59, 167, 240, 0.8);
    }
  }

  &__body {
    display: grid;
    flex: 1;
    gap: 12px;
    min-height: 0;
    grid-template-columns: 340px 1fr 340px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;

    &--center {
      min-width: 0;
    }
  }
}

.metric-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric {
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: linear-gradient(160deg, rgba(59, 167, 240, 0.14), rgba(59, 167, 240, 0.02));

  &__icon {
    font-size: 15px;
    color: #3ba7f0;
  }

  &__value {
    margin: 6px 0 4px;
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    em {
      margin-left: 3px;
      font-style: normal;
      font-size: 11px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.45);
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
  }

  &__label {
    color: rgba(255, 255, 255, 0.55);
  }

  &__trend.is-up {
    color: #35d3b0;
  }

  &__trend.is-down {
    color: #f0b34b;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 14px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);

  &--map {
    flex: 1;
  }

  &__title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.82);

    &::before {
      content: '';
      display: inline-block;
      width: 3px;
      height: 12px;
      margin-right: 7px;
      border-radius: 2px;
      vertical-align: -1px;
      background: #3ba7f0;
    }
  }

  &__chart {
    flex: 1;
    min-height: 160px;

    &--rank {
      min-height: 180px;
    }
  }

  &__map {
    flex: 1;
    min-height: 280px;
    overflow: hidden;
    border-radius: 8px;
    // 瓦片层单独反色（.screen-tile），散点和标签不受影响
  }
}

@media (max-width: 1280px) {
  .screen__body {
    grid-template-columns: 300px 1fr 300px;
  }
}
</style>

<!-- ol 的图层 div 由 SDK 创建，scoped 选择器匹配不到，单独放一个非 scoped 块 -->
<style lang="less">
/* 高德瓦片是浅色的，反色 + 转色相压成深色地图，和大屏底色融为一体 */
.screen-tile {
  filter: invert(0.92) hue-rotate(180deg) brightness(0.85) contrast(0.92) saturate(0.7);
}
</style>
