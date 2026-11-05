<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { billing } from '@/service/api/crm'

interface RevenueData {
  updated: string
  summary: {
    invoice_total: number
    receipt_total: number
    receivable: number
    receipt_rate: number
    customer_count: number
  }
  months: string[]
  invoice_series: number[]
  receipt_series: number[]
  ranking: Array<{ name: string, value: number, level: string }>
}

const loading = ref(true)
const data = ref<RevenueData>({
  updated: '',
  summary: { invoice_total: 0, receipt_total: 0, receivable: 0, receipt_rate: 0, customer_count: 0 },
  months: [],
  invoice_series: [],
  receipt_series: [],
  ranking: [],
})

const trendRef = ref<HTMLDivElement | null>(null)
const rankRef = ref<HTMLDivElement | null>(null)
const { setOptions: setTrend } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setRank } = useECharts(rankRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = data.value
  return [
    { label: '累计开票', value: `¥ ${wan(summary.invoice_total)}`, hint: `覆盖 ${summary.customer_count} 家客户`, tone: '#2BA8E8' },
    { label: '累计回款', value: `¥ ${wan(summary.receipt_total)}`, hint: `回款率 ${summary.receipt_rate}%`, tone: '#22B99A' },
    { label: '未回款', value: `¥ ${wan(summary.receivable)}`, hint: '开票 - 回款', tone: '#F97316' },
    { label: '回款率', value: `${summary.receipt_rate}%`, hint: '低于 80% 需重点跟进', tone: '#8B6BE8' },
  ]
})

async function renderTrend() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A'],
    grid: { top: 48, left: 8, right: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    legend: { top: 6, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12 } },
    xAxis: {
      type: 'category',
      data: data.value.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
    },
    series: [
      { name: '开票', type: 'bar', barMaxWidth: 18, itemStyle: { borderRadius: 3 }, data: data.value.invoice_series },
      { name: '回款', type: 'bar', barMaxWidth: 18, itemStyle: { borderRadius: 3 }, data: data.value.receipt_series },
    ],
  }
  await setTrend(option)
}

async function renderRank() {
  const rows = [...data.value.ranking].reverse()
  const option: EChartsOption = {
    grid: { top: 8, left: 8, right: 60, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
    },
    yAxis: {
      type: 'category',
      data: rows.map(item => (item.name.length > 12 ? `${item.name.slice(0, 12)}…` : item.name)),
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0], color: '#22B99A' },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          formatter: (params: any) => `${(Number(params.value) / 10000).toFixed(0)} 万`,
        },
        data: rows.map(item => item.value),
      },
    ],
  }
  await setRank(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await billing.revenue()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as RevenueData
  await nextTick()
  renderTrend()
  renderRank()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'CrmBillingRevenue' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="crm-head">
      <div>
        <h3 class="crm-head__title">
          客户收入
        </h3>
        <p class="crm-head__desc">
          开票与回款的月度走势、客户回款排行 · 数据更新于 {{ data.updated || '—' }}
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
        <n-card :bordered="false" title="近 12 个月开票与回款" size="small">
          <div ref="trendRef" style="height: 330px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="客户回款 TOP 8" size="small">
          <div ref="rankRef" style="height: 330px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.crm-head {
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
