<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { report } from '@/service/api/purchase'

interface PurchaseDashboard {
  summary: {
    total_amount: number
    order_count: number
    supplier_count: number
    top3_share: number
    ontime_rate: number
    qualified_rate: number
  }
  months: string[]
  monthly_amount: number[]
  categories: Array<{ name: string, value: number }>
  supplier_rank: Array<{ name: string, value: number, rating: string }>
}

const loading = ref(true)
const data = ref<PurchaseDashboard>({
  summary: {
    total_amount: 0,
    order_count: 0,
    supplier_count: 0,
    top3_share: 0,
    ontime_rate: 0,
    qualified_rate: 0,
  },
  months: [],
  monthly_amount: [],
  categories: [],
  supplier_rank: [],
})

const trendRef = ref<HTMLDivElement | null>(null)
const categoryRef = ref<HTMLDivElement | null>(null)
const supplierRef = ref<HTMLDivElement | null>(null)
const { setOptions: setTrend } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setCategory } = useECharts(categoryRef as Ref<HTMLDivElement>)
const { setOptions: setSupplier } = useECharts(supplierRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

/**
 * 前三家占比是采购最该盯的数：超过 60% 说明把鸡蛋放在一个篮子里，
 * 对方涨价、断供都没有退路。
 */
const concentrateHint = computed(() => {
  const share = Number(data.value.summary.top3_share) || 0
  if (share >= 60)
    return { text: '过度集中，建议分散', tone: '#E8635F' }
  if (share >= 40)
    return { text: '集中度偏高', tone: '#F97316' }
  return { text: '结构健康', tone: '#22B99A' }
})

const cards = computed(() => [
  { label: '采购总额', value: `¥ ${wan(data.value.summary.total_amount)}`, hint: '近 12 个月订单汇总', tone: '#2BA8E8' },
  { label: '采购订单', value: `${data.value.summary.order_count} 单`, hint: `覆盖 ${data.value.categories.length} 个品类`, tone: '#22B99A' },
  { label: '合格供应商', value: `${data.value.summary.supplier_count} 家`, hint: `准时率 ${data.value.summary.ontime_rate}%`, tone: '#8B6BE8' },
  {
    label: '前三家占比',
    value: `${data.value.summary.top3_share}%`,
    hint: concentrateHint.value.text,
    tone: concentrateHint.value.tone,
  },
])

async function renderTrend() {
  const option: EChartsOption = {
    color: ['#2BA8E8'],
    grid: { top: 28, left: 8, right: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
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
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
    },
    series: [
      {
        name: '采购额',
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: data.value.monthly_amount,
      },
    ],
  }
  await setTrend(option)
}

async function renderCategory() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#8B6BE8', '#F97316', '#E8635F', '#5B8FF9'],
    tooltip: {
      trigger: 'item',
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['46%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        label: { show: false },
        data: data.value.categories,
      },
    ],
  }
  await setCategory(option)
}

async function renderSupplier() {
  // 横向条按金额升序，从上到下正好是由小到大，最长的那家在顶部
  const rows = [...data.value.supplier_rank].reverse()
  const option: EChartsOption = {
    color: ['#5B8FF9'],
    grid: { top: 12, left: 8, right: 60, bottom: 4, containLabel: true },
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
      data: rows.map(item => item.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 11, width: 150, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          formatter: (params: any) => `${(Number(params.value) / 10000).toFixed(1)} 万`,
        },
        data: rows.map(item => item.value),
      },
    ],
  }
  await setSupplier(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await report.dashboard()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as PurchaseDashboard
  await nextTick()
  renderTrend()
  renderCategory()
  renderSupplier()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'PurchaseReportDashboard' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="purchase-head">
      <div>
        <h3 class="purchase-head__title">
          采购看板
        </h3>
        <p class="purchase-head__desc">
          采购额趋势、品类结构与供应商集中度 · 准时率 {{ data.summary.ontime_rate }}%，验收合格率 {{ data.summary.qualified_rate }}%
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
        <n-card :bordered="false" title="近 12 个月采购额" size="small">
          <div ref="trendRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="采购品类结构" size="small">
          <div ref="categoryRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:24">
        <n-card :bordered="false" title="供应商采购额排名（前 8）" size="small">
          <div ref="supplierRef" style="height: 300px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.purchase-head {
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
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.55;
  }
}
</style>
