<script lang="ts" setup>
import type { DateRangeValue, ShortcutItem } from './types'
import { addDays, addMonths, addYears, endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear } from 'date-fns'
import { spDateRangeProps } from './props'
import SpDateShortcuts from './SpDateShortcuts.vue'
import { toNumberTs } from './types'

const props = defineProps(spDateRangeProps)

const emit = defineEmits<{
  'update:modelValue': [value: DateRangeValue]
  'change': [value: [number | null, number | null]]
  'clear': []
}>()

// ─── 内部状态 ───
// 日期值统一存储为 startOfDay 结果（当天零点时间戳）
// 时间值存储为原始毫秒时间戳（仅 datetime 模式使用）

const startDate = ref<number | null>(null)
const endDate = ref<number | null>(null)
const startTime = ref<number | null>(null)
const endTime = ref<number | null>(null)

const isDatetime = computed(() => props.type === 'datetime')

/** 粒度配置：date/month/year 的分派收拢为一张表，新增粒度只需加一行 */
const GRANULARITY = {
  date: {
    startOf: startOfDay,
    endOf: endOfDay,
    add: addDays,
    format: 'yyyy-MM-dd',
    label: '日期',
    picker: 'date' as const,
  },
  month: {
    startOf: startOfMonth,
    endOf: endOfMonth,
    add: addMonths,
    format: 'yyyy-MM',
    label: '月份',
    picker: 'month' as const,
  },
  year: {
    startOf: startOfYear,
    endOf: endOfYear,
    add: addYears,
    format: 'yyyy',
    label: '年份',
    picker: 'year' as const,
  },
} as const

const g = computed(() => {
  if (props.type === 'year')
    return GRANULARITY.year
  if (props.type === 'month')
    return GRANULARITY.month
  return GRANULARITY.date
})

const pickerType = computed(() => g.value.picker)
const effectiveDateFormat = computed(() => props.dateFormat ?? g.value.format)
const startPlaceholder = computed(() => `开始${g.value.label}`)
const endPlaceholder = computed(() => `结束${g.value.label}`)

function truncStart(ts: number): number {
  return g.value.startOf(ts).getTime()
}

function truncEnd(ts: number): number {
  return g.value.endOf(ts).getTime()
}

function addUnit(ts: number, amount = 1): number {
  return g.value.add(ts, amount).getTime()
}

/** 从日期+时间合成最终时间戳 */
function composeTs(dateTs: number | null, timeTs: number | null): number | null {
  if (dateTs == null)
    return null
  if (!isDatetime.value || timeTs == null)
    return dateTs
  return dateTs + (timeTs - startOfDay(timeTs).getTime())
}

// ─── modelValue 输入解析 ───

function parseInput(val: DateRangeValue) {
  if (!val) {
    startDate.value = null
    endDate.value = null
    startTime.value = null
    endTime.value = null
    return
  }

  const startTs = toNumberTs(val[0])
  const endTs = toNumberTs(val[1])

  if (startTs != null) {
    startDate.value = truncStart(startTs)
    startTime.value = startTs
  }
  else {
    startDate.value = null
    startTime.value = null
  }

  if (endTs != null) {
    if (isDatetime.value) {
      endDate.value = startOfDay(endTs).getTime()
      endTime.value = endTs
    }
    else if (props.endOfDay) {
      endDate.value = truncStart(endTs)
    }
    else {
      endDate.value = addUnit(truncStart(endTs), -1)
    }
  }
  else {
    endDate.value = null
    endTime.value = null
  }
}

watch(() => props.modelValue, parseInput, { immediate: true })

// ─── 输出计算 ───

function buildOutput(): [number | null, number | null] {
  const start = isDatetime.value ? composeTs(startDate.value, startTime.value) : startDate.value

  let end: number | null = null
  if (endDate.value != null) {
    if (isDatetime.value) {
      end = composeTs(endDate.value, endTime.value)
    }
    else if (props.endOfDay) {
      end = truncEnd(endDate.value)
    }
    else {
      // endOfDay=false：始终输出下一区间起始，用户看到的是所选日期/月份/年份
      end = addUnit(endDate.value)
    }
  }

  return [start, end]
}

function emitChange(wasAllEmpty: boolean) {
  const [start, end] = buildOutput()
  const allEmpty = start == null && end == null
  const value: DateRangeValue = allEmpty && props.nullWhenEmpty ? null : [start, end]
  emit('update:modelValue', value)
  emit('change', [start, end])
  if (allEmpty && !wasAllEmpty) {
    emit('clear')
  }
}

// ─── DatePicker 事件处理 ───

function onStartUpdate(val: number | null) {
  const wasEmpty = startDate.value == null && endDate.value == null
  startDate.value = val
  // enforceOrder: 开始超过结束时自动清空结束
  if (props.enforceOrder && props.autoClearEnd && val != null && endDate.value != null && val > endDate.value) {
    endDate.value = null
    endTime.value = null
  }
  emitChange(wasEmpty)
}

function onEndUpdate(val: number | null) {
  const wasEmpty = startDate.value == null && endDate.value == null
  endDate.value = val
  emitChange(wasEmpty)
}

// ─── TimePicker 事件处理 ───

function onStartTimeUpdate(val: number | null) {
  const wasEmpty = startDate.value == null && endDate.value == null
  startTime.value = val
  emitChange(wasEmpty)
}

function onEndTimeUpdate(val: number | null) {
  const wasEmpty = startDate.value == null && endDate.value == null
  endTime.value = val
  emitChange(wasEmpty)
}

// ─── 日期禁用约束 ───

const minTs = computed(() => toNumberTs(props.min ?? null))
const maxTs = computed(() => toNumberTs(props.max ?? null))

function isStartDisabled(ts: number): boolean {
  if (minTs.value != null && ts < minTs.value)
    return true
  if (maxTs.value != null && ts > maxTs.value)
    return true
  return false
}

function isEndDisabled(ts: number): boolean {
  if (minTs.value != null && ts < minTs.value)
    return true
  if (maxTs.value != null && ts > maxTs.value)
    return true
  // enforceOrder：结束日期不能早于开始日期
  if (props.enforceOrder && startDate.value != null && ts < startDate.value)
    return true
  return false
}

// ─── 时间范围过滤（直接传数组给 n-time-picker） ───

const startTimeFilter = computed(() => ({
  hours: props.startTimeHours ?? props.timeHours,
  minutes: props.startTimeMinutes ?? props.timeMinutes,
  seconds: props.startTimeSeconds ?? props.timeSeconds,
}))

const endTimeFilter = computed(() => ({
  hours: props.endTimeHours ?? props.timeHours,
  minutes: props.endTimeMinutes ?? props.timeMinutes,
  seconds: props.endTimeSeconds ?? props.timeSeconds,
}))

// ─── 快捷选择（箭头图标触发 Popover） ───

const shortcutActiveKey = ref('')
const hasShortcuts = computed(() => props.shortcuts && props.shortcuts.length > 0)

function onShortcutSelect(item: ShortcutItem) {
  shortcutActiveKey.value = item.key
  const [s, e] = item.getRange()
  const wasEmpty = startDate.value == null && endDate.value == null
  startDate.value = truncStart(s)
  endDate.value = truncStart(e)
  startTime.value = s
  endTime.value = e
  emitChange(wasEmpty)
}

function onShortcutClear() {
  shortcutActiveKey.value = ''
}

// 手动修改日期时清除快捷高亮
watch([startDate, endDate], () => {
  shortcutActiveKey.value = ''
})
</script>

<script lang="ts">
export default { name: 'SpDateRange' }
</script>

<template>
  <n-flex :wrap="isDatetime">
    <n-input-group>
      <!-- 开始日期/月份/年份 -->
      <n-date-picker
        :value="startDate"
        :type="pickerType"
        :format="effectiveDateFormat"
        :formatted-value="undefined"
        :clearable="clearable"
        :disabled="disabled"
        :is-date-disabled="isStartDisabled"
        :fast-year-select="fastYearSelect"
        :fast-month-select="fastMonthSelect"
        :placeholder="startPlaceholder"
        style="flex: 1"
        @update:value="onStartUpdate"
      />

      <!-- 开始时间（datetime 模式） -->
      <n-time-picker
        v-if="isDatetime"
        :value="startTime"
        :format="timeFormat"
        :clearable="clearable"
        :disabled="disabled"
        :hours="startTimeFilter.hours"
        :minutes="startTimeFilter.minutes"
        :seconds="startTimeFilter.seconds"
        placeholder="开始时间"
        style="flex: 1"
        @update:value="onStartTimeUpdate"
      />

      <!-- 箭头分隔符（有快捷时触发 Popover） -->
      <n-popover v-if="hasShortcuts" trigger="hover" placement="bottom">
        <template #trigger>
          <n-input-group-label
            class="flex cursor-pointer items-center"
            :class="shortcutActiveKey ? 'color-primary' : 'color-gray-400'"
          >
            <NaIcon icon="ant-design:arrow-right-outlined" />
          </n-input-group-label>
        </template>
        <SpDateShortcuts
          v-model="shortcutActiveKey"
          :shortcuts="shortcuts"
          @select="onShortcutSelect"
          @clear="onShortcutClear"
        />
      </n-popover>
      <n-input-group-label v-else class="flex items-center color-gray-400">
        <NaIcon icon="ant-design:arrow-right-outlined" />
      </n-input-group-label>

      <!-- 结束日期/月份/年份 -->
      <n-date-picker
        :value="endDate"
        :type="pickerType"
        :format="effectiveDateFormat"
        :formatted-value="undefined"
        :clearable="clearable"
        :disabled="disabled"
        :is-date-disabled="isEndDisabled"
        :fast-year-select="fastYearSelect"
        :fast-month-select="fastMonthSelect"
        :placeholder="endPlaceholder"
        style="flex: 1"
        @update:value="onEndUpdate"
      />

      <!-- 结束时间（datetime 模式） -->
      <n-time-picker
        v-if="isDatetime"
        :value="endTime"
        :format="timeFormat"
        :clearable="clearable"
        :disabled="disabled"
        :hours="endTimeFilter.hours"
        :minutes="endTimeFilter.minutes"
        :seconds="endTimeFilter.seconds"
        placeholder="结束时间"
        style="flex: 1"
        @update:value="onEndTimeUpdate"
      />
    </n-input-group>
  </n-flex>
</template>
