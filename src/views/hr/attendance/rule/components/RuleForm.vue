<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { SpModal } from '@/components/SpModal'
import { employee, org } from '@/service/api/hr'
import { request } from '@/service/http'
import toast from '@/utils/toast'
import EffectivePicker from './EffectivePicker.vue'

/**
 * 考勤规则表单
 *
 * 没有复用通用 SpRecordForm：规则有「按模式显隐字段」（排班制不看固定工作日、
 * 自由工时没有弹性）、「选部门实时算覆盖人数」、「生效时间要弹窗选」三处，
 * 硬塞进按列元数据自动生成的表单里，只能靠一堆字段名特判。
 */
defineOptions({ name: 'AttendanceRuleForm' })

const emit = defineEmits<{ saved: [] }>()

type FormMode = 'create' | 'edit' | 'view'

interface DeptOption {
  value: string
  label: string
  count: number
}

const WEEKDAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
]

const MODES = ['固定班次', '自由工时', '排班制']

/** 排班制的班次草稿：时间控件要时间戳，落库时再转回 HH:mm */
interface ShiftDraft {
  name: string
  start: number | null
  end: number | null
  restStart: number | null
  restEnd: number | null
  restEnabled: boolean
  /** 固定班次：这个班次上哪几天（同一天只能属于一个班次） */
  workDays: number[]
}

/** 排班表的一格：某人某天上哪个班 */
interface RosterCell {
  member: string
  date: string
  shift: string
}

const modalRef = ref<ModalInst | null>(null)
const mode = ref<FormMode>('create')
const deptOptions = ref<DeptOption[]>([])

const form = reactive({
  id: '',
  rule_name: '',
  attendance_mode: '固定班次',
  depts: [] as string[],
  days: [1, 2, 3, 4, 5] as number[],
  startTime: null as number | null,
  endTime: null as number | null,
  restStart: null as number | null,
  restEnd: null as number | null,
  flex: false,
  flexMinutes: 30,
  standardHours: 8,
  lateLimit: 5,
  earlyLimit: 5,
  /** 班次库：固定班次每天一个班，排班制按人按天从这里挑 */
  shifts: [] as ShiftDraft[],
  /** 排班制：参与排班的人 + 排班表 */
  members: [] as string[],
  assignments: [] as RosterCell[],
  handoverMinutes: 30,
  effectiveMode: '立即生效',
  effectiveDate: '',
  /** 列表里带过来的覆盖人数：详情要展示当时算出来的值 */
  originalTotal: 0,
  utime: '',
})

const readonly = computed(() => mode.value === 'view')
const title = computed(() => ({ create: '新增考勤规则', edit: '编辑考勤规则', view: '考勤规则详情' })[mode.value])
const isShiftMode = computed(() => form.attendance_mode === '排班制')
const showFlex = computed(() => form.attendance_mode === '固定班次')

const memberTotal = computed(() =>
  form.depts.reduce((sum, dept) => sum + (deptOptions.value.find(item => item.value === dept)?.count ?? 0), 0),
)

/** 详情读原值，编辑按当前所选部门实时算 */
const displayTotal = computed(() => (readonly.value ? form.originalTotal : memberTotal.value))

/** 工作日文案：连续区间写成「周一至周五」，零散的逐个列出 */
const workDaysText = computed(() => {
  if (isShiftMode.value)
    return '按排班表'
  const days = [...form.days].sort((a, b) => a - b)
  if (!days.length)
    return '—'
  const label = (value: number) => WEEKDAYS.find(item => item.value === value)?.label ?? ''
  const isContinuous = days.every((value, index) => index === 0 || value === days[index - 1]! + 1)
  if (isContinuous && days.length > 2)
    return `${label(days[0]!)}至${label(days.at(-1)!)}`
  return days.map(label).join('、')
})

const flexText = computed(() => {
  if (!showFlex.value)
    return '—'
  return form.flex ? `弹性 ${form.flexMinutes} 分钟` : '不弹性'
})

/** 时间戳 → HH:mm */
function toHm(timestamp: number | null) {
  if (!timestamp)
    return ''
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** 今天的 YYYY-MM-DD：按本地时区拼，toISOString 在东八区会差一天 */
function today() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** HH:mm → 时间戳（日期固定为今天，只取时分） */
function fromHm(text?: string) {
  if (!text)
    return null
  const [hour, minute] = text.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute))
    return null
  const date = new Date()
  date.setHours(hour!, minute!, 0, 0)
  return date.getTime()
}

function newShift(name = '', start = '09:00', end = '18:00', workDays: number[] = []): ShiftDraft {
  return {
    name,
    start: fromHm(start),
    end: fromHm(end),
    restStart: fromHm('12:00'),
    restEnd: fromHm('13:00'),
    restEnabled: true,
    workDays: [...workDays],
  }
}

/** 这一天是否已经被别的班次占用：固定班次按天分工，不能两个班次抢同一天 */
function dayLockedBy(day: number, selfIndex: number) {
  return form.shifts.some((shift, index) => index !== selfIndex && shift.workDays.includes(day))
}

function toggleShiftDay(index: number, day: number) {
  const shift = form.shifts[index]
  if (!shift || dayLockedBy(day, index))
    return
  const at = shift.workDays.indexOf(day)
  if (at >= 0)
    shift.workDays.splice(at, 1)
  else
    shift.workDays.push(day)
}

/** 固定班次新增班次时，默认挑还空着的工作日 */
function nextFreeWorkDays() {
  const used = new Set(form.shifts.flatMap(item => item.workDays))
  return WEEKDAYS.map(item => item.value).filter(day => !used.has(day))
}

function addShift() {
  const free = nextFreeWorkDays()
  form.shifts.push(newShift(`班次 ${form.shifts.length + 1}`, '09:00', '18:00', free))
}

function removeShift(index: number) {
  if (form.shifts.length > 1)
    form.shifts.splice(index, 1)
}

function parseDays(text?: string) {
  if (!text || text === '按排班表')
    return []
  if (/周一至周日|每天/.test(text))
    return [1, 2, 3, 4, 5, 6, 7]
  if (/周一至周五/.test(text))
    return [1, 2, 3, 4, 5]
  if (/周一至周六/.test(text))
    return [1, 2, 3, 4, 5, 6]
  return WEEKDAYS.filter(item => text.includes(item.label)).map(item => item.value)
}

/** 排班人员候选：所选部门里的在职员工 */
const staffOptions = ref<{ name: string, dept: string }[]>([])
const candidateMembers = computed(() =>
  staffOptions.value.filter(item => form.depts.includes(item.dept)).map(item => item.name),
)

async function loadStaff() {
  if (staffOptions.value.length)
    return
  const { isSuccess, data } = await employee.rosterSearch({ page: 1, pagesize: 500 })
  if (!isSuccess || !data)
    return
  staffOptions.value = (data.list ?? [])
    .filter((item: Recordable) => item.staff_state !== '离职')
    .map((item: Recordable) => ({ name: String(item.employee_name ?? ''), dept: String(item.dept_name ?? '') }))
}

/** 多选人员变化的统一入口：被取消的人连同排班记录一起清掉 */
function syncMembers(next: string[]) {
  const removed = form.members.filter(name => !next.includes(name))
  form.members = next
  if (removed.length)
    form.assignments = form.assignments.filter(item => !removed.includes(item.member))
}

/** 排班表：从今天起的 7 天（不显示已经过去的日子，避免一开就是空行） */
const weekStart = ref(new Date(new Date().setHours(0, 0, 0, 0)).getTime())
const weekDates = computed(() =>
  Array.from({ length: 7 }, (_, index) => toDateText(new Date(weekStart.value + index * 86400_000))),
)
const weekLabel = computed(() =>
  `${weekDates.value[0]?.slice(5)} ~ ${weekDates.value[6]?.slice(5)}`,
)

function shiftWeek(step: number) {
  const next = new Date(weekStart.value)
  next.setDate(next.getDate() + step * 7)
  weekStart.value = next.getTime()
}

function toDateText(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 排班表可选值：班次库 + 休息 */
const shiftOptions = computed(() => [
  ...form.shifts.map(item => ({ label: item.name || '未命名班次', value: item.name })),
  { label: '休息', value: '休息' },
])

function cellValue(member: string, date: string) {
  return form.assignments.find(item => item.member === member && item.date === date)?.shift ?? null
}

function setCell(member: string, date: string, shift: string | null) {
  const at = form.assignments.findIndex(item => item.member === member && item.date === date)
  if (!shift) {
    if (at >= 0)
      form.assignments.splice(at, 1)
    return
  }
  if (at >= 0)
    form.assignments[at]!.shift = shift
  else
    form.assignments.push({ member, date, shift })
}

function weekdayOf(date: string) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(date).getDay()] ?? ''
}

/** 部门下拉：人数来自团队编制，选中部门时实时汇总覆盖人数 */
async function loadDepts() {
  if (deptOptions.value.length)
    return
  const { isSuccess, data } = await org.teamSearch({ page: 1, pagesize: 200 })
  if (!isSuccess || !data)
    return
  deptOptions.value = (data.list ?? []).map((row: Recordable) => ({
    value: String(row.dept_name ?? ''),
    label: String(row.dept_name ?? ''),
    count: Number(row.on_job ?? 0),
  }))
}

function reset(row?: Recordable) {
  form.id = String(row?.id ?? '')
  form.rule_name = String(row?.rule_name ?? '')
  form.attendance_mode = String(row?.attendance_mode ?? '固定班次')
  form.depts = row?.apply_dept ? String(row.apply_dept).split('、').filter(Boolean) : []
  form.days = parseDays(String(row?.work_days_text ?? ''))
  if (!form.days.length && form.attendance_mode !== '排班制')
    form.days = [1, 2, 3, 4, 5]
  form.startTime = fromHm(String(row?.start_time ?? '') || String(row?.work_time ?? '').split(' - ')[0])
  form.endTime = fromHm(String(row?.end_time ?? '') || String(row?.work_time ?? '').split(' - ')[1])
  const rest = String(row?.rest_time ?? '').split('-')
  form.restStart = fromHm(rest[0])
  form.restEnd = fromHm(rest[1])
  form.flex = Number(row?.flex_minutes ?? 0) > 0
  form.flexMinutes = Number(row?.flex_minutes ?? 30) || 30
  form.standardHours = Number(row?.standard_hours ?? 8)
  form.lateLimit = Number(row?.late_limit ?? 5)
  form.earlyLimit = Number(row?.early_limit ?? 5)
  form.effectiveMode = String(row?.effective_state ?? '立即生效')
  form.effectiveDate = String(row?.effective_date ?? '')
  const shifts = Array.isArray(row?.shifts) ? (row.shifts as Recordable[]) : []
  form.shifts = shifts.map((item) => {
    const rest = String(item.rest ?? '')
    const [restStart, restEnd] = rest.split('-')
    return {
      name: String(item.name ?? ''),
      start: fromHm(String(item.start ?? '')),
      end: fromHm(String(item.end ?? '')),
      restStart: fromHm(restStart),
      restEnd: fromHm(restEnd),
      restEnabled: !!rest && rest !== '不休息',
      workDays: Array.isArray(item.work_days) ? item.work_days.map(Number) : [],
    }
  })
  form.members = Array.isArray(row?.members) ? (row.members as string[]).map(String) : []
  form.assignments = Array.isArray(row?.assignments)
    ? (row.assignments as Recordable[]).map(item => ({
        member: String(item.member ?? ''),
        date: String(item.date ?? ''),
        shift: String(item.shift ?? ''),
      }))
    : []
  form.handoverMinutes = Number(row?.handover_minutes ?? 30)
  // 新建时两种模式都至少给一个班次，空表单没法下手
  if (!form.shifts.length)
    form.shifts = [newShift(form.attendance_mode === '排班制' ? '早班' : '标准班', '08:00', '17:00', form.attendance_mode === '固定班次' ? [1, 2, 3, 4, 5] : [])]
  form.originalTotal = Number(row?.member_total ?? 0)
  form.utime = String(row?.utime ?? '')
}

function open(options: { opt: FormMode, row?: Recordable }) {
  mode.value = options.opt
  reset(options.row)
  // 候选项（部门人数、员工名单）后台加载，不挡着弹窗打开
  void loadDepts()
  void loadStaff()
  if (mode.value === 'create') {
    // 新增给一套最常用的初值：标准上下班时间 + 立即生效。
    // 只留「名称」和「部门」要填，其余都能直接改，不必从空白开始
    form.startTime = fromHm('09:00')
    form.endTime = fromHm('18:00')
    form.restStart = fromHm('12:00')
    form.restEnd = fromHm('13:00')
    form.effectiveMode = '立即生效'
    form.effectiveDate = today()
    if (!form.shifts.length)
      form.shifts = [newShift('早班', '08:00', '17:00')]
  }
  modalRef.value?.setProps({
    title: title.value,
    width: 980,
    // 表单单比通用记录表单长（班次 + 参数 + 生效三段），给足高度让三组字段
    // 一屏看完；详情只有一张描述表，高度跟着内容走就行
    height: readonly.value ? 'auto' : 700,
    // 表单单比通用记录表单长（班次 + 参数 + 生效三段），给足高度让三组字段
    // 一屏看完；详情只有一张描述表，高度跟着内容走就行
    height: readonly.value ? 'auto' : 700,
    showOk: !readonly.value,
    okText: '保存',
    cancelText: readonly.value ? '关闭' : '取消',
  })
  modalRef.value?.open()
}

function validate() {
  if (!form.rule_name.trim())
    return '请填写规则名称'
  if (!form.depts.length)
    return '请选择适用部门'
  if (!form.startTime || !form.endTime)
    return '请选择上下班时间'
  if (!isShiftMode.value && form.startTime === form.endTime)
    return '上下班时间不能相同'
  if (!form.shifts.length)
    return '至少要有一个班次'
  const invalid = form.shifts.findIndex(item => !item.name.trim() || !item.start || !item.end)
  if (invalid >= 0)
    return `第 ${invalid + 1} 个班次还没填完整`
  if (isShiftMode.value && !form.members.length)
    return '排班制要先选择参与排班的人员'
  if (form.effectiveMode === '指定日期' && !form.effectiveDate)
    return '请选择生效日期'
  return null
}

async function handleOk({ done }: { done: (close?: boolean) => void }) {
  if (readonly.value) {
    done()
    return
  }
  const message = validate()
  if (message) {
    toast.warning(message)
    done(false)
    return
  }

  const payload: Recordable = {
    id: form.id || undefined,
    rule_name: form.rule_name.trim(),
    attendance_mode: form.attendance_mode,
    apply_dept: form.depts.join('、'),
    work_days_text: workDaysText.value,
    work_time: form.shifts[0]
      ? `${toHm(form.shifts[0].start)} - ${toHm(form.shifts[0].end)}`
      : '按排班表',
    shifts: form.shifts.map(item => ({
      name: item.name.trim(),
      start: toHm(item.start),
      end: toHm(item.end),
      rest: item.restEnabled && item.restStart && item.restEnd
        ? `${toHm(item.restStart)}-${toHm(item.restEnd)}`
        : '不休息',
      // 固定班次才有工作日；排班制由排班表决定，留空
      work_days: isShiftMode.value ? [] : [...item.workDays].sort((a, b) => a - b),
    })),
    shift_count: form.shifts.length,
    members: isShiftMode.value ? form.members : [],
    member_count: isShiftMode.value ? form.members.length : 0,
    assignments: isShiftMode.value ? form.assignments : [],
    assignment_count: isShiftMode.value ? form.assignments.length : 0,
    handover_minutes: form.handoverMinutes,
    rest_time: form.shifts[0]?.restEnabled && form.shifts[0].restStart && form.shifts[0].restEnd
      ? `${toHm(form.shifts[0].restStart)}-${toHm(form.shifts[0].restEnd)}`
      : '不休息',
    flex_text: flexText.value,
    flex_minutes: showFlex.value && form.flex ? form.flexMinutes : 0,
    standard_hours: form.standardHours,
    late_limit: form.lateLimit,
    early_limit: form.earlyLimit,
    start_time: toHm(form.shifts[0]?.start ?? null),
    end_time: toHm(form.shifts[0]?.end ?? null),
    member_total: memberTotal.value,
    effective_state: form.effectiveMode,
    effective_date: form.effectiveDate,
  }

  const { isSuccess } = await request.Post<Service.Response>('hr/attendance/rule/save', payload)
  if (!isSuccess) {
    toast.error('保存失败')
    done(false)
    return
  }
  toast.success(form.id ? '已保存' : `已新增「${payload.rule_name}」`)
  emit('saved')
  done()
}

defineExpose({ open })
</script>

<template>
  <SpModal ref="modalRef" :width="980" @ok="handleOk">
    <!-- 只读详情 -->
    <n-descriptions v-if="readonly" bordered :column="2" label-placement="left" size="small">
      <n-descriptions-item label="规则名称" :span="2">
        {{ form.rule_name }}
      </n-descriptions-item>
      <n-descriptions-item label="考勤模式">
        {{ form.attendance_mode }}
      </n-descriptions-item>
      <n-descriptions-item label="覆盖人数">
        {{ displayTotal }} 人
      </n-descriptions-item>
      <n-descriptions-item label="适用部门" :span="2">
        {{ form.depts.join('、') || '—' }}
      </n-descriptions-item>

      <n-descriptions-item label="班次" :span="2">
        <div class="rule-form__shift-list">
          <div v-for="(shift, index) in form.shifts" :key="index" class="rule-form__shift-tag">
            <b>{{ shift.name }}</b>
            <span>{{ toHm(shift.start) }}-{{ toHm(shift.end) }}</span>
            <span v-if="shift.restEnabled && shift.restStart && shift.restEnd" class="rule-form__shift-tag-hint">
              休 {{ toHm(shift.restStart) }}-{{ toHm(shift.restEnd) }}
            </span>
            <span v-if="!isShiftMode" class="rule-form__shift-tag-hint">
              {{ shift.workDays.length ? shift.workDays.map(day => WEEKDAYS.find(item => item.value === day)?.label).join('、') : '未设工作日' }}
            </span>
          </div>
        </div>
      </n-descriptions-item>

      <n-descriptions-item v-if="isShiftMode" label="排班" :span="2">
        {{ form.members.length }} 人参与 · 已排 {{ form.assignments.length }} 人次
      </n-descriptions-item>

      <n-descriptions-item v-if="!isShiftMode" label="弹性">
        {{ flexText }}
      </n-descriptions-item>
      <n-descriptions-item label="标准工时">
        {{ form.standardHours }} 小时
      </n-descriptions-item>
      <n-descriptions-item v-if="isShiftMode" label="交接间隔">
        {{ form.handoverMinutes }} 分钟
      </n-descriptions-item>
      <n-descriptions-item label="迟到判定">
        超过 {{ form.lateLimit }} 分钟
      </n-descriptions-item>
      <n-descriptions-item label="早退判定">
        超过 {{ form.earlyLimit }} 分钟
      </n-descriptions-item>
      <n-descriptions-item label="生效时间" :span="2">
        <EffectivePicker
          :mode="form.effectiveMode"
          :date="form.effectiveDate"
          readonly
        />
      </n-descriptions-item>
    </n-descriptions>

    <!-- 新增 / 编辑 -->
    <n-form
      v-else
      class="rule-form__body"
      label-placement="left"
      :label-width="104"
      size="small"
    >
      <div class="rule-form__group">
        <span class="rule-form__group-title">基本信息</span>
      </div>
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-gi label="规则名称" :span="2">
          <n-input v-model:value="form.rule_name" placeholder="如：总部标准班次" clearable maxlength="30" show-count />
        </n-form-item-gi>

        <n-form-item-gi label="考勤模式" :span="2">
          <n-radio-group v-model:value="form.attendance_mode">
            <n-radio-button v-for="item in MODES" :key="item" :value="item">
              {{ item }}
            </n-radio-button>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi label="适用部门" :span="2">
          <n-select
            v-model:value="form.depts"
            :options="deptOptions"
            multiple
            filterable
            placeholder="选择适用部门，可多选"
          />
          <template #feedback>
            已选 {{ form.depts.length }} 个部门 · 覆盖 {{ memberTotal }} 人
          </template>
        </n-form-item-gi>
      </n-grid>
      <div class="rule-form__group">
        <span class="rule-form__group-title">班次设置</span>
      </div>

      <!-- 班次库：一行一个字段，左侧带标题，比横着塞一排好读 -->
      <div class="rule-form__shifts">
        <div v-for="(shift, index) in form.shifts" :key="index" class="rule-form__shift">
          <div class="rule-form__shift-row">
            <span class="rule-form__shift-label">班次名称</span>
            <n-input
              v-model:value="shift.name"
              placeholder="如：早班"
              maxlength="10"
              class="rule-form__shift-name"
            />
            <n-button text type="error" :disabled="form.shifts.length <= 1" @click="removeShift(index)">
              删除
            </n-button>
          </div>

          <div class="rule-form__shift-row">
            <span class="rule-form__shift-label">上下班</span>
            <n-time-picker v-model:value="shift.start" format="HH:mm" :clearable="false" class="rule-form__shift-time" />
            <span class="rule-form__unit">至</span>
            <n-time-picker v-model:value="shift.end" format="HH:mm" :clearable="false" class="rule-form__shift-time" />
          </div>

          <div class="rule-form__shift-row">
            <span class="rule-form__shift-label">休息时段</span>
            <template v-if="shift.restEnabled">
              <n-time-picker
                v-model:value="shift.restStart"
                format="HH:mm"
                :clearable="false"
                class="rule-form__shift-time"
              />
              <span class="rule-form__unit">至</span>
              <n-time-picker
                v-model:value="shift.restEnd"
                format="HH:mm"
                :clearable="false"
                class="rule-form__shift-time"
              />
            </template>
            <span v-else class="rule-form__unit rule-form__unit--muted">不休息</span>
            <n-switch v-model:value="shift.restEnabled" size="small" class="rule-form__shift-switch" />
          </div>

          <!-- 固定班次：同一天只能被一个班次占用，被占的置灰 -->
          <div v-if="!isShiftMode" class="rule-form__shift-row">
            <span class="rule-form__shift-label">工作日</span>
            <n-space :size="14">
              <n-checkbox
                v-for="item in WEEKDAYS"
                :key="item.value"
                :label="item.label"
                :checked="shift.workDays.includes(item.value)"
                :disabled="dayLockedBy(item.value, index)"
                @update:checked="() => toggleShiftDay(index, item.value)"
              />
            </n-space>
          </div>
        </div>

        <n-button text type="primary" class="rule-form__add-shift" @click="addShift">
          + 添加班次
        </n-button>

        <div v-if="!isShiftMode" class="rule-form__flex-row">
          <span class="rule-form__shift-label">弹性打卡</span>
          <n-switch v-model:value="form.flex" size="small" />
          <template v-if="form.flex">
            <n-input-number
              v-model:value="form.flexMinutes"
              :min="5"
              :max="240"
              :step="5"
              :show-button="false"
              class="rule-form__number"
            >
              <template #suffix>
                分钟
              </template>
            </n-input-number>
            <span class="rule-form__hint-inline">上下班时间前后各放宽该区间</span>
          </template>
        </div>
      </div>

      <!-- 排班表：排班制才有，按人按天排 -->
      <template v-if="isShiftMode">
        <div class="rule-form__group">
          <span class="rule-form__group-title">排班表</span>
        </div>

        <div class="rule-form__roster-bar">
          <n-select
            :value="form.members"
            :options="candidateMembers.map(name => ({ label: name, value: name }))"
            multiple
            filterable
            placeholder="选择参与排班的人员"
            class="rule-form__member-select"
            @update:value="syncMembers"
          />
          <span class="rule-form__roster-meta">{{ form.members.length }} 人 · {{ form.assignments.length }} 人次</span>
          <div class="rule-form__week">
            <n-button text @click="shiftWeek(-1)">
              ‹
            </n-button>
            <span class="rule-form__week-label">{{ weekLabel }}</span>
            <n-button text @click="shiftWeek(1)">
              ›
            </n-button>
          </div>
        </div>

        <div v-if="!form.members.length" class="rule-form__roster-empty">
          先从上面选择参与排班的人员
        </div>
        <div v-else class="roster">
          <div class="roster__row roster__row--head">
            <span class="roster__name">人员</span>
            <span v-for="date in weekDates" :key="date" class="roster__head-cell">
              <em>{{ weekdayOf(date) }}</em>
              <span>{{ date.slice(5) }}</span>
            </span>
          </div>
          <div v-for="member in form.members" :key="member" class="roster__row">
            <span class="roster__name">{{ member }}</span>
            <n-select
              v-for="date in weekDates"
              :key="date"
              size="tiny"
              :value="cellValue(member, date)"
              :options="shiftOptions"
              clearable
              placeholder="—"
              class="roster__cell"
              @update:value="(value: string | null) => setCell(member, date, value)"
            />
          </div>
        </div>
      </template>

      <div class="rule-form__group">
        <span class="rule-form__group-title">参数与生效</span>
      </div>
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-gi v-if="showFlex" label="弹性打卡">
          <n-space align="center" :size="8">
            <n-switch v-model:value="form.flex" />
            <n-input-number
              v-if="form.flex"
              v-model:value="form.flexMinutes"
              :min="5"
              :max="240"
              :step="5"
              :show-button="false"
              class="rule-form__number"
            >
              <template #suffix>
                分钟
              </template>
            </n-input-number>
          </n-space>
        </n-form-item-gi>

        <n-form-item-gi label="标准工时">
          <n-input-number
            v-model:value="form.standardHours"
            :min="1"
            :max="24"
            :step="0.5"
            :show-button="false"
            class="rule-form__number"
          >
            <template #suffix>
              小时
            </template>
          </n-input-number>
        </n-form-item-gi>

        <n-form-item-gi v-if="isShiftMode" label="交接间隔">
          <n-input-number
            v-model:value="form.handoverMinutes"
            :min="0"
            :max="120"
            :show-button="false"
            class="rule-form__number"
          >
            <template #suffix>
              分钟
            </template>
          </n-input-number>
        </n-form-item-gi>

        <n-form-item-gi label="异常判定" :span="2">
          <n-space align="center" :size="10">
            <span class="rule-form__unit">迟到</span>
            <n-input-number v-model:value="form.lateLimit" :min="0" :max="120" :show-button="false" class="rule-form__number">
              <template #suffix>
                分钟
              </template>
            </n-input-number>
            <span class="rule-form__unit rule-form__unit--gap">早退</span>
            <n-input-number v-model:value="form.earlyLimit" :min="0" :max="120" :show-button="false" class="rule-form__number">
              <template #suffix>
                分钟
              </template>
            </n-input-number>
          </n-space>
        </n-form-item-gi>

        <n-form-item-gi label="生效时间" :span="2">
          <div class="rule-form__picker">
            <EffectivePicker
              :mode="form.effectiveMode"
              :date="form.effectiveDate"
              @update:mode="(value: string) => (form.effectiveMode = value)"
              @update:date="(value: string) => (form.effectiveDate = value)"
            />
          </div>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </SpModal>
</template>

<style lang="less" scoped>
.rule-form {
  // 字段多的时候整张表单滚动（班次区本身不滚，自然往下长）
  &__body {
    max-height: 520px;
    overflow-y: auto;
    padding-right: 6px;
  }

  // 分组标题：与 label 同宽右对齐 + 一条淡线，标题和字段名在同一条竖线上
  &__group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0 14px;

    &:first-child {
      margin-top: 0;
    }

    &-title {
      flex: none;
      width: 104px;
      text-align: right;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--atlas-text);
    }

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--atlas-border);
    }
  }

  // 班次是自然排布的：班次多就往下长，不套滚动条
  &__shifts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  &__shift {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--atlas-border);
    border-radius: var(--atlas-radius-sm);
    background: var(--atlas-surface-soft);
  }

  // 卡片内一行一个字段：左侧标题 + 右侧控件，标题右对齐到同一条线
  &__shift-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__shift-label {
    flex: none;
    width: 88px;
    margin-right: 6px;
    text-align: right;
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }

  &__shift-switch {
    margin-left: 6px;
  }

  &__shift-name {
    width: 190px;
    flex: none;
  }

  // 删除靠卡片右侧，不和名称挤在一起
  &__shift-row .n-button {
    margin-left: auto;
  }

  &__shift-time {
    width: 128px;
    flex: none;
  }

  &__flex-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px 0;
  }

  &__add-shift {
    align-self: flex-start;
  }

  &__roster-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  &__member-select {
    flex: 1;
    max-width: 420px;
  }

  &__roster-meta {
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }

  &__week {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }

  &__week-label {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--atlas-text-secondary);
  }

  &__roster-empty {
    padding: 18px;
    border: 1px dashed var(--atlas-border);
    border-radius: var(--atlas-radius-sm);
    font-size: 12px;
    color: var(--atlas-text-tertiary);
    text-align: center;
  }

  &__shift-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__shift-tag {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    color: var(--atlas-text-secondary);

    b {
      font-weight: 600;
      color: var(--atlas-text);
    }
  }

  &__shift-tag-hint {
    color: var(--atlas-text-tertiary);
  }

  &__hint {
    font-size: 12px;
    line-height: 32px;
    color: var(--atlas-text-tertiary);
  }

  &__hint-inline {
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }

  &__number {
    width: 110px;
    flex: none;
  }

  &__picker {
    width: 320px;
  }

  &__unit {
    font-size: 12px;
    color: var(--atlas-text-secondary);

    &--gap {
      margin-left: 10px;
    }

    &--muted {
      color: var(--atlas-text-tertiary);
    }
  }
}

/* 排班表：人员 × 一周七天 */
.roster {
  border: 1px solid var(--atlas-border);
  border-radius: var(--atlas-radius-sm);
  overflow: hidden;

  &__row {
    display: grid;
    grid-template-columns: 88px repeat(7, minmax(0, 1fr));
    align-items: center;
    gap: 6px;
    padding: 6px 10px;

    & + & {
      border-top: 1px solid var(--atlas-border);
    }

    &--head {
      background: var(--atlas-surface-soft);
    }
  }

  &__name {
    font-size: 12px;
    color: var(--atlas-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__head-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    font-size: 11px;
    color: var(--atlas-text-tertiary);

    em {
      font-style: normal;
      color: var(--atlas-text-secondary);
    }
  }

  &__cell {
    width: 100%;
  }
}
</style>
