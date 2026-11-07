<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useECharts } from '@/hooks/chart/useECharts'
import { usePermission } from '@/hooks/permission/usePermission'
import { overview as api } from '@/service/api/dashboard'
import { apply, approve } from '@/service/api/workflow'
import { useUserStore } from '@/store/modules/user'
import bus from '@/utils/bus'
import toast from '@/utils/toast'

defineOptions({ name: 'DashboardOverview' })

/** 待办条目：审批与申请共用同一结构，差别只在操作按钮 */
interface WorkItem {
  id: string
  biz_name: string
  biz_key: string
  biz_id: string
  biz_no: string
  team_name: string
  user_name: string
  amount: number
  wait_hours: number
  overdue: boolean
  status_text: string
  ctime: string
}

interface Activity {
  id: string
  types: string
  title: string
  biz_key: string
  biz_id: string
  content: string
  ctime: string
}

interface Workbench {
  updated: string
  days: string[]
  submitted: number[]
  approved: number[]
  done_week: number
  avg_hours: number
}

interface StatCard {
  label: string
  value: number
  unit: string
  hint: string
  tone: string
  /** 点击跳到的待办分组，没有就不响应点击 */
  tab?: 'approve' | 'apply'
}

/** 各业务类型的标识色：同一类单据在待办和动态里颜色一致，扫一眼就能分组 */
const BIZ_TONES: Record<string, string> = {
  资产调拨: '#22B99A',
  资产领用: '#22B99A',
  资产采购: '#22B99A',
  费用报销: '#F97316',
  借款申请: '#F97316',
  合同签订: '#E9A020',
  档案借阅: '#8B6BE8',
}

const FALLBACK_TONE = '#2BA8E8'

/**
 * 快捷入口
 *
 * 只放高频页面，不放全部菜单 —— 全部菜单侧边栏已经有了，
 * 这里再列一遍只是把「找菜单」的成本换个地方付。
 */
const QUICK_ENTRIES = [
  { title: '费用申请', path: '/expense/claim/list', icon: 'ant-design:account-book-outlined', permission: 'EXP_CLAIM_LIST', tone: '#F97316' },
  { title: '采购申请', path: '/purchase/order/request', icon: 'ant-design:shopping-cart-outlined', permission: 'PUR_ORDER_REQUEST', tone: '#8B6BE8' },
  { title: '合同台账', path: '/expense/contract/list', icon: 'ant-design:file-text-outlined', permission: 'EXP_CONTRACT_LIST', tone: '#E9A020' },
  { title: '资产流转', path: '/asset/flow/list', icon: 'ant-design:swap-outlined', permission: 'AST_FLOW_LIST', tone: '#22B99A' },
  { title: '客户档案', path: '/crm/customer/archive', icon: 'ant-design:team-outlined', permission: 'CRM_CUSTOMER_ARCHIVE', tone: '#2BA8E8' },
  { title: '员工花名册', path: '/hr/employee/roster', icon: 'ant-design:idcard-outlined', permission: 'HR_EMPLOYEE_ROSTER', tone: '#5B8FF9' },
  { title: '文档库', path: '/archive/document', icon: 'ant-design:folder-open-outlined', permission: 'DOC_DOCUMENT', tone: '#8B6BE8' },
  { title: '资金总览', path: '/finance/treasury/overview', icon: 'ant-design:bank-outlined', permission: 'FIN_TREASURY_OVERVIEW', tone: '#22B99A' },
]

const router = useRouter()
const userStore = useUserStore()
const { hasPermission } = usePermission()

const loading = ref(true)
const activeTab = ref('approve')

const approveItems = ref<WorkItem[]>([])
const applyItems = ref<WorkItem[]>([])
const activities = ref<Activity[]>([])
const summary = ref<Workbench>({
  updated: '',
  days: [],
  submitted: [],
  approved: [],
  done_week: 0,
  avg_hours: 0,
})

/**
 * 本次会话内已处理掉的条目
 *
 * mock 的待办列表是确定性数据，审批通过后重新拉取还会原样回来，
 * 列表里刚点过的单子又出现一次就很假。这里按 id 记住，刷新页面才复位。
 */
const handled = ref<string[]>([])

/** 本次会话新办结的单数：mock 的「本周已办」是个固定值，加上它才不会点完还是 30 */
const sessionDone = ref(0)

const weekRef = ref<HTMLDivElement | null>(null)
const { setOptions: setWeekChart } = useECharts(weekRef as Ref<HTMLDivElement>)

const userName = computed(() => userStore.userInfo?.name || '同事')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6)
    return '夜深了'
  if (hour < 12)
    return '早上好'
  if (hour < 14)
    return '中午好'
  if (hour < 18)
    return '下午好'
  return '晚上好'
})

const todayText = computed(() => {
  const now = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 ${week}`
})

const pendingApproval = computed(() =>
  approveItems.value.filter(item => !handled.value.includes(`approve:${item.id}`)),
)
const pendingApply = computed(() =>
  applyItems.value.filter(item => !handled.value.includes(`apply:${item.id}`)),
)

const currentItems = computed(() => (activeTab.value === 'approve' ? pendingApproval.value : pendingApply.value))

const overdueCount = computed(() => pendingApproval.value.filter(item => item.overdue).length)

const oldestWait = computed(() =>
  pendingApproval.value.reduce((max, item) => Math.max(max, item.wait_hours), 0),
)

/** 「HH:mm 更新」：让人知道这块数字是刚拉的，不是上次打开时的快照 */
const updatedText = computed(() =>
  summary.value.updated ? `${summary.value.updated.slice(11, 16)} 更新` : '',
)

/** 一句话说清今天的重点，别让人自己数 */
const insight = computed(() => {
  if (overdueCount.value > 0)
    return `有 ${overdueCount.value} 项审批已超期，建议先处理`
  if (pendingApproval.value.length > 0)
    return `${pendingApproval.value.length} 项审批待处理，暂无超期`
  if (pendingApply.value.length > 0)
    return `你提的 ${pendingApply.value.length} 张单子还在流程中`
  return '待办已清空，保持这个节奏'
})

const cards = computed<StatCard[]>(() => [
  {
    label: '待我审批',
    value: pendingApproval.value.length,
    unit: '项',
    hint: pendingApproval.value.length ? `最早一单已等 ${oldestWait.value} 小时` : '暂时没有待审批',
    tone: '#F97316',
    tab: 'approve',
  },
  {
    label: '我的申请',
    value: pendingApply.value.length,
    unit: '项',
    hint: pendingApply.value.length ? '都在审批流程中' : '没有在途单据',
    tone: '#2BA8E8',
    tab: 'apply',
  },
  {
    label: '已超期',
    value: overdueCount.value,
    unit: '项',
    hint: overdueCount.value ? '超过 24 小时未处理' : '没有超期事项',
    tone: overdueCount.value ? '#E8635F' : '#8C95A1',
    tab: 'approve',
  },
  {
    label: '本周已办',
    value: summary.value.done_week + sessionDone.value,
    unit: '单',
    hint: `平均 ${summary.value.avg_hours} 小时办结`,
    tone: '#22B99A',
  },
])

const quickEntries = computed(() => QUICK_ENTRIES.filter(item => hasPermission([item.permission])))

/** 待办分组：标签直接带上条数，切不切换一眼就知道下面有多少 */
const tabs = computed(() => [
  { label: '待我审批', value: 'approve', count: pendingApproval.value.length },
  { label: '我的申请', value: 'apply', count: pendingApply.value.length },
])

function toneOf(name: string) {
  return BIZ_TONES[name] ?? FALLBACK_TONE
}

function money(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function shortTime(text: string) {
  return text ? text.slice(5, 16) : ''
}

function focusTab(tab?: 'approve' | 'apply') {
  if (tab)
    activeTab.value = tab
}

/** 详情统一走 BizDetailHost 的弹窗，不做路由跳转，回来时列表状态还在 */
function openDetail(item: WorkItem | Activity, approveMode = false) {
  if (!item?.biz_key)
    return
  bus.emit('biz-detail:open', {
    biz_name: item.biz_key,
    biz_id: item.biz_id,
    mode: approveMode ? 'approve' : 'apply',
    approve: approveMode,
  })
}

async function submitProcess(item: WorkItem, status: '同意' | '退回') {
  const { isSuccess } = await approve.process({
    list: [{ id: item.biz_id, biz_class: item.biz_key }],
    status,
    remark: status === '退回' ? '演示环境：退回原因未填写' : null,
  })
  if (!isSuccess)
    return false
  handled.value.push(`approve:${item.id}`)
  sessionDone.value += 1
  toast.success(status === '同意' ? '已通过' : '已退回')
  return true
}

function handlePass(item: WorkItem) {
  submitProcess(item, '同意')
}

function handleRefuse(item: WorkItem) {
  toast.infoModal(`确定退回「${item.biz_name} ${item.biz_no}」吗？`, {
    positiveText: '退回',
    negativeText: '取消',
    onPositiveClick: () => submitProcess(item, '退回'),
  })
}

function handleApproveAll() {
  const total = pendingApproval.value.length
  if (!total)
    return
  toast.infoModal(`确定把 ${total} 项待审批全部通过吗？`, {
    positiveText: '全部通过',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await approve.confirm()
      if (!isSuccess)
        return
      pendingApproval.value.forEach(item => handled.value.push(`approve:${item.id}`))
      sessionDone.value += total
      toast.success(`已通过 ${total} 项`)
    },
  })
}

function goPage(name: 'ProfileApprove' | 'ProfileApply') {
  router.push({ name })
}

async function load() {
  loading.value = true
  try {
    const [applyRes, approveRes, alterRes, summaryRes] = await Promise.all([
      apply.search({ status: 'wait' }),
      approve.search({ status: 'wait' }),
      api.getAlter(),
      api.getWorkbench(),
    ])

    if (applyRes.isSuccess)
      applyItems.value = (applyRes.data?.list ?? []) as WorkItem[]
    if (approveRes.isSuccess)
      approveItems.value = (approveRes.data?.list ?? []) as WorkItem[]
    if (alterRes.isSuccess)
      activities.value = (alterRes.data ?? []) as Activity[]
    if (summaryRes.isSuccess && summaryRes.data)
      summary.value = summaryRes.data as unknown as Workbench

    await nextTick()
    renderWeek()
  }
  finally {
    loading.value = false
  }
}

/** 近 7 天提交与办结：两根柱子并排，看的是「进来的多还是处理的多」 */
async function renderWeek() {
  if (!summary.value.days.length)
    return
  const option: EChartsOption = {
    color: ['#2BA8E8', '#22B99A'],
    grid: { top: 30, left: 4, right: 8, bottom: 2, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      top: 0,
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 12,
      textStyle: { fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: summary.value.days,
      axisTick: { show: false },
      axisLabel: { fontSize: 10, interval: 0 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      axisLabel: { fontSize: 10 },
    },
    series: [
      {
        name: '提交',
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: summary.value.submitted,
      },
      {
        name: '办结',
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: summary.value.approved,
      },
    ],
  }
  await setWeekChart(option)
}

onMounted(load)
</script>

<template>
  <NaPage :loading="loading" style="padding-bottom: 8px">
    <div class="wb-head">
      <div>
        <h3 class="wb-head__title">
          {{ greeting }}，{{ userName }}
        </h3>
        <p class="wb-head__desc">
          {{ todayText }} · {{ insight }}
        </p>
      </div>
      <n-button size="small" type="primary" secondary :loading="loading" @click="load">
        刷新
      </n-button>
    </div>

    <n-grid cols="2 s:2 m:4" responsive="screen" :x-gap="12" :y-gap="12">
      <n-gi v-for="item in cards" :key="item.label">
        <n-card
          :bordered="false"
          size="small"
          class="stat"
          :class="{ 'is-linked': item.tab }"
          @click="focusTab(item.tab)"
        >
          <div class="stat__head">
            <span class="stat__dot" :style="{ background: item.tone }" />
            <span>{{ item.label }}</span>
          </div>
          <div class="stat__value">
            {{ item.value }}<em>{{ item.unit }}</em>
          </div>
          <div class="stat__hint">
            {{ item.hint }}
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <div class="workbench">
      <n-card :bordered="false" size="small" class="workbench__main panel" content-style="padding: 0">
        <template #header>
          <div class="panel__head">
            <span class="panel__title">待办中心</span>
            <n-space :size="10" align="center">
              <n-button
                v-if="activeTab === 'approve'"
                size="tiny"
                type="primary"
                secondary
                :disabled="!pendingApproval.length"
                @click="handleApproveAll"
              >
                全部通过
              </n-button>
              <n-button size="tiny" text type="primary" @click="goPage(activeTab === 'approve' ? 'ProfileApprove' : 'ProfileApply')">
                查看全部
              </n-button>
            </n-space>
          </div>
        </template>

        <div class="seg">
          <button
            v-for="item in tabs"
            :key="item.value"
            type="button"
            class="seg__item"
            :class="{ 'is-active': activeTab === item.value }"
            @click="activeTab = item.value"
          >
            {{ item.label }}
            <em>{{ item.count }}</em>
          </button>
        </div>

        <div class="todo-list">
          <div
            v-for="item in currentItems"
            :key="item.id"
            class="todo-item"
            @click="openDetail(item, activeTab === 'approve')"
          >
            <span
              class="todo-item__badge"
              :style="{ color: toneOf(item.biz_name), background: `${toneOf(item.biz_name)}1f` }"
            >
              {{ item.biz_name.slice(0, 2) }}
            </span>

            <div class="todo-item__main">
              <div class="todo-item__line">
                <span class="todo-item__title">{{ item.biz_name }}</span>
                <span class="todo-item__no">{{ item.biz_no }}</span>
                <n-tag v-if="item.overdue" size="tiny" :bordered="false" type="error">
                  超期
                </n-tag>
                <n-tag v-else-if="activeTab === 'apply'" size="tiny" :bordered="false" type="info">
                  {{ item.status_text }}
                </n-tag>
              </div>
              <div class="todo-item__meta">
                <span>{{ item.user_name }} · {{ item.team_name }}</span>
                <i class="todo-item__dot" />
                <span class="todo-item__amount">¥ {{ money(item.amount) }}</span>
                <i class="todo-item__dot" />
                <span>{{ shortTime(item.ctime) }}</span>
              </div>
            </div>

            <div class="todo-item__ops" @click.stop>
              <n-button size="tiny" quaternary @click="openDetail(item, activeTab === 'approve')">
                详情
              </n-button>
              <template v-if="activeTab === 'approve'">
                <n-button size="tiny" type="primary" secondary @click="handlePass(item)">
                  通过
                </n-button>
                <n-button size="tiny" quaternary @click="handleRefuse(item)">
                  退回
                </n-button>
              </template>
            </div>
          </div>

          <n-empty v-if="!loading && !currentItems.length" description="没有待处理的事项" class="todo-list__empty" />
        </div>
      </n-card>

      <div class="workbench__side">
        <n-card :bordered="false" size="small" title="快捷入口" class="panel">
          <div class="quick">
            <button
              v-for="item in quickEntries"
              :key="item.path"
              type="button"
              class="quick__item"
              @click="router.push(item.path)"
            >
              <n-icon :size="17" :color="item.tone">
                <Icon :icon="item.icon" />
              </n-icon>
              <span>{{ item.title }}</span>
            </button>
          </div>
        </n-card>

        <n-card :bordered="false" size="small" class="panel workbench__chart">
          <template #header>
            <div class="panel__head">
              <span class="panel__title">近 7 天节奏</span>
              <span class="panel__hint">{{ updatedText }}</span>
            </div>
          </template>
          <div ref="weekRef" style="height: 168px" />
        </n-card>
      </div>
    </div>

    <n-card :bordered="false" size="small" class="panel mt-3" title="最新动态">
      <div class="activity">
        <div
          v-for="item in activities"
          :key="item.id"
          class="activity__item"
          @click="openDetail(item)"
        >
          <div class="activity__top">
            <span class="activity__badge">{{ item.types }}</span>
            <span class="activity__time">{{ shortTime(item.ctime) }}</span>
          </div>
          <p class="activity__title">
            {{ item.title }}
          </p>
          <p class="activity__meta">
            {{ item.content }}
          </p>
        </div>
      </div>
    </n-card>
  </NaPage>
</template>

<style lang="less" scoped>
.wb-head {
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
    color: var(--atlas-text);
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }
}

/* ---------- 指标卡 ---------- */
.stat {
  height: 100%;
  transition:
    transform var(--atlas-duration) var(--atlas-ease),
    box-shadow var(--atlas-duration) var(--atlas-ease);

  &.is-linked {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--atlas-shadow-sm);
    }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--atlas-text-secondary);
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;
  }

  &__value {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 650;
    line-height: 30px;
    color: var(--atlas-text);
    font-variant-numeric: tabular-nums;

    em {
      margin-left: 3px;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      color: var(--atlas-text-tertiary);
    }
  }

  &__hint {
    margin-top: 2px;
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }
}

/* ---------- 主区：待办 + 侧栏 ---------- */
.workbench {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 12px;

  &__main {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 316px;
    flex: none;
  }

  &__chart {
    flex: 1 1 auto;
  }
}

.panel {
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--atlas-text);
  }

  &__hint {
    font-size: 11.5px;
    color: var(--atlas-text-tertiary);
  }
}

/* ---------- 待办分组切换 ---------- */
.seg {
  display: inline-flex;
  gap: 2px;
  margin: 12px 14px 2px;
  padding: 3px;
  border-radius: var(--atlas-radius-pill);
  background: var(--atlas-surface-sunken);

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border: none;
    border-radius: var(--atlas-radius-pill);
    background: transparent;
    font-size: 12.5px;
    color: var(--atlas-text-tertiary);
    cursor: pointer;
    transition:
      background var(--atlas-duration) var(--atlas-ease),
      color var(--atlas-duration) var(--atlas-ease);

    em {
      font-style: normal;
      font-size: 11.5px;
      font-variant-numeric: tabular-nums;
      opacity: 0.7;
    }

    &:hover {
      color: var(--atlas-text-secondary);
    }

    &.is-active {
      background: var(--atlas-surface);
      color: var(--atlas-text);
      box-shadow: var(--atlas-shadow-xs);

      em {
        color: var(--atlas-brand);
        opacity: 1;
      }
    }
  }
}

/* ---------- 待办行 ---------- */
.todo-list {
  padding: 6px 8px 10px;
  max-height: 396px;
  overflow-y: auto;
  // 底部渐隐：直接截断半行会像布局出错，渐隐读作「下面还有」
  mask-image: linear-gradient(to bottom, #000 calc(100% - 22px), transparent 100%);

  &__empty {
    padding: 48px 0;
    mask-image: none;
  }
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: var(--atlas-radius-sm);
  cursor: pointer;
  transition: background var(--atlas-duration) var(--atlas-ease);

  & + & {
    margin-top: 2px;
  }

  &:hover {
    background: var(--atlas-surface-hover);
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: var(--atlas-radius-sm);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__main {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--atlas-text);
    white-space: nowrap;
  }

  &__no {
    font-size: 12px;
    color: var(--atlas-text-tertiary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--atlas-text-tertiary);
    white-space: nowrap;
    overflow: hidden;
  }

  &__dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--atlas-border-strong);
    flex: none;
  }

  &__amount {
    color: var(--atlas-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  &__ops {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: none;
    opacity: 0.7;
    transition: opacity var(--atlas-duration) var(--atlas-ease);
  }

  &:hover &__ops {
    opacity: 1;
  }
}

/* ---------- 快捷入口 ---------- */
.quick {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid var(--atlas-border);
    border-radius: var(--atlas-radius-sm);
    background: transparent;
    font-size: 12.5px;
    color: var(--atlas-text-secondary);
    text-align: left;
    cursor: pointer;
    transition:
      border-color var(--atlas-duration) var(--atlas-ease),
      background var(--atlas-duration) var(--atlas-ease);

    &:hover {
      border-color: var(--atlas-border-strong);
      background: var(--atlas-surface-hover);
      color: var(--atlas-text);
    }
  }
}

/* ---------- 最新动态 ---------- */
.activity {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;

  &__item {
    padding: 12px;
    border-radius: var(--atlas-radius-sm);
    background: var(--atlas-surface-sunken);
    cursor: pointer;
    transition: background var(--atlas-duration) var(--atlas-ease);

    &:hover {
      background: var(--atlas-surface-hover);
    }
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--atlas-radius-xs);
    background: var(--atlas-brand-soft);
    color: var(--atlas-brand);
    font-size: 12px;
    font-weight: 600;
  }

  &__time {
    font-size: 11px;
    color: var(--atlas-text-tertiary);
  }

  &__title {
    margin: 8px 0 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    color: var(--atlas-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    margin: 2px 0 0;
    font-size: 11.5px;
    color: var(--atlas-text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media screen and (max-width: 1200px) {
  .workbench {
    flex-direction: column;
  }

  .workbench__side {
    width: auto;
  }

  .activity {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
