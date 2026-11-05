<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { analysis } from '@/service/api/finance'

interface AnalysisDashboard {
  updated: string
  months: string[]
  revenue: number[]
  cost: number[]
  expense: number[]
  profit: number[]
  gross_rate: number[]
  summary: {
    revenue: number
    profit: number
    gross_rate: number
    expense_rate: number
    expense_total: number
  }
  expense_share: Array<{ name: string, value: number }>
  dept_top: Array<{ name: string, value: number }>
}

const loading = ref(true)
const data = ref<AnalysisDashboard>({
  updated: '',
  months: [],
  revenue: [],
  cost: [],
  expense: [],
  profit: [],
  gross_rate: [],
  summary: { revenue: 0, profit: 0, gross_rate: 0, expense_rate: 0, expense_total: 0 },
  expense_share: [],
  dept_top: [],
})

const trendRef = ref<HTMLDivElement | null>(null)
const shareRef = ref<HTMLDivElement | null>(null)
const deptRef = ref<HTMLDivElement | null>(null)
const { setOptions: setTrend } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setShare } = useECharts(shareRef as Ref<HTMLDivElement>)
const { setOptions: setDept } = useECharts(deptRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = data.value
  return [
    { label: '近 12 个月收入', value: `¥ ${wan(summary.revenue)}`, hint: '含主营及其他业务收入', tone: '#2BA8E8' },
    { label: '近 12 个月净利', value: `¥ ${wan(summary.profit)}`, hint: '收入 - 成本 - 费用', tone: '#22B99A' },
    { label: '毛利率', value: `${summary.gross_rate.toFixed(2)}%`, hint: '（收入 - 成本）/ 收入', tone: '#8B6BE8' },
    { label: '费用率', value: `${summary.expense_rate.toFixed(2)}%`, hint: `累计费用 ${wan(summary.expense_total)}`, tone: '#F97316' },
  ]
})

async function renderTrend() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#8B93A7', '#F97316', '#22B99A'],
    grid: { top: 52, left: 8, right: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    legend: { top: 6, itemWidth: 10, itemHeight: 10, itemGap: 14, textStyle: { fontSize: 12 } },
    xAxis: {
      type: 'category',
      data: data.value.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
        axisLabel: { fontSize: 11, formatter: (value: number) => `${(value / 10000).toFixed(0)} 万` },
      },
      {
        type: 'value',
        name: '毛利率',
        min: 0,
        max: 60,
        splitLine: { show: false },
        axisLabel: { fontSize: 11, formatter: '{value}%' },
      },
    ],
    series: [
      { name: '收入', type: 'bar', barMaxWidth: 18, data: data.value.revenue },
      { name: '成本', type: 'bar', barMaxWidth: 18, data: data.value.cost },
      { name: '费用', type: 'bar', barMaxWidth: 18, data: data.value.expense },
      {
        name: '毛利率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        data: data.value.gross_rate,
      },
    ],
  }
  await setTrend(option)
}

async function renderShare() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#F97316', '#8B6BE8', '#E9A020'],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>¥ ${(Number(params.value) / 10000).toFixed(1)} 万（${params.percent}%）`,
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 10,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['44%', '68%'],
        center: ['50%', '44%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        data: data.value.expense_share,
      },
    ],
  }
  await setShare(option)
}

async function renderDept() {
  const rows = [...data.value.dept_top].reverse()
  const option: EChartsOption = {
    color: ['#2BA8E8'],
    grid: { top: 12, left: 8, right: 32, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11, formatter: (value: number) => `${(value / 10000).toFixed(0)} 万` },
    },
    yAxis: {
      type: 'category',
      data: rows.map(item => item.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        data: rows.map(item => item.value),
      },
    ],
  }
  await setDept(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await analysis.dashboard()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as AnalysisDashboard
  await nextTick()
  renderTrend()
  renderShare()
  renderDept()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'FinanceAnalysisDashboard' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="fin-head">
      <div>
        <h3 class="fin-head__title">
          经营看板
        </h3>
        <p class="fin-head__desc">
          收入、成本、费用与毛利的中期走势 · 数据更新于 {{ data.updated || '—' }}
        </p>
      </div>
      <n-button size="small" type="primary" secondary :loading="loading" @click="load">
        刷新数据
      </n-button>
    </div>

    <n-grid cols="1 s:2 m:4" responsive="screen" :x-gap="12" :y-gap="12">
      <n-gi v-for="item in cards" :key="item.label">
        <n-card :bordered="false" size="small" class="stat">
          <div class="stat__head">
            <span class="stat__dot" :style="{ background: item.tone }" />
            <span>{{ item.label }}</span>
          </div>
          <div class="stat__value">
            {{ item.value }}
          </div>
          <div class="stat__hint">
            {{ item.hint }}
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid cols="12 s:12 m:24" responsive="screen" :x-gap="12" :y-gap="12" class="mt-3">
      <n-gi span="24 m:16">
        <n-card :bordered="false" title="近 12 个月收入 · 成本 · 费用" size="small">
          <div ref="trendRef" style="height: 340px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:8">
        <n-card :bordered="false" title="费用结构" size="small">
          <div ref="shareRef" style="height: 340px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:24">
        <n-card :bordered="false" title="部门费用 TOP 6" size="small">
          <div ref="deptRef" style="height: 240px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.fin-head {
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

.stat {
  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    opacity: 0.8;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;
  }

  &__value {
    margin-top: 10px;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
  }

  &__hint {
    margin-top: 2px;
    font-size: 12px;
    opacity: 0.55;
  }
}
</style>
