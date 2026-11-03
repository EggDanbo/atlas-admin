<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format, getDaysInMonth, isSameMonth } from 'date-fns'
import { usePermission } from '@/hooks/permission/usePermission'
import { rules as api } from '@/service/api/staff/checkin'

import AdjustModal from '../daily/components/adjustModal.vue'

interface StatSegment {
  id: number
  schedule_name: string
  work_sec: number
  work_checkin: number
  work_card: number
  work_record_id: number
  work_time: number
  off_work_sec: number
  off_work_checkin: number
  off_work_card: number
  off_work_record_id: number
  off_work_time: number
  exception_miner: boolean
  exception_stuck: number
  exception_later: boolean
  exception_flex_off: boolean
}

interface StatItem {
  user_id: number
  date: number
  status: number
  segments: StatSegment[]
}

interface StatUser {
  user_id: number
  user_name: string
  mobile: string
  types: number
  expire_time: number
}

// 单日状态:1-旷工 2-缺卡 3-迟到 4-早退 5-请假 6-正常(含补卡) 7-休息;bg/fg 为格子与图例颜色
const statusMeta: Record<number, { label: string, text: string, bg: string, fg: string }> = {
  1: { label: '旷工', text: '旷', bg: '#EF9A9A', fg: '#B71C1C' },
  2: { label: '缺卡', text: '缺', bg: '#F8BBD0', fg: '#AD1457' },
  3: { label: '迟到', text: '迟', bg: '#FFE0B2', fg: '#E65100' },
  4: { label: '早退', text: '退', bg: '#FFF9C4', fg: '#F57F17' },
  5: { label: '请假', text: '假', bg: '#D1C4E9', fg: '#4527A0' },
  6: { label: '正常', text: '✓', bg: '#C8E6C9', fg: '#1B5E20' },
  7: { label: '休息', text: '休', bg: '#ECEFF1', fg: '#78909C' },
}

// 尾行统计的异常状态
const abnormalStatus = [1, 2, 3, 4]

// 校准走每日明细的接口与权限
const ADJUST_PERM = 'DEMO_STAFF_CHECKIN_DAILY'
const { hasPermission } = usePermission()
const canAdjust = computed(() => hasPermission([`${ADJUST_PERM}_ADD`, `${ADJUST_PERM}_EDIT`]))

const modalRef = ref<ModalInst | null>(null)
const adjustModalRef = ref<OpenModal | null>(null)
const loading = ref(false)

const groupId = ref<number>()
// 单人模式:隐藏姓名筛选,仅查询该人员;后端 long 一律序列化为字符串,原样透传避免大整数丢精度
const singleUserId = ref<string>('0')
const isSingle = computed(() => singleUserId.value !== '0')
const groupTitle = ref('')
const monthValue = ref<number>(Date.now())
const nameFilter = ref('')

const users = ref<StatUser[]>([])
const items = ref<StatItem[]>([])

// user_id -> 日期(日) -> 状态项
const itemMap = computed(() => {
  const map = new Map<number, Map<number, StatItem>>()
  for (const item of items.value) {
    let dayMap = map.get(item.user_id)
    if (!dayMap) {
      dayMap = new Map()
      map.set(item.user_id, dayMap)
    }
    dayMap.set(item.date % 100, item)
  }
  return map
})

const days = computed(() => {
  const total = getDaysInMonth(new Date(monthValue.value))
  return Array.from({ length: total }, (_, i) => i + 1)
})

const todayDay = computed(() => {
  const now = new Date()
  return isSameMonth(now, new Date(monthValue.value)) ? now.getDate() : 0
})

const filterUsers = computed(() => {
  const keyword = nameFilter.value.trim()
  if (!keyword)
    return users.value
  return users.value.filter(q => q.user_name.includes(keyword))
})

// 行数据:预取每行每天的状态,模板按索引取用
interface StatRow {
  user: StatUser
  cells: Array<StatItem | undefined>
}
const rows = computed<StatRow[]>(() =>
  filterUsers.value.map(user => ({
    user,
    cells: days.value.map(day => itemMap.value.get(user.user_id)?.get(day)),
  })),
)

// 尾行:当天异常人数(旷/缺/迟/退)
const dayAbnormalCounts = computed(() => {
  const userIds = new Set(filterUsers.value.map(q => q.user_id))
  const counts = new Map<number, { total: number, detail: Record<string, number> }>()
  for (const item of items.value) {
    if (!abnormalStatus.includes(item.status) || !userIds.has(item.user_id))
      continue
    const day = item.date % 100
    const entry = counts.get(day) ?? { total: 0, detail: {} }
    entry.total += 1
    const label = statusMeta[item.status].label
    entry.detail[label] = (entry.detail[label] ?? 0) + 1
    counts.set(day, entry)
  }
  return counts
})

function dateDisabled(ts: number) {
  const now = new Date()
  return !isSameMonth(new Date(ts), now) && new Date(ts) > now
}

async function loadData() {
  if (!groupId.value)
    return
  loading.value = true
  const { isSuccess, data } = await api
    .statistics({
      id: groupId.value,
      month: Number(format(new Date(monthValue.value), 'yyyyMM')),
      user_id: singleUserId.value,
    })
    .finally(() => (loading.value = false))
  if (!isSuccess)
    return
  users.value = data.users ?? []
  items.value = data.items ?? []
  // 单人模式不传组名,标题取自统计结果
  if (data.group_name)
    groupTitle.value = data.group_name
}

async function open(params: { id: number, group_name?: string, user_id?: string }) {
  groupId.value = params.id
  singleUserId.value = params.user_id ?? '0'
  groupTitle.value = params.group_name ?? ''
  monthValue.value = Date.now()
  nameFilter.value = ''
  winStart.value = 0
  lastWinStart = 0
  cellPop.show = false
  modalRef.value?.open()
  await loadData()
}

function close() {
  modalRef.value?.close()
}

function cellStyle(item: StatItem) {
  return {
    backgroundColor: statusMeta[item.status]?.bg,
    color: statusMeta[item.status]?.fg,
    // 旷工加粗突出
    fontWeight: item.status === 1 ? 'bold' : undefined,
  }
}

// 共享悬浮弹窗:全表仅一个 popover 实例(避免每格一个的上万实例拖慢渲染),
// x/y 手动定位,展示中位置可直接跟随悬浮目标,无需隐藏重开
const cellPop = reactive<{
  show: boolean
  x: number
  y: number
  placement: 'top' | 'right'
  item: StatItem | null
  user: StatUser | null
  counts: { total: number, detail: Record<string, number> } | null
}>({ show: false, x: 0, y: 0, placement: 'top', item: null, user: null, counts: null })

let lastTableScrollAt = 0
let hideTimer: number | null = null

// 虚拟滚动:仅渲染可见行;窗口按整行步进平移,行内滚动不触发重渲染
const ROW_HEIGHT = 40
const OVERSCAN = 10
const winStart = ref(0)
const tableViewH = ref(600)
let lastWinStart = 0

const windowRows = computed(() => {
  const size = Math.ceil(tableViewH.value / ROW_HEIGHT) + OVERSCAN * 2
  return rows.value.slice(winStart.value, winStart.value + size)
})

// 滚动时关闭弹窗,并按行步进更新虚拟窗口
function onTableScroll(e: Event) {
  const tableEl = e.currentTarget as HTMLElement
  lastTableScrollAt = Date.now()
  if (cellPop.show) {
    keepCellPop()
    cellPop.show = false
  }
  const start = Math.max(0, Math.floor(tableEl.scrollTop / ROW_HEIGHT) - OVERSCAN)
  if (start !== lastWinStart) {
    lastWinStart = start
    winStart.value = start
  }
  if (tableViewH.value !== tableEl.clientHeight)
    tableViewH.value = tableEl.clientHeight
}

// 更新弹窗定位点(视口坐标),展示中变化会直接触发重定位
function movePopAnchor(el: HTMLElement, placement: 'top' | 'right') {
  const rect = el.getBoundingClientRect()
  if (placement === 'top') {
    cellPop.x = rect.left + rect.width / 2
    cellPop.y = rect.top
  }
  else {
    cellPop.x = rect.right
    cellPop.y = rect.top + rect.height / 2
  }
}

function showPop(
  e: MouseEvent,
  placement: 'top' | 'right',
  target: { item?: StatItem, user?: StatUser, counts?: { total: number, detail: Record<string, number> } } = {},
) {
  // 滚动中指针静止时元素也会从指针下滚过触发 mouseenter,此时不弹
  if (Date.now() - lastTableScrollAt < 300)
    return
  keepCellPop()
  movePopAnchor(e.currentTarget as HTMLElement, placement)
  cellPop.item = target.item ?? null
  cellPop.user = target.user ?? null
  cellPop.counts = target.counts ?? null
  cellPop.placement = placement
  cellPop.show = true
}

function keepCellPop() {
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

// 延迟隐藏:相邻格子间移动时弹窗保持展示、位置直接跟随;300ms 供鼠标移入弹窗点击校准按钮
function hideCellPop() {
  keepCellPop()
  hideTimer = window.setTimeout(() => {
    hideTimer = null
    cellPop.show = false
  }, 300)
}

// 从统计矩阵发起校准:预设对应明细与班次卡别,成功后由 success 事件刷新矩阵
function openAdjust(seg: StatSegment, workType: 0 | 1) {
  const userName = cellPop.user?.user_name ?? ''
  const date = cellPop.item?.date ?? 0
  cellPop.show = false
  adjustModalRef.value?.open({
    id: seg.id,
    types: '0',
    work_type: String(workType),
    adjust_time: defaultAdjustTime(seg, workType, date),
    memo: '',
    showTypes: workType === 0 ? seg.work_record_id > 0 : seg.off_work_record_id > 0,
    subtitle: `${userName} ${formatDate(date)} ${workType === 0 ? '上班卡' : '下班卡'}`,
  })
}

// 未打卡时以当天排班的应打卡时间为默认值;秒数≥86400 的跨天班次自然进位到次日
function defaultAdjustTime(seg: StatSegment, workType: 0 | 1, date: number) {
  const punched = Number(workType === 0 ? seg.work_time : seg.off_work_time)
  if (punched)
    return punched
  const sec = Number(workType === 0 ? seg.work_sec : seg.off_work_sec)
  if (!date || !sec)
    return null
  const dayStart = new Date(
    Math.floor(date / 10_000),
    Math.floor((date % 10_000) / 100) - 1,
    date % 100,
  ).getTime()
  return dayStart + sec * 1000
}

function formatDate(date: number) {
  const s = String(date)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

function isFillUser(user: StatUser) {
  return Number(user.types) === 1
}

// 姓名悬浮提示;过期时间可能是数字字符串,直接 new Date 会抛错
function fillExpireText(user: StatUser) {
  if (!isFillUser(user))
    return ''
  const ts = Number(user.expire_time)
  if (!ts)
    return ''
  const date = new Date(ts)
  if (Number.isNaN(date.getTime()))
    return ''
  return `顶班有效期至：${format(date, 'yyyy-MM-dd HH:mm')}`
}

function secToTime(sec: number) {
  if (!sec)
    return '未打卡'
  const dayOffset = Math.floor(sec / 86400)
  const rest = sec % 86400
  const hh = String(Math.floor(rest / 3600)).padStart(2, '0')
  const mm = String(Math.floor((rest % 3600) / 60)).padStart(2, '0')
  return `${dayOffset > 0 ? '次日' : dayOffset < 0 ? '前日' : ''}${hh}:${mm}`
}

function cardText(card: number) {
  return Number(card) === 1 ? '（补卡）' : ''
}

defineExpose({ open, close })
</script>

<script lang="ts">
export default { name: 'CheckinStatModal' }
</script>

<template>
  <SpModal
    ref="modalRef"
    :title="`打卡统计${groupTitle ? ` - ${groupTitle}` : ''}`"
    width="90vw"
    height="90vh"
    :mask="true"
    class-name="checkin-stat-modal"
    :enabled-padding="false"
  >
    <template #default>
      <div class="stat_block">
        <div class="stat_toolbar">
          <div class="stat_toolbar_left">
            <n-date-picker
              v-model:value="monthValue"
              type="month"
              style="width: 120px"
              :is-date-disabled="dateDisabled"
              @update:value="loadData"
            />
            <!-- 单人模式仅展示该人员,无需姓名筛选 -->
            <n-input
              v-if="!isSingle"
              v-model:value="nameFilter"
              placeholder="成员姓名"
              style="width: 180px"
              clearable
            />
          </div>
          <div class="stat_toolbar_right">
            <n-tag
              v-for="(meta, status) in statusMeta"
              :key="status"
              size="small"
              :color="{ color: meta.bg, textColor: meta.fg }"
            >
              {{ meta.label }}
            </n-tag>
          </div>
        </div>

        <n-spin :show="loading" class="stat_spin">
          <div class="stat_table" @scroll="onTableScroll">
            <div class="stat_table_header">
              <div class="stat_table_name">
                姓名
              </div>
              <div
                v-for="day in days"
                :key="day"
                class="stat_table_day"
                :class="{ today: day === todayDay }"
              >
                {{ day }}
              </div>
            </div>
            <div class="stat_rows_viewport" :style="{ height: `${rows.length * ROW_HEIGHT}px` }">
              <div class="stat_rows_window" :style="{ transform: `translateY(${winStart * ROW_HEIGHT}px)` }">
                <div
                  v-for="row in windowRows"
                  :key="row.user.user_id"
                  class="stat_table_row"
                >
                  <div
                    class="stat_table_name"
                    @mouseenter="showPop($event, 'right', { user: row.user })"
                    @mouseleave="hideCellPop"
                  >
                    <span class="stat_name_text">
                      {{ row.user.user_name }}
                      <n-tag v-if="isFillUser(row.user)" size="tiny" type="warning" :bordered="false">
                        顶
                      </n-tag>
                    </span>
                  </div>
                  <div
                    v-for="(item, dayIdx) in row.cells"
                    :key="dayIdx"
                    class="stat_table_day"
                    :class="{ today: dayIdx + 1 === todayDay }"
                  >
                    <div
                      v-if="item"
                      class="stat_table_cell"
                      :class="{ fill: isFillUser(row.user) }"
                      :style="cellStyle(item)"
                      @mouseenter="showPop($event, 'top', { item, user: row.user })"
                      @mouseleave="hideCellPop"
                    >
                      {{ statusMeta[item.status]?.text ?? '' }}
                    </div>
                    <div v-else class="stat_table_cell empty" />
                  </div>
                </div>
              </div>
            </div>
            <div class="stat_table_row stat_table_footer">
              <div class="stat_table_name">
                异常
              </div>
              <div v-for="day in days" :key="day" class="stat_table_day">
                <div
                  v-if="dayAbnormalCounts.get(day)"
                  class="stat_table_cell abnormal"
                  @mouseenter="showPop($event, 'top', { counts: dayAbnormalCounts.get(day) })"
                  @mouseleave="hideCellPop"
                >
                  {{ dayAbnormalCounts.get(day)!.total }}
                </div>
                <div v-else class="stat_table_cell empty" />
              </div>
            </div>

            <!-- 共享悬浮弹窗:x/y 定位点随悬浮目标实时跟随 -->
            <n-popover
              trigger="manual"
              :placement="cellPop.placement"
              :show="cellPop.show"
              :x="cellPop.x"
              :y="cellPop.y"
              :show-arrow="true"
            >
              <div
                v-if="cellPop.item || cellPop.user || cellPop.counts"
                class="stat_cell_detail"
                @mouseenter="keepCellPop"
                @mouseleave="hideCellPop"
              >
                <template v-if="cellPop.item">
                  <template v-if="cellPop.item!.segments.length > 0">
                    <div
                      v-for="(seg, keys) in cellPop.item!.segments"
                      :key="keys"
                      class="stat_cell_detail_seg"
                    >
                      <p class="seg_name">
                        {{ seg.schedule_name || '班次' }}
                      </p>
                      <p>
                        上班：{{ secToTime(seg.work_checkin) }}{{ cardText(seg.work_card) }}<template v-if="seg.exception_later">
                          （迟到）
                        </template>
                      </p>
                      <p>
                        下班：{{ secToTime(seg.off_work_checkin) }}{{ cardText(seg.off_work_card) }}<template v-if="seg.exception_flex_off">
                          （早退）
                        </template>
                      </p>
                      <p v-if="seg.exception_miner">
                        旷工
                      </p>
                      <p v-if="seg.exception_stuck > 0">
                        缺卡 {{ seg.exception_stuck }} 次
                      </p>
                      <div v-if="canAdjust" class="stat_cell_ops">
                        <n-button text type="primary" size="small" @click="openAdjust(seg, 0)">
                          校准上班卡
                        </n-button>
                        <n-divider vertical />
                        <n-button text type="primary" size="small" @click="openAdjust(seg, 1)">
                          校准下班卡
                        </n-button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p>{{ statusMeta[cellPop.item!.status]?.label }}</p>
                  </template>
                </template>
                <template v-else-if="cellPop.counts">
                  <p v-for="(count, label) in cellPop.counts!.detail" :key="label">
                    {{ label }}：{{ count }} 人
                  </p>
                </template>
                <template v-else>
                  <p>姓名：{{ cellPop.user!.user_name }}</p>
                  <p>手机：{{ cellPop.user!.mobile }}</p>
                  <p v-if="isFillUser(cellPop.user!)">
                    {{ fillExpireText(cellPop.user!) }}
                  </p>
                </template>
              </div>
            </n-popover>
          </div>
        </n-spin>
      </div>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="modalRef?.close()">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <AdjustModal ref="adjustModalRef" @success="loadData" />
</template>

<style lang="less" scoped>
.stat_block {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;
  box-sizing: border-box;
  // 补偿 SpModal 关闭的默认内边距
  padding: 15px 35px 5px;
}

// 高度链须透传到表格,才能内部滚动、表头吸顶
.stat_spin {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.n-spin-content) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.stat_toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  &_left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &_right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
}

.stat_table {
  flex: 1;
  min-height: 0;
  overflow: auto;

  &_header {
    width: 100%;
    display: flex;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
  }

  &_name {
    border: 1px solid #e7e7e8;
    border-width: 1px 0 1px 1px;
    flex: 0 0 94px;
    min-width: 0;
    box-sizing: border-box;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 4px;
    font-size: 13px;
    .stat_name_text {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &_day {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    flex: 1 0 28px;
    font-size: 13px;
    border: 1px solid #e7e7e8;
    border-width: 1px 0 1px 1px;
    height: 54px;
    overflow: hidden;
    &:last-child {
      border-width: 1px;
    }
    &.today {
      background-color: rgba(38, 126, 240, 0.08);
      box-shadow: inset 0 0 0 1px #267ef0;
    }
  }

  &_row {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    .stat_table_name {
      border-width: 0 0 1px 1px;
      height: 40px;
    }
    .stat_table_day {
      border-top-width: 0;
      height: 40px;
      padding: 1px;
      &.today {
        background-color: transparent;
      }
    }
  }

  &_footer {
    .stat_table_name,
    .stat_table_day {
      background-color: #f6f6f7;
      font-weight: bold;
    }
  }

  &_cell {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    word-break: break-all;
    &.empty {
      cursor: default;
    }
    &.abnormal {
      color: #c62828;
      cursor: pointer;
    }
    // 顶班人员:虚线框标识卡打在本组
    &.fill {
      box-shadow: inset 0 0 0 1.5px rgba(251, 140, 0, 0.9);
    }
  }
}

.stat_cell_detail {
  font-size: 13px;
  line-height: 1.6;
  .seg_name {
    font-weight: bold;
  }
  .stat_cell_detail_seg {
    &:not(:first-child) {
      margin-top: 8px;
      border-top: 1px solid rgba(6, 15, 26, 0.1);
      padding-top: 8px;
    }
  }
  .stat_cell_ops {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
}

html[data-vxe-ui-theme='dark'] {
  .stat_table_header,
  .stat_table_footer .stat_table_name,
  .stat_table_footer .stat_table_day {
    background-color: rgb(44, 44, 50);
  }
}
</style>

<style lang="less">
// 全局样式:约束内容区高度、仅统计矩阵滚动(表头吸顶)
.vxe-modal--wrapper.checkin-stat-modal {
  // vxe 默认规则优先级更高,需对齐提升才能覆盖 overflow
  &.type--modal .vxe-modal--body .vxe-modal--content {
    overflow: hidden;
  }

  .vxe-modal--content {
    display: flex;
    flex-direction: column;
  }

  // SpModal 的插槽包装层需参与弹性布局,否则高度链断裂、表头无法吸顶
  .vxe-modal--content > div {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
}
</style>
