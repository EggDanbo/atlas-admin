<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { report } from '@/service/api/asset'

interface AssetDashboard {
  updated: string
  summary: {
    total: number
    active: number
    original_amount: number
    net_amount: number
    monthly_dep: number
    net_rate: number
  }
  months: string[]
  dep_series: number[]
  category_share: Array<{ name: string, value: number }>
  state_share: Array<{ name: string, value: number }>
}

const loading = ref(true)
const data = ref<AssetDashboard>({
  updated: '',
  summary: { total: 0, active: 0, original_amount: 0, net_amount: 0, monthly_dep: 0, net_rate: 0 },
  months: [],
  dep_series: [],
  category_share: [],
  state_share: [],
})

const depRef = ref<HTMLDivElement | null>(null)
const categoryRef = ref<HTMLDivElement | null>(null)
const stateRef = ref<HTMLDivElement | null>(null)
const { setOptions: setDep } = useECharts(depRef as Ref<HTMLDivElement>)
const { setOptions: setCategory } = useECharts(categoryRef as Ref<HTMLDivElement>)
const { setOptions: setState } = useECharts(stateRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = data.value
  return [
    { label: '资产总数', value: `${summary.total} 台`, hint: `在用 ${summary.active} 台`, tone: '#2BA8E8' },
    { label: '资产原值', value: `¥ ${wan(summary.original_amount)}`, hint: '按购置价汇总', tone: '#22B99A' },
    { label: '资产净值', value: `¥ ${wan(summary.net_amount)}`, hint: `净值率 ${summary.net_rate}%`, tone: '#8B6BE8' },
    { label: '本月折旧', value: `¥ ${wan(summary.monthly_dep)}`, hint: '年限平均法计提', tone: '#F97316' },
  ]
})

async function renderDep() {
  const option: EChartsOption = {
    color: ['#F97316'],
    grid: { top: 24, left: 8, right: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    xAxis: {
      type: 'category',
      data: data.value.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(1)} 万` },
    },
    series: [
      {
        name: '折旧计提',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.14 },
        data: data.value.dep_series,
      },
    ],
  }
  await setDep(option)
}

async function renderCategory() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#F97316', '#8B6BE8', '#E9A020'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 台（{d}%）' },
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
        radius: ['42%', '66%'],
        center: ['50%', '44%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        data: data.value.category_share,
      },
    ],
  }
  await setCategory(option)
}

async function renderState() {
  const option: EChartsOption = {
    color: ['#2BA8E8'],
    grid: { top: 24, left: 8, right: 24, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: data.value.state_share.map(item => item.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', fontSize: 11 },
        data: data.value.state_share.map(item => item.value),
      },
    ],
  }
  await setState(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await report.dashboard()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as AssetDashboard
  await nextTick()
  renderDep()
  renderCategory()
  renderState()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'AssetReportDashboard' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="asset-head">
      <div>
        <h3 class="asset-head__title">
          资产看板
        </h3>
        <p class="asset-head__desc">
          原值与净值、类别与状态结构、折旧趋势 · 数据更新于 {{ data.updated || '—' }}
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
      <n-gi span="24 m:15">
        <n-card :bordered="false" title="近 12 个月折旧计提" size="small">
          <div ref="depRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="资产类别分布" size="small">
          <div ref="categoryRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:24">
        <n-card :bordered="false" title="资产状态结构" size="small">
          <div ref="stateRef" style="height: 230px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.asset-head {
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
