<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { dashboard } from '@/service/api/hr'

interface HrDashboard {
  updated: string
  summary: {
    headcount: number
    probation: number
    new_hires: number
    turnover_rate: number
    payroll_total: number
    avg_salary: number
  }
  months: string[]
  headcount_series: number[]
  payroll_series: number[]
  dept_share: Array<{ name: string, value: number }>
  tenure: Array<{ name: string, value: number }>
  education: Array<{ name: string, value: number }>
}

const loading = ref(true)
const data = ref<HrDashboard>({
  updated: '',
  summary: { headcount: 0, probation: 0, new_hires: 0, turnover_rate: 0, payroll_total: 0, avg_salary: 0 },
  months: [],
  headcount_series: [],
  payroll_series: [],
  dept_share: [],
  tenure: [],
  education: [],
})

const trendRef = ref<HTMLDivElement | null>(null)
const deptRef = ref<HTMLDivElement | null>(null)
const tenureRef = ref<HTMLDivElement | null>(null)
const { setOptions: setTrend } = useECharts(trendRef as Ref<HTMLDivElement>)
const { setOptions: setDept } = useECharts(deptRef as Ref<HTMLDivElement>)
const { setOptions: setTenure } = useECharts(tenureRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = data.value
  return [
    { label: '在职人数', value: `${summary.headcount} 人`, hint: `试用期 ${summary.probation} 人`, tone: '#2BA8E8' },
    { label: '近 30 天入职', value: `${summary.new_hires} 人`, hint: '按入职日期统计', tone: '#22B99A' },
    { label: '离职率', value: `${summary.turnover_rate}%`, hint: '离职人数 / 名册总人数', tone: '#F97316' },
    { label: '本月工资总额', value: `¥ ${wan(summary.payroll_total)}`, hint: `人均 ${wan(summary.avg_salary)}`, tone: '#8B6BE8' },
  ]
})

async function renderTrend() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A'],
    grid: { top: 52, left: 8, right: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: { top: 6, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12 } },
    xAxis: {
      type: 'category',
      data: data.value.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: '人数',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
        axisLabel: { fontSize: 11 },
      },
      {
        type: 'value',
        name: '工资总额',
        splitLine: { show: false },
        axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
      },
    ],
    series: [
      { name: '在职人数', type: 'bar', barMaxWidth: 18, itemStyle: { borderRadius: 3 }, data: data.value.headcount_series },
      {
        name: '工资总额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        data: data.value.payroll_series,
      },
    ],
  }
  await setTrend(option)
}

async function renderDept() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#F97316', '#8B6BE8', '#E9A020', '#41C1C1', '#E8635F', '#8B93A7'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 人（{d}%）' },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 8,
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
        data: data.value.dept_share,
      },
    ],
  }
  await setDept(option)
}

async function renderTenure() {
  const option: EChartsOption = {
    color: ['#2BA8E8'],
    grid: { top: 24, left: 8, right: 24, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: data.value.tenure.map(item => item.name),
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
        data: data.value.tenure.map(item => item.value),
      },
    ],
  }
  await setTenure(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await dashboard.overview()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as HrDashboard
  await nextTick()
  renderTrend()
  renderDept()
  renderTenure()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'HrReportDashboard' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="hr-head">
      <div>
        <h3 class="hr-head__title">
          人力看板
        </h3>
        <p class="hr-head__desc">
          在职人数、部门分布与薪酬成本 · 数据更新于 {{ data.updated || '—' }}
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
        <n-card :bordered="false" title="近 12 个月人数与工资总额" size="small">
          <div ref="trendRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="部门人数分布" size="small">
          <div ref="deptRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:24">
        <n-card :bordered="false" title="司龄结构" size="small">
          <div ref="tenureRef" style="height: 230px" />
        </n-card>
      </n-gi>
    </n-grid>
  </NaPage>
</template>

<style lang="less" scoped>
.hr-head {
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
