<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { treasury } from '@/service/api/finance'

interface TreasurySummary {
  balance: number
  inflow: number
  outflow: number
  net: number
  upcoming_30: number
  frozen: number
}

interface TreasuryOverview {
  updated: string
  summary: TreasurySummary
  months: string[]
  inflow_series: number[]
  outflow_series: number[]
  accounts: Array<{ name: string, value: number, currency: string }>
}

const loading = ref(true)
const overview = ref<TreasuryOverview>({
  updated: '',
  summary: { balance: 0, inflow: 0, outflow: 0, net: 0, upcoming_30: 0, frozen: 0 },
  months: [],
  inflow_series: [],
  outflow_series: [],
  accounts: [],
})

const flowRef = ref<HTMLDivElement | null>(null)
const accountRef = ref<HTMLDivElement | null>(null)
const { setOptions: setFlow } = useECharts(flowRef as Ref<HTMLDivElement>)
const { setOptions: setAccount } = useECharts(accountRef as Ref<HTMLDivElement>)

/** 金额按万元展示，卡片上一串数字读不出量级 */
const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = overview.value
  return [
    { label: '账户总余额', value: `¥ ${wan(summary.balance)}`, hint: `其中冻结 ${wan(summary.frozen)}`, tone: '#2BA8E8' },
    { label: '本月流入', value: `¥ ${wan(summary.inflow)}`, hint: '含货款、回款及其他收入', tone: '#22B99A' },
    { label: '本月流出', value: `¥ ${wan(summary.outflow)}`, hint: `净额 ${summary.net >= 0 ? '+' : ''}${wan(summary.net)}`, tone: '#F97316' },
    {
      label: '未来 30 天净头寸',
      value: `${summary.upcoming_30 >= 0 ? '+' : '-'}¥ ${wan(Math.abs(summary.upcoming_30))}`,
      hint: summary.upcoming_30 >= 0 ? '按近三月净现金流外推' : '含一笔集中付款，需提前安排',
      tone: summary.upcoming_30 >= 0 ? '#8B6BE8' : '#E8635F',
    },
  ]
})

async function renderFlow() {
  // 只画两条收支线时几乎重合（收入约等于支出），看不出净额变化；
  // 改成「收支柱 + 净额线」，右轴单独标净额，才能一眼看出哪个月吃紧
  const net = overview.value.inflow_series.map((value, index) =>
    Number((value - (overview.value.outflow_series[index] ?? 0)).toFixed(2)),
  )

  const option: EChartsOption = {
    color: ['#2BA8E8', '#F97316', '#22B99A'],
    grid: { top: 52, left: 8, right: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `¥ ${(Number(value ?? 0) / 10000).toFixed(1)} 万`,
    },
    legend: { top: 6, itemWidth: 10, itemHeight: 10, itemGap: 14, textStyle: { fontSize: 12 } },
    xAxis: {
      type: 'category',
      data: overview.value.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
        axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
      },
      {
        type: 'value',
        name: '净额',
        splitLine: { show: false },
        axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
      },
    ],
    series: [
      { name: '资金流入', type: 'bar', barMaxWidth: 16, itemStyle: { borderRadius: 3 }, data: overview.value.inflow_series },
      { name: '资金流出', type: 'bar', barMaxWidth: 16, itemStyle: { borderRadius: 3 }, data: overview.value.outflow_series },
      {
        name: '净额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        data: net,
      },
    ],
  }
  await setFlow(option)
}

async function renderAccounts() {
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A', '#F97316', '#8B6BE8', '#E9A020', '#41C1C1', '#E8635F', '#8B93A7'],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>¥ ${(Number(params.value) / 10000).toFixed(1)} 万（${params.percent}%）`,
    },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 8,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['34%', '52%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        data: overview.value.accounts,
      },
    ],
  }
  await setAccount(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data } = await treasury.overview()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  overview.value = data as unknown as TreasuryOverview
  await nextTick()
  renderFlow()
  renderAccounts()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'FinanceTreasuryOverview' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="fin-head">
      <div>
        <h3 class="fin-head__title">
          资金总览
        </h3>
        <p class="fin-head__desc">
          账户余额、本月收付与未来一个月头寸 · 数据更新于 {{ overview.updated || '—' }}
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
        <n-card :bordered="false" title="近 12 个月资金收支" size="small">
          <div ref="flowRef" style="height: 330px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:8">
        <n-card :bordered="false" title="账户余额分布" size="small">
          <div ref="accountRef" style="height: 330px" />
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
