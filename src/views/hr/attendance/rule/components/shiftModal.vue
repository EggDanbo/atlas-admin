<script lang="ts" setup>
import type { UploadFileInfo } from 'naive-ui'
import type {
  ScheduleDayItem,
  ScheduleItem,
  ScheduleMonthItem,
  SchedulePeriodItem,
  ScheduleUserItem,
} from './shiftModal'
import type { ModalInst } from '@/components/SpModal'
import { addMonths } from 'date-fns'
import { useThemeStore } from '@/store/modules/theme'
import toast from '@/utils/toast'
import CheckInTime from './checkInTime.vue'
import PeriodDateRange from './periodDateRange.vue'
import Period from './schedulePeriod.vue'
import {
  useSchedule,
} from './shiftModal'

const emit = defineEmits(['on-reg', 'on-action'])

const { isDark } = storeToRefs(useThemeStore())

const schedule = useSchedule()
const { filterRef, getSchedule, periodRef } = schedule

const exportOptions = reactive([
  {
    label: '导出排班模板',
    key: 'temp',
  },
  {
    label: '导出排班',
    key: 'data',
  },
])

const btnLoading = ref(false)
const periodInfo = ref<any>([])
const PeriodDateRangeRef = ref<any>(null)

// 月份数据
const scheduleMonthItem = ref<ScheduleMonthItem>()
const scheduleMonthUserItems = ref<Array<ScheduleUserItem>>([])

function dateDisabled(ts: number) {
  const date = new Date(ts)
  const now = new Date()
  const next = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), 2)
  return date > next
}

/**
 * 深拷贝工具函数
 */
const deepClone = (value: any) => JSON.parse(JSON.stringify(value))

// 鼠标移动单元格控制
const currMoveScheduleItem = ref<ScheduleItem>()
const currMovePosRef = ref({ x: 0, y: 0 })
const currMoveShow = ref(false)

// 鼠标点击单元格控制
const currClickScheduleUserItem = ref<ScheduleUserItem>()
const currClickScheduleDayItem = ref<ScheduleDayItem>()
const currClickPosRef = ref({ x: 0, y: 0 })
const currClickShow = ref(false)

const scheduleShiftTableContentRef = ref<any>(null)
const shiftPopupRef = ref<any>(null)

// 姓名悬浮提示:共享单实例,替代每行一个 n-popover(数百行时实例数会拖慢渲染)
const nameHoverUser = ref<ScheduleUserItem>()
const nameHoverPos = ref({ x: 0, y: 0 })
const nameHoverShow = ref(false)

// 虚拟滚动:仅渲染可见行,数百人时不生成上万个格子。
// 窗口起点按 WINDOW_STEP 行量化,滚动时每 STEP*ROW_HEIGHT 像素才重渲染一次
const ROW_HEIGHT = 40
const OVERSCAN = 8
const WINDOW_STEP = 8
const winStart = ref(0)
const tableClientH = ref(600)
let lastWinStart = 0

// 过滤后行数变少时,窗口起点需回落到有效范围内
const safeWinStart = computed(() => {
  const max = Math.max(0, scheduleMonthUserItems.value.length - 1)
  return Math.min(Math.max(0, winStart.value), max)
})

const windowUsers = computed(() => {
  const size = Math.ceil(tableClientH.value / ROW_HEIGHT) + OVERSCAN + WINDOW_STEP
  return scheduleMonthUserItems.value.slice(safeWinStart.value, safeWinStart.value + size)
})

function onTableScroll(e: Event) {
  const el = e.currentTarget as HTMLElement
  const raw = Math.max(0, Math.floor(el.scrollTop / ROW_HEIGHT) - OVERSCAN)
  const start = Math.floor(raw / WINDOW_STEP) * WINDOW_STEP
  if (start !== lastWinStart) {
    lastWinStart = start
    winStart.value = start
  }
  if (tableClientH.value !== el.clientHeight)
    tableClientH.value = el.clientHeight
}

// 打开与筛选后按实际可视高度重建窗口
function measureTable() {
  const el = scheduleShiftTableContentRef.value as HTMLElement | null
  winStart.value = 0
  lastWinStart = 0
  if (!el)
    return
  el.scrollTop = 0
  tableClientH.value = el.clientHeight
}

function handleNameEnter(item: ScheduleUserItem, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  nameHoverUser.value = item
  nameHoverPos.value = { x: rect.right, y: rect.top + rect.height / 2 }
  nameHoverShow.value = true
}

function handleNameLeave() {
  nameHoverShow.value = false
}

const colorHexArray = [
  '#EDEEEF',
  '#E8D1E3', // 柔和粉紫色
  '#D1E8E2', // 柔和青绿色
  '#E8E4D1', // 柔和米黄色
  '#D1DCE8', // 柔和蓝灰色
  '#E8D1D1', // 柔和粉红色
  '#D1E8D9', // 柔和浅绿色
  '#E6E8D1', // 柔和黄绿色
  '#DCD1E8', // 柔和紫灰色
  '#E8DBD1', // 柔和橙粉色
  '#D1E8F0', // 柔和天蓝色
  '#E4E8D1', // 柔和淡金色
  '#E0D1E8', // 柔和薰衣草色
  '#D1E8C9', // 柔和薄荷绿
  '#F0E8D1', // 柔和奶油色
  '#D1C9E8', // 柔和紫罗兰色
  '#E8D1E0', // 柔和玫瑰色
  '#D1E8D1', // 柔和淡绿色
  '#E8E0D1', // 柔和浅棕色
  '#D1D1E8', // 柔和蓝紫色
  '#E8D5D1', // 柔和珊瑚色
  '#D1E4E8', // 柔和青蓝色
  '#E8ECD1', // 柔和柠檬色
  '#DBD1E8', // 柔和灰紫色
  '#E8D1C9', // 柔和桃色
  '#C9E8D1', // 柔和嫩绿色
  '#E8D1D9', // 柔和莓红色
  '#D1C9E8', // 柔和淡紫色
  '#E8DBC9', // 柔和沙色
  '#C9D1E8', // 柔和淡蓝色
  '#D9E8D1', // 柔和青绿色
]

const shiftListShow = ref(false)

const checkInDateEditItem = ref<ScheduleItem>()
const checkInDateTypes = ref('')
const checkInDateInfo = ref<any>({
  name: null,
  checkin_time: [],
})

const modalRef = ref<ModalInst | null>(null)
const checkInDateModalRef = ref<ModalInst | null>(null)
const uploadDataRef = ref<any>(null)

async function open(params: any) {
  filterRef.value.group_name = params.group_name

  if (!(await schedule.load(params.id))) {
    toast.error('排班数据加载失败，请稍后重试')
    return
  }
  scheduleMonthItem.value = await schedule.getData()
  if (scheduleMonthItem.value)
    scheduleMonthUserItems.value = scheduleMonthItem.value.users

  filterRef.value.name = ''

  modalRef.value?.open()
  await nextTick()
  measureTable()
  // 弹窗刚打开时布局可能尚未定型,下一帧再校正一次窗口高度
  requestAnimationFrame(() => measureTable())
}

function close() {
  modalRef.value?.close()
}

function submit() {
  toast.infoModal(`确认保存排班？`, {
    positiveText: `保存`,
    negativeText: '取消',
    onPositiveClick: () => {
      btnLoading.value = true
      schedule
        .save()
        .then((res) => {
          if (!res)
            return
          toast.success('操作成功')
          emit('on-action', 'EDIT')
          modalRef.value?.close()
        })
        .finally(() => (btnLoading.value = false))
    },
  })
}

function canCopyPrevMonth() {
  if (!scheduleMonthItem.value) {
    return true
  }

  if (scheduleMonthItem.value.available) {
    const date = new Date()
    date.setTime(filterRef.value.date)
    const now = new Date()
    if (date.getMonth() >= now.getMonth())
      return false
  }

  return true
}

function copyPrevMonth() {
  const date = new Date()
  date.setTime(filterRef.value.date)
  const prevMonth = addMonths(date, -1).getMonth() + 1
  const month = date.getMonth() + 1

  toast.infoModal(
    `将复制${prevMonth}月的排班到${month}月，${month}月原有排班将被覆盖。确认复制排班？`,
    {
      positiveText: `复制排班`,
      negativeText: '取消',
      onPositiveClick: () => {
        schedule.copyPrevMonth()
      },
    },
  )
}

function checkInDateAdd(opt: string, item?: ScheduleItem) {
  checkInDateTypes.value = opt
  checkInDateEditItem.value = item

  if (opt === 'ADD') {
    checkInDateInfo.value.name = null
    checkInDateInfo.value.checkin_time = []
  }
  else if (opt === 'EDIT' && item) {
    checkInDateInfo.value = deepClone(item.checkin_date)
  }

  checkInDateModalRef.value?.open()
}

function checkInDateRemove(item: ScheduleItem) {
  toast.infoModal('确定删除吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: () => {
      schedule.removeSchedule(item.checkin_date.name!)
    },
  })
}

async function checkInDateSave() {
  if (!checkInDateInfo.value)
    return

  if (!checkInDateInfo.value.name || !checkInDateInfo.value.name.trim()) {
    toast.info('请输入班次名称')
    return
  }

  if (checkInDateTypes.value === 'ADD') {
    const checkinDate = deepClone(checkInDateInfo.value)
    if (!checkinDate.checkin_time)
      return
    await updatePeriodDateRange()
    if (!schedule.addSchedule(checkinDate)) {
      toast.info('已有重复的班次名称')
      return
    }
  }
  else {
    if (!checkInDateEditItem.value)
      return
    const checkinDate = unref(checkInDateInfo.value)
    if (!checkinDate || !checkinDate.checkin_time)
      return
    await updatePeriodDateRange()
    if (!schedule.updateSchedule(checkInDateEditItem.value, checkinDate)) {
      toast.info('已有重复的班次名称')
      return
    }
  }

  checkInDateModalRef.value?.close()
}

async function updatePeriodDateRange() {
  const checkinDate = checkInDateInfo.value
  if (!checkinDate || !checkinDate.checkin_time)
    return
  // 根据可打卡时段赋值
  for (const i in periodInfo.value) {
    const item = periodInfo.value[i]
    checkinDate.checkin_time[i].earliest_work_sec = item.earliest_work_sec
    checkinDate.checkin_time[i].latest_work_sec = item.latest_work_sec
    checkinDate.checkin_time[i].earliest_off_work_sec = item.earliest_off_work_sec
    checkinDate.checkin_time[i].latest_off_work_sec = item.latest_off_work_sec
  }
}

function handleShift() {
  shiftListShow.value = true
}

function shiftListCloseModal() {
  shiftListShow.value = false
}

async function handleFilter() {
  const nextScheduleMonthItem = await schedule.getData()
  if (nextScheduleMonthItem) {
    scheduleMonthItem.value = nextScheduleMonthItem
    const name = filterRef.value.name || ''
    if (name.length > 0) {
      scheduleMonthUserItems.value = nextScheduleMonthItem.users.filter(
        q => q.name.includes(name),
      )
    }
    else {
      scheduleMonthUserItems.value = nextScheduleMonthItem.users
    }
    measureTable()
  }
  else {
    toast.error('排班数据加载失败，请稍后重试')
  }
}

function handleCellClick(item: ScheduleUserItem, day: ScheduleDayItem, e: MouseEvent) {
  if (!scheduleMonthItem.value)
    return
  if (!scheduleMonthItem.value.available) {
    toast.info('不支持修改上月之前的排班')
    return
  }
  currClickScheduleUserItem.value = item
  currClickScheduleDayItem.value = day
  currClickShow.value = true
  currClickPosRef.value = { x: e.x, y: e.y }
}

function handleUserSetSchedule(item: ScheduleItem) {
  if (!currClickScheduleUserItem.value)
    return
  if (!currClickScheduleDayItem.value)
    return

  currClickScheduleUserItem.value.schedule.set(currClickScheduleDayItem.value.day, item)
}

function handleUserScheduleClear() {
  if (!currClickScheduleUserItem.value)
    return
  if (!currClickScheduleDayItem.value)
    return
  currClickScheduleUserItem.value.schedule.delete(currClickScheduleDayItem.value.day)
}

function handleUserSetSchedulePeriod(item: SchedulePeriodItem) {
  if (!currClickScheduleUserItem.value)
    return
  if (!currClickScheduleDayItem.value)
    return
  if (!scheduleMonthItem.value)
    return

  schedule.periodSchedule(
    scheduleMonthItem.value,
    currClickScheduleUserItem.value,
    currClickScheduleDayItem.value,
    item,
  )
}

function buildCellDisplay(item: ScheduleUserItem, day: ScheduleDayItem, dateText?: boolean) {
  const info = item.schedule.get(day.day)

  if (info) {
    if (dateText) {
      return info.describe
    }
    else {
      return info.short_name
    }
  }

  return ''
}

function buildCellMoveDisplay() {
  const info = currMoveScheduleItem.value
  if (info) {
    return info.describe
  }
  return ''
}

let lastMoveEl: HTMLElement | null = null

function handleCellMove(item: ScheduleUserItem, day: ScheduleDayItem, e: MouseEvent) {
  // 同一格内移动无需重复重定位,避免高频 mousemove 触发弹窗重渲染
  const el = e.currentTarget as HTMLElement
  if (el === lastMoveEl && currMoveShow.value)
    return
  const info = item.schedule.get(day.day)
  if (info) {
    lastMoveEl = el
    currMoveScheduleItem.value = info
    currMovePosRef.value = { x: e.x, y: e.y }
    currMoveShow.value = true
  }
  else {
    lastMoveEl = null
    currMoveShow.value = false
  }
}

function handleCellLeave() {
  lastMoveEl = null
  currMoveShow.value = false
}

function buildCellStyles(item: ScheduleUserItem, day: ScheduleDayItem) {
  const info = item.schedule.get(day.day)

  if (info) {
    return { backgroundColor: colorHexArray[info.index], color: isDark.value ? '#1a1a1a' : '#fff' }
  }

  return {}
}

// 点击事件
function handleClickOutside(e) {
  if (!shiftPopupRef.value)
    return
  const showDemand
    = (shiftPopupRef.value && shiftPopupRef.value.contains(e.target))
      || (scheduleShiftTableContentRef.value && scheduleShiftTableContentRef.value.contains(e.target))
  if (!showDemand) {
    currClickShow.value = false
  }

  if (
    !scheduleShiftTableContentRef.value
    && scheduleShiftTableContentRef.value.contains(e.target)
    && (e.target.classList.contains('schedule_shift_table_cell')
      || e.target.classList.contains('schedule_shift_table_cell_span'))
  ) {
    currClickShow.value = false
  }
}

function handleExport(key: any) {
  schedule.exportData(key === 'temp')
}

async function beforeUpload(data: { file: UploadFileInfo, fileList: UploadFileInfo[] }) {
  if (
    data.file.file!.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    uploadDataRef.value.clear()
    toast.info('请上传正确的排班表数据')
    return false
  }

  // 读取文件
  const res = await schedule.importData(await data.file.file!.arrayBuffer())
  if (res) {
    toast.info(res)
  }

  return false
}

function handleCheckinTimeUpdate(action) {
  if (action) {
    PeriodDateRangeRef.value?.buildPeriodInfo(true)
  }
}

// 挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="排班设置"
    width="90vw"
    height="90vh"
    :mask="true"
    class-name="shift-schedule-modal"
  >
    <template #default>
      <n-form label-placement="left" require-mark-placement="left" :label-width="100" class="schedule-shift-form">
        <n-grid>
          <n-form-item-gi :span="24" label="排班班次" :show-require-mark="true">
            <div class="flex flex-wrap gap-4">
              <n-tag
                v-for="(items, keys) in getSchedule"
                :key="keys"
                :color="{ color: colorHexArray[items.index], textColor: isDark ? '#1a1a1a' : '#fff' }"
              >
                <span>{{ items.describe }}</span>
              </n-tag>
              <n-button text @click="handleShift">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:form-outlined" />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-form-item-gi>
          <n-form-item-gi :span="24" label="排班周期" :show-require-mark="false">
            <Period v-model:value="periodRef" :options="getSchedule" />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <div class="schedule_shift_block">
        <div class="schedule_shift_toolbar">
          <div class="schedule_shift_toolbar_left">
            <n-date-picker
              v-model:value="filterRef.date"
              type="month"
              style="width: 120px"
              :is-date-disabled="dateDisabled"
              @update:value="handleFilter"
            />
            <n-input
              v-model:value="filterRef.name"
              placeholder="成员姓名"
              style="width: 180px"
              clearable
              @change="handleFilter"
            />
          </div>
          <div class="schedule_shift_toolbar_right">
            <n-space>
              <n-dropdown trigger="hover" :options="exportOptions" @select="handleExport">
                <n-button icon-placement="right">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:file-excel-outlined" />
                    </n-icon>
                  </template>
                  导出{{ new Date(filterRef.date).getMonth() + 1 }}月排班
                </n-button>
              </n-dropdown>
              <n-upload
                ref="uploadDataRef"
                :default-upload="false"
                :show-file-list="false"
                @before-upload="beforeUpload"
              >
                <n-button> 导入{{ new Date(filterRef.date).getMonth() + 1 }}月排班数据 </n-button>
              </n-upload>

              <n-button :disabled="canCopyPrevMonth()" @click="copyPrevMonth">
                复制上月排班
              </n-button>
            </n-space>
          </div>
        </div>
        <div ref="scheduleShiftTableContentRef" class="schedule_shift_table" @scroll="onTableScroll">
          <div class="schedule_shift_table_header">
            <div class="schedule_shift_table_name">
              姓名
            </div>
            <div
              v-for="(items, keys) in scheduleMonthItem?.days"
              :key="keys"
              class="schedule_shift_table_day"
            >
              <p class="date">
                {{ items.num }}
              </p>
              <p class="weekdays">
                {{ items.week }}
              </p>
            </div>
          </div>
          <div class="schedule_rows_viewport" :style="{ height: `${scheduleMonthUserItems.length * ROW_HEIGHT}px` }">
            <div class="schedule_rows_window" :style="{ transform: `translateY(${safeWinStart * ROW_HEIGHT}px)` }">
              <div
                v-for="item in windowUsers"
                :key="item.user_id"
                class="schedule_shift_table_row"
              >
                <div
                  class="schedule_shift_table_name"
                  style="cursor: pointer"
                  @mouseenter="handleNameEnter(item, $event)"
                  @mouseleave="handleNameLeave"
                >
                  {{ item.name }}
                </div>
                <div
                  v-for="(day, days_keys) in scheduleMonthItem?.days"
                  :key="days_keys"
                  class="schedule_shift_table_day truncate"
                >
                  <div
                    class="schedule_shift_table_cell truncate"
                    :style="buildCellStyles(item, day)"
                    @click="handleCellClick(item, day, $event)"
                    @mousemove="handleCellMove(item, day, $event)"
                    @mouseleave="handleCellLeave"
                  >
                    {{ buildCellDisplay(item, day) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 姓名悬浮(共享单实例) -->
      <n-popover
        :show="nameHoverShow"
        :x="nameHoverPos.x"
        :y="nameHoverPos.y"
        trigger="manual"
        placement="right"
      >
        <p>姓名：{{ nameHoverUser?.name }}</p>
        <p>手机：{{ nameHoverUser?.mobile }}</p>
        <p>单位：{{ nameHoverUser?.team_name }}</p>
      </n-popover>

      <!-- 鼠标经过显示详细 -->
      <n-popover :show="currMoveShow" :x="currMovePosRef.x" :y="currMovePosRef.y" trigger="manual">
        <span class="schedule_shift_table_cell_span">
          {{ buildCellMoveDisplay() }}
        </span>
      </n-popover>

      <!-- 点击弹窗 -->
      <n-popover
        :show="currClickShow"
        :x="currClickPosRef.x"
        :y="currClickPosRef.y"
        trigger="manual"
        placement="bottom"
      >
        <div ref="shiftPopupRef" class="shift-popup">
          <div class="shift-popup-content">
            <n-tabs
              default-value="set_1"
              justify-content="space-evenly"
              type="line"
              :pane-style="{ padding: 0 }"
            >
              <n-tab-pane name="set_1" tab="按班次排班">
                <div class="schedule-select-list">
                  <dl
                    v-for="(item, keys) in getSchedule"
                    :key="keys"
                    class="schedule-select-list-row"
                    @click="handleUserSetSchedule(item)"
                  >
                    <dd>
                      <span
                        class="circle_mark"
                        :style="{ backgroundColor: colorHexArray[item.index] }"
                      />
                    </dd>
                    <dd>{{ item.describe }}</dd>
                  </dl>
                </div>
              </n-tab-pane>
              <n-tab-pane name="set_2" tab="按周期排班">
                <div v-if="periodRef.length > 0" class="schedule-select-list">
                  <dl
                    v-for="(item, keys) in periodRef"
                    :key="keys"
                    class="schedule-select-list-row"
                    @click="handleUserSetSchedulePeriod(item)"
                  >
                    <dd style="flex: 1">
                      {{ item.name }}
                    </dd>
                  </dl>
                </div>
                <div v-else class="w-full flex items-center justify-center pb-4 pt-4">
                  <n-empty description="还没有排班周期" :show-icon="false" />
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>
          <n-button class="shift-popup-footer" @click="handleUserScheduleClear">
            清除
          </n-button>
        </div>
      </n-popover>

      <n-drawer
        v-model:show="shiftListShow"
        :width="520"
        placement="right"
        :mask-closable="false"
      >
        <n-drawer-content title="配置班次" closable>
          <div>
            <n-button type="default" style="width: 120px" @click="checkInDateAdd('ADD')">
              添加
            </n-button>
          </div>
          <div class="schedule_table">
            <dl class="schedule_table_header">
              <dd>班次名称</dd>
              <dd>操作</dd>
            </dl>
            <div v-for="(item, keys) in getSchedule" :key="keys">
              <dl v-if="item.index > 0" class="schedule_table_cell">
                <dd>
                  <span class="circle_mark" :style="{ backgroundColor: colorHexArray[item.index] }" />
                  {{ item.describe }}
                </dd>
                <dd>
                  <div class="flex items-center justify-center">
                    <n-button text type="primary" @click="checkInDateAdd('EDIT', item)">
                      编辑
                    </n-button>
                    <n-divider vertical />
                    <n-button text type="primary" @click="checkInDateRemove(item)">
                      删除
                    </n-button>
                  </div>
                </dd>
              </dl>
            </div>
          </div>

          <template #footer>
            <n-space>
              <n-button type="default" @click="shiftListCloseModal">
                关闭
              </n-button>
            </n-space>
          </template>

          <SpModal
            ref="checkInDateModalRef"
            title="添加班次"
            width="800"
            :mask="true"
          >
            <template #default>
              <n-form label-placement="left" require-mark-placement="left" :label-width="100">
                <n-grid :cols="24" :x-gap="20">
                  <n-form-item-gi :span="24" label="班次名称" :show-require-mark="true">
                    <n-input
                      v-model:value="checkInDateInfo.name"
                      :maxlength="20"
                      style="width: 240px"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="工作时间" :show-require-mark="true">
                    <CheckInTime v-model:value="checkInDateInfo.checkin_time" @on-action="handleCheckinTimeUpdate" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="可打卡时段">
                    <PeriodDateRange
                      ref="PeriodDateRangeRef"
                      v-model:value="periodInfo"
                      :check-in-time="checkInDateInfo.checkin_time"
                      :allow-next-day="true"
                      :allow-prev-day="true"
                      @update:value="updatePeriodDateRange"
                    />
                  </n-form-item-gi>
                </n-grid>
              </n-form>
            </template>

            <template #footer>
              <n-space justify="end">
                <n-button @click="checkInDateModalRef?.close">
                  关闭
                </n-button>
                <n-button type="primary" @click="checkInDateSave">
                  保存
                </n-button>
              </n-space>
            </template>
          </SpModal>
        </n-drawer-content>
      </n-drawer>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="submit">
          确定
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
  .check_in_time_box {
  background-color: rgba(6, 15, 26, 0.05);
  padding: 16px;
  font-size: 14px;
  .items-text {
    width: 100px;
  }
  .items-content {
    width: calc(100% - 100px);
  }
}

.alert-default-text {
  font-size: 13px;
  color: rgba(11, 18, 26, 0.6);
  line-height: 1;
}

.items-list {
  height: 34px;
}
.items-text {
  width: 82px;
  font-size: 14px;
  line-height: 1;
}
.items-content {
  width: calc(100% - 82px);
}

.table-list-wrapper {
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(6, 15, 26, 0.1);
  .table-list-title {
    width: 100%;
    display: flex;
    height: 32px;
    dl {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      background-color: rgba(5, 14, 26, 0.03);
      color: rgba(11, 18, 26, 0.6);
      padding: 0 16px;
      gap: 8px;
      dd {
        position: relative;
        line-height: 1;
        &::before {
          content: '';
          position: absolute;
          height: 14px;
          width: 1px;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(6, 15, 26, 0.1);
        }
        &:nth-child(1) {
          flex-basis: 180px;
          &::before {
            display: none;
          }
        }
        &:nth-child(2) {
          flex-basis: calc(100% - 180px);
        }
      }
    }
  }
  .table-list-content {
    width: 100%;
    display: flex;
    position: relative;
    padding: 16px;
    gap: 8px;
    align-items: center;
    background-color: #fff;
    color: rgba(14, 19, 25, 0.9);
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    &-item {
      &:nth-child(1) {
        flex-basis: 180px;
      }
      &:nth-child(2) {
        flex-basis: calc(100% - 180px - 80px);
      }
      &:nth-child(3) {
        flex-basis: 80px;
      }
    }
  }
  .table-list-bottom {
    display: flex;
    position: relative;
    height: 40px;
    align-items: center;
    justify-content: center;
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    dl {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      transition: all 0.3s ease-in-out;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 12px;
      &:hover {
        background-color: rgba(6, 15, 26, 0.05);
      }
      dd {
        display: flex;
        align-items: center;
        line-height: 1;
        &:nth-child(1) {
          color: #144384;
          span {
            line-height: 1;
            margin-left: 6px;
          }
        }
        &:nth-child(2) {
          color: rgba(11, 18, 26, 0.6);
          margin-left: 12px;
        }
      }
    }
  }
}

.checkin_date_desc {
  display: flex;
  height: 20px;
  align-items: center;
  font-size: 14px;
  margin-bottom: 4px;
  dd {
    line-height: 1;
    &.title {
      width: 100px;
      color: rgba(11, 18, 26, 0.6);
    }
    &.content {
      width: calc(100% - 100px);
      color: rgba(14, 19, 25, 0.9);
    }
  }
}

.gray-box-bg {
  background-color: rgba(6, 15, 26, 0.05);
}

.schedule_table {
  margin-top: 16px;
  font-size: 14px;
  dl {
    display: flex;
    align-items: center;
    &.schedule_table_header {
      background-color: #f6f6f7;
      color: rgba(11, 18, 26, 0.6);
      height: 28px;
    }
    &.schedule_table_cell {
      border-bottom: 1px solid rgba(6, 15, 26, 0.07);
      height: 53px;
    }
    dd {
      display: flex;
      align-items: center;
      line-height: 1;
      &:nth-child(1) {
        flex: 1;
        padding: 0 8px 0 16px;
      }
      &:nth-child(2) {
        width: calc(100% - 164px - 196px);
        justify-content: center;
      }
      .circle_mark {
        margin-right: 8px;
      }
    }
  }
}

.circle_mark {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.schedule_shift_form {
  flex-shrink: 0;
}

.schedule_shift_block {
  padding: 0 24px 20px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.schedule_shift_toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e7e7e8;
  border-bottom-width: 0;
  padding: 16px;
  flex-shrink: 0;
  &_left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
.schedule_shift_table {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  // 排班列表自身滚动,表头在列表内吸顶漂浮
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
    flex-basis: 94px;
    box-sizing: border-box;
    height: 54px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 8px;
  }
  &_day {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    flex: 1;
    font-size: 13px;
    border: 1px solid #e7e7e8;
    border-width: 1px 0 1px 1px;
    height: 54px;
    line-height: 18px;
    padding-top: 8px;
    overflow: hidden;
    flex-wrap: nowrap;
    &:last-child {
      border-width: 1px;
    }

    .weekdays {
      margin-top: 2px;
    }
  }
  &_row {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    .schedule_shift_table_name {
      border-width: 0 0 1px 1px;
      height: 40px;
    }
    .schedule_shift_table_day {
      border-top-width: 0;
      height: 40px;
      padding: 0;
    }
  }
  &_cell {
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1px;
    word-break: break-all;
    &:hover {
      background-color: rgba(0, 191, 255, 0.3);
    }
  }
}

.shift-popup {
  z-index: 100;
  box-sizing: border-box;
  background-color: #fff;
  width: 322px;
  &-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    border: 1px solid rgba(6, 15, 26, 0.07) !important;
    width: 100%;
    &:hover {
      ::v-deep(.n-button__state-border) {
        border: 1px solid rgba(6, 15, 26, 0.07) !important;
      }
    }
  }
}

.schedule-select-list {
  padding: 8px 4px 10px;
  dl {
    display: flex;
    align-items: center;
    height: 32px;
    font-size: 14px;
    position: relative;
    padding: 0 14px;
    cursor: pointer;
    dd {
      position: relative;
      z-index: 1;
      &:nth-child(1) {
        margin-right: 8px;
        flex-basis: 16px;
      }
      &:nth-child(2) {
        flex: 1;
      }
      .circle_mark {
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
    }
    &:hover {
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 4px;
        background-color: rgba(6, 15, 26, 0.05);
      }
      &::after {
        content: '';
        position: absolute;
        width: 3px;
        height: 16px;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        background-color: #267ef0;
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .schedule_shift_table_header {
    background-color: rgb(44, 44, 50);
  }

  .schedule_table {
    dl {
      &.schedule_table_header {
        background-color: rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.8);
      }
      &.schedule_table_cell {
        color: #fff;
        border-bottom-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .shift-popup {
    background-color: rgb(72, 72, 78);
  }

  .schedule-select-list {
    dl {
      &:hover {
        &::before {
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}
</style>

<style lang="less">
// 全局样式:内容区不整体滚动,仅排班列表滚动(配合表头吸顶)
.vxe-modal--wrapper.shift-schedule-modal {
  // vxe 默认规则优先级更高,需对齐提升才能覆盖 overflow
  &.type--modal .vxe-modal--body .vxe-modal--content {
    overflow: hidden;
  }

  .vxe-modal--content {
    display: flex;
    flex-direction: column;
  }

  // SpModal 的插槽包装层须参与弹性布局并向下传递高度,否则高度链断裂、表头无法吸顶
  .vxe-modal--content > div {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
  }
}
</style>
