<script lang="ts" setup>
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { monitor as api } from '@/service/api/dashboard'

interface MonitorCard {
  code: string
  name: string
  total: number
  growth: number
  pending: number
  overdue: number
  health: number
  hours: number
}

interface MonitorOverview {
  updated: string
  months: string[]
  cards: MonitorCard[]
  trend: Array<{ name: string, data: number[] }>
  share: Array<{ name: string, value: number }>
  todo: Array<{ name: string, pending: number, overdue: number }>
  radar: { indicators: string[], current: number[], previous: number[] }
  top: Array<{ module: string, name: string, value: number }>
}

/** 每个一级模块固定一种颜色，便于跨图表对应 */
const MODULE_COLORS: Record<string, string> = {
  客户与项目: '#2BA8E8',
  人力资源: '#F97316',
  费用管理: '#E9A020',
  资产管理: '#22B99A',
  财务核算: '#E8635F',
  文档中心: '#8B6BE8',
}

const FALLBACK_COLOR = '#8B93A7'

function emptyOverview(): MonitorOverview {
  return {
    updated: '',
    months: [],
    cards: [],
    trend: [],
    share: [],
    todo: [],
    radar: { indicators: [], current: [], previous: [] },
    top: [],
  }
}

const loading = ref(true)
const overview = ref<MonitorOverview>(emptyOverview())

const trendRef = ref<HTMLDivElement | null>(null)
const shareRef = ref<HTMLDivElement | null>(null)
const todoRef = ref<HTMLDivElement | null>(null)
const radarRef = ref<HTMLDivElement | null>(null)
const topRef = ref<HTMLDivElement | null>(null)

const { setOptions: setTrend, getInstance: trendChart } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setShare, getInstance: shareChart } = useECharts(shareRef as Ref<HTMLDivElement>)
const { setOptions: setTodo, getInstance: todoChart } = useECharts(todoRef as Ref<HTMLDivElement>)
const { setOptions: setRadar, getInstance: radarChart } = useECharts(radarRef as Ref<HTMLDivElement>)
const { setOptions: setTop, getInstance: topChart } = useECharts(topRef as Ref<HTMLDivElement>)

const colorOf = (name: string) => MODULE_COLORS[name] ?? FALLBACK_COLOR

const palette = computed(() => overview.value.cards.map(item => colorOf(item.name)))

const formatNumber = (value: number) => Number(value || 0).toLocaleString('zh-CN')

const totalVolume = computed(() =>
  overview.value.share.reduce((sum, item) => sum + item.value, 0),
)

/** 12 个月业务量趋势：每个一级模块一条线 */
async function renderTrend() {
  const chart = trendChart()
  chart?.showLoading()

  const { months, trend } = overview.value
  const option: EChartsOption = {
    color: palette.value,
    grid: { top: 46, left: 8, right: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { opacity: 0.3 } },
      valueFormatter: value => `${formatNumber(Number(value ?? 0))} 笔`,
    },
    legend: {
      top: 4,
      type: 'scroll',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11 },
    },
    series: trend.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: { focus: 'series' },
      data: item.data,
    })),
  }

  await setTrend(option)
  chart?.hideLoading()
}

/** 本月业务量占比：环形图 */
async function renderShare() {
  const chart = shareChart()
  chart?.showLoading()

  const option: EChartsOption = {
    color: palette.value,
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c} 笔（{d}%）',
    },
    legend: {
      bottom: 0,
      left: 'center',
      type: 'plain',
      width: '92%',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 10,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: '业务量',
        type: 'pie',
        radius: ['54%', '72%'],
        center: ['50%', '48%'],
        avoidLabelOverlap: true,
        padAngle: 1,
        labelLine: { show: false },
        itemStyle: { borderRadius: 6 },
        // 合计文字用「中心标签」而不是 title：title 只能按百分比定 top，
        // 换字号或卡片高度变化时就会偏离圆心；position: 'center' 由 ECharts 精确对齐扇形圆心。
        label: { show: false },
        data: overview.value.share.map((item, index) => ({
          ...item,
          label: index === 0
            ? {
                show: true,
                position: 'center' as const,
                formatter: `{total|${formatNumber(totalVolume.value)}}\n{caption|本月合计（笔）}`,
                rich: {
                  total: { fontSize: 22, fontWeight: 600, lineHeight: 34 },
                  caption: { fontSize: 12, lineHeight: 20, opacity: 0.65 },
                },
              }
            : { show: false },
        })),
      },
    ],
  }

  await setShare(option)
  chart?.hideLoading()
}

/** 待办与超期：横向堆叠条形图 */
async function renderTodo() {
  const chart = todoChart()
  chart?.showLoading()

  const { todo } = overview.value
  const option: EChartsOption = {
    color: ['#F97316', '#E8635F'],
    grid: { top: 40, left: 8, right: 28, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      top: 4,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { fontSize: 12 },
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: todo.map(item => item.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        name: '待处理',
        type: 'bar',
        stack: 'total',
        barWidth: 14,
        itemStyle: { borderRadius: [4, 0, 0, 4] },
        data: todo.map(item => item.pending),
      },
      {
        name: '已超期',
        type: 'bar',
        stack: 'total',
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          // 超期为 0 时不显示数值，避免一排「0」干扰阅读
          formatter: (params: any) => (params.value ? String(params.value) : ''),
        },
        data: todo.map(item => item.overdue),
      },
    ],
  }

  await setTodo(option)
  chart?.hideLoading()
}

/** 模块健康度：雷达图，本月与上月对比 */
async function renderRadar() {
  const chart = radarChart()
  chart?.showLoading()

  const { radar } = overview.value
  const option: EChartsOption = {
    color: ['#F97316', '#22B99A'],
    tooltip: { trigger: 'item' },
    legend: {
      top: 4,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { fontSize: 12 },
    },
    radar: {
      center: ['50%', '56%'],
      radius: '62%',
      splitNumber: 4,
      indicator: radar.indicators.map(name => ({ name, max: 100, min: 50 })),
      axisName: { fontSize: 12 },
      splitLine: { lineStyle: { opacity: 0.25 } },
      splitArea: { show: false },
      axisLine: { lineStyle: { opacity: 0.25 } },
    },
    series: [
      {
        type: 'radar',
        symbolSize: 4,
        areaStyle: { opacity: 0.18 },
        data: [
          { value: radar.current, name: '本月达标率' },
          { value: radar.previous, name: '上月达标率' },
        ],
      },
    ],
  }

  await setRadar(option)
  chart?.hideLoading()
}

/** 二级业务量 TOP 10：横向条形图 */
async function renderTop() {
  const chart = topChart()
  chart?.showLoading()

  const list = [...overview.value.top].reverse()
  const option: EChartsOption = {
    grid: { top: 16, left: 8, right: 56, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params?.[0]
        return item ? `${item.name}<br/>业务量 ${formatNumber(item.value)} 笔` : ''
      },
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: list.map(item => item.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 12,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (params: any) => colorOf(list[params.dataIndex]?.module ?? ''),
        },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          formatter: (params: any) => formatNumber(params.value),
        },
        data: list.map(item => item.value),
      },
    ],
  }

  await setTop(option)
  chart?.hideLoading()
}

async function renderCharts() {
  await Promise.all([renderTrend(), renderShare(), renderTodo(), renderRadar(), renderTop()])
}

async function load() {
  loading.value = true
  const { isSuccess, data } = await api.getOverview()
  if (isSuccess && data) {
    overview.value = data as unknown as MonitorOverview
    await renderCharts()
  }
  loading.value = false
}

onMounted(() => {
  setTimeout(load, 120)
})
</script>

<script lang="ts">
export default { name: 'DashboardMonitor' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="monitor-head">
      <div>
        <h3 class="monitor-head__title">
          业务监控台
        </h3>
        <p class="monitor-head__desc">
          按一级导航汇总近 12 个月业务量、待办超期与处理健康度 · 数据更新于 {{ overview.updated || '—' }}
        </p>
      </div>
      <n-button size="small" type="primary" secondary :loading="loading" @click="load">
        刷新数据
      </n-button>
    </div>

    <n-grid cols="2 s:3 m:6" responsive="screen" :x-gap="12" :y-gap="12">
      <n-gi v-for="item in overview.cards" :key="item.code">
        <n-card :bordered="false" size="small" class="kpi">
          <div class="kpi__head">
            <span class="kpi__dot" :style="{ background: colorOf(item.name) }" />
            <span class="kpi__name">{{ item.name }}</span>
            <n-tag size="tiny" :bordered="false" :type="item.growth >= 0 ? 'success' : 'error'">
              {{ item.growth >= 0 ? '+' : '' }}{{ item.growth }}%
            </n-tag>
          </div>
          <div class="kpi__value">
            {{ formatNumber(item.total) }}<em>笔</em>
          </div>
          <div class="kpi__meta">
            <span>待办 {{ item.pending }}</span>
            <span :class="{ 'is-warn': item.overdue > 0 }">超期 {{ item.overdue }}</span>
          </div>
          <div class="kpi__health">
            <span>健康度 {{ item.health }}</span>
            <span>平均 {{ item.hours }}h</span>
          </div>
          <n-progress
            type="line"
            :percentage="item.health"
            :height="4"
            :show-indicator="false"
            :color="colorOf(item.name)"
            rail-color="rgba(128, 128, 128, 0.2)"
          />
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid cols="12 s:12 m:24 l:24 xl:24 2xl:24" responsive="screen" :x-gap="12" :y-gap="12" class="mt-3">
      <n-gi span="24 m:16">
        <n-card :bordered="false" title="近 12 个月业务量趋势" size="small">
          <div ref="trendRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:8">
        <n-card :bordered="false" title="本月业务量占比" size="small">
          <div ref="shareRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:12">
        <n-card :bordered="false" title="待办与超期分布" size="small">
          <div ref="todoRef" style="height: 300px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:12">
        <n-card :bordered="false" title="模块健康度（本月 / 上月）" size="small">
          <div ref="radarRef" style="height: 300px" />
        </n-card>
      </n-gi>
      <n-gi span="24">
        <n-card :bordered="false" title="二级业务量 TOP 10" size="small">
          <div ref="topRef" style="height: 320px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.monitor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.6;
  }
}

.kpi {
  height: 100%;

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
  }

  &__name {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
  }

  &__value {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 600;
    line-height: 30px;

    em {
      margin-left: 2px;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      opacity: 0.55;
    }
  }

  &__meta {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.55);

    .is-warn {
      color: #d9532b;
      font-weight: 500;
    }
  }

  &__health {
    display: flex;
    justify-content: space-between;
    margin: 10px 0 6px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
}

// 暗色下改用浅色文字，避免半透明黑在深色卡片上失去对比度
html.dark .kpi__meta {
  color: rgba(255, 255, 255, 0.66);

  .is-warn {
    color: #ff8867;
  }
}

html.dark .kpi__health {
  color: rgba(255, 255, 255, 0.55);
}
</style>
