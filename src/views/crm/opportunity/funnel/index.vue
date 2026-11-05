<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { opportunity } from '@/service/api/crm'

interface FunnelStage {
  stage: string
  count: number
  amount: number
  win_rate: number
}

interface FunnelData {
  updated: string
  summary: {
    total: number
    active: number
    amount: number
    weighed: number
    win_rate: number
    avg_amount: number
  }
  stages: FunnelStage[]
}

const loading = ref(true)
const data = ref<FunnelData>({
  updated: '',
  summary: { total: 0, active: 0, amount: 0, weighed: 0, win_rate: 0, avg_amount: 0 },
  stages: [],
})

const stageRef = ref<HTMLDivElement | null>(null)
const { setOptions: setStage } = useECharts(stageRef as Ref<HTMLDivElement>)

const wan = (value: number) => `${(Number(value || 0) / 10000).toFixed(1)} 万`

const cards = computed(() => {
  const { summary } = data.value
  return [
    { label: '在跟商机', value: `${summary.active} 个`, hint: `全部 ${summary.total} 个（含已结束）`, tone: '#2BA8E8' },
    { label: '在跟金额', value: `¥ ${wan(summary.amount)}`, hint: `平均单笔 ${wan(summary.avg_amount)}`, tone: '#22B99A' },
    { label: '加权金额', value: `¥ ${wan(summary.weighed)}`, hint: '按各阶段赢单率折算', tone: '#8B6BE8' },
    { label: '赢单率', value: `${summary.win_rate}%`, hint: '仅统计已结束的商机', tone: '#F97316' },
  ]
})

/** 阶段间的数量转化：下一阶段商机数 / 当前阶段商机数 */
const conversions = computed(() => {
  const stages = data.value.stages.filter(item => item.stage !== '输单')
  return stages.map((item, index) => {
    if (index === 0)
      return { ...item, rate: 100 }
    const prev = stages[index - 1]!
    return { ...item, rate: Math.round((item.count / Math.max(1, prev.count)) * 100) }
  })
})

async function renderStage() {
  const stages = data.value.stages.filter(item => item.stage !== '输单')
  // 横向条形从下往上排，视觉上就是漏斗：上宽下窄
  const rows = [...stages].reverse()

  const option: EChartsOption = {
    grid: { top: 16, left: 8, right: 90, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0]
        return `${item.name}<br/>金额 ¥ ${(Number(item.value) / 10000).toFixed(1)} 万`
      },
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 11, formatter: (value: any) => `${(Number(value) / 10000).toFixed(0)} 万` },
    },
    yAxis: {
      type: 'category',
      data: rows.map(item => item.stage),
      axisTick: { show: false },
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 26,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          formatter: (params: any) => `${rows[params.dataIndex]?.count ?? 0} 个`,
        },
        data: rows.map((item, index) => ({
          value: item.amount,
          // 阶段越靠后颜色越深，形成推进感
          itemStyle: { color: ['#2BA8E8', '#41A9D8', '#E9A020', '#22B99A', '#8B6BE8'][index] ?? '#2BA8E8' },
        })),
      },
    ],
  }
  await setStage(option)
}

async function load() {
  loading.value = true
  const { isSuccess, data: payload } = await opportunity.funnel()
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  data.value = payload as unknown as FunnelData
  await nextTick()
  renderStage()
}

onMounted(load)
</script>

<script lang="ts">
export default { name: 'CrmOpportunityFunnel' }
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="crm-head">
      <div>
        <h3 class="crm-head__title">
          销售漏斗
        </h3>
        <p class="crm-head__desc">
          各阶段商机金额与数量，赢单率按已结束商机统计 · 数据更新于 {{ data.updated || '—' }}
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
        <n-card :bordered="false" title="各阶段商机金额" size="small">
          <div ref="stageRef" style="height: 320px" />
        </n-card>
      </n-gi>
      <n-gi span="24 m:9">
        <n-card :bordered="false" title="阶段转化" size="small">
          <div class="convert">
            <div v-for="item in conversions" :key="item.stage" class="convert__row">
              <div class="convert__name">
                {{ item.stage }}
              </div>
              <div class="convert__meta">
                <span>{{ item.count }} 个</span>
                <span>¥ {{ wan(item.amount) }}</span>
              </div>
              <div class="convert__rate">
                {{ item.rate }}%
              </div>
              <n-progress
                class="convert__bar"
                type="line"
                :percentage="item.rate"
                :height="5"
                :show-indicator="false"
                color="#2BA8E8"
                rail-color="rgba(128, 128, 128, 0.2)"
              />
            </div>
          </div>
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

.convert {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 2px;

  &__row {
    display: grid;
    grid-template-columns: 76px 1fr 42px;
    grid-template-rows: auto auto;
    gap: 2px 10px;
    align-items: center;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
  }

  &__meta {
    display: flex;
    gap: 10px;
    font-size: 12px;
    opacity: 0.6;
  }

  &__rate {
    font-size: 12px;
    text-align: right;
    opacity: 0.75;
  }

  &__bar {
    grid-column: 1 / -1;
    margin-top: 2px;
  }
}
</style>
