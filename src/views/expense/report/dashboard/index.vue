<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { report } from '@/service/api/expense'

interface ExpenseDashboard {
  updated: string
  summary: {
    month_amount: number
    total_used: number
    budget_rate: number
    pending_amount: number
    expiring_contracts: number
    paid_amount: number
  }
  months: string[]
  expense_series: number[]
  category_share: Array<{ name: string, value: number }>
  dept_top: Array<{ name: string, value: number }>
}

const loading = ref(true)
const data = ref<ExpenseDashboard>({
  updated: '',
  summary: {
    month_amount: 0,
    total_used: 0,
    budget_rate: 0,
    pending_amount: 0,
    expiring_contracts: 0,
    paid_amount: 0,
  },
  months: [],
  expense_series: [],
  category_share: [],
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
    { label: '本月费用', value: `¥ ${wan(summary.month_amount)}`, hint: '按申请日期归集', tone: '#2BA8E8' },
    { label: '预算执行率', value: `${summary.budget_rate}%`, hint: `已使用 ${wan(summary.total_used)}`, tone: '#22B99A' },
    { label: '待审批金额', value: `¥ ${wan(summary.pending_amount)}`, hint: '审批中的申请单', tone: '#F97316' },
    { label: '即将到期合同', value: `${summary.expiring_contracts} 份`, hint: '90 天内到期', tone: '#8B6BE8' },
  ]
})

async function renderTrend() {
  const option: EChartsOption = {
    color: ['#2BA8E8'],
    grid: { top: 28, left: 8, right: 16, bottom: 4, containLabel: true },
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
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
    },
    series: [
      {
        name: '费用支出',
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: { borderRadius: 3 },
        data: data.value.expense_series,
      },
    ],
  }
  await setTrend(option)
}

async function renderShare() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#F97316', '#8B6BE8', '#E9A020', '#41C1C1'],
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
        radius: ['42%', '66%'],
        center: ['50%', '44%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        data: data.value.category_share,
      },
    ],
  }
  await setShare(option)
}

async function renderDept() {
  const rows = [...data.value.dept_top].reverse()
  const option: EChartsOption = {
    color: ['#22B99A'],
    grid: { top: 8, left: 8, right: 56, bottom: 8, containLabel: true },
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
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
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
  await setDept(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await report.dashboard()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as ExpenseDashboard
  await nextTick()
  renderTrend()
  renderShare()
  renderDept()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'ExpenseReportDashboard' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="exp-head">
      <div>
        <h3 class="exp-head__title">
          费用看板
        </h3>
        <p class="exp-head__desc">
          月度支出、类别结构与部门分布 · 数据更新于 {{ data.updated || '—' }}
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
        <n-card :bordered="false" title="近 12 个月费用支出" size="small">
          <div ref="trendRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="费用类别结构" size="small">
          <div ref="shareRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:24">
        <n-card :bordered="false" title="部门费用排名" size="small">
          <div ref="deptRef" style="height: 230px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.exp-head {
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
