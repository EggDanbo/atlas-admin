<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { SpModal } from '@/components/SpModal'
import { org } from '@/service/api/hr'
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

const workTimeText = computed(() =>
  form.startTime && form.endTime ? `${toHm(form.startTime)} - ${toHm(form.endTime)}` : '—',
)

const restTimeText = computed(() =>
  form.restStart && form.restEnd ? `${toHm(form.restStart)}-${toHm(form.restEnd)}` : '不休息',
)

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
  form.originalTotal = Number(row?.member_total ?? 0)
  form.utime = String(row?.utime ?? '')
}

async function open(options: { opt: FormMode, row?: Recordable }) {
  mode.value = options.opt
  await loadDepts()
  reset(options.row)
  if (mode.value === 'create') {
    // 新增给一套最常用的初值：标准上下班时间 + 立即生效。
    // 只留「名称」和「部门」要填，其余都能直接改，不必从空白开始
    form.startTime = fromHm('09:00')
    form.endTime = fromHm('18:00')
    form.restStart = fromHm('12:00')
    form.restEnd = fromHm('13:00')
    form.effectiveMode = '立即生效'
    form.effectiveDate = today()
  }
  modalRef.value?.setProps({
    title: title.value,
    width: 800,
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
  if (form.startTime === form.endTime)
    return '上下班时间不能相同'
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
    work_time: workTimeText.value,
    rest_time: restTimeText.value,
    flex_text: flexText.value,
    flex_minutes: showFlex.value && form.flex ? form.flexMinutes : 0,
    standard_hours: form.standardHours,
    late_limit: form.lateLimit,
    early_limit: form.earlyLimit,
    start_time: toHm(form.startTime),
    end_time: toHm(form.endTime),
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
  <SpModal ref="modalRef" :width="800" @ok="handleOk">
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
      <n-descriptions-item label="工作日">
        {{ workDaysText }}
      </n-descriptions-item>
      <n-descriptions-item label="班次时间">
        {{ workTimeText }}
      </n-descriptions-item>
      <n-descriptions-item label="休息时段">
        {{ restTimeText }}
      </n-descriptions-item>
      <n-descriptions-item label="弹性">
        {{ flexText }}
      </n-descriptions-item>
      <n-descriptions-item label="标准工时">
        {{ form.standardHours }} 小时
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
        基本信息
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
        班次设置
      </div>
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-gi label="工作日" :span="2">
          <div v-if="isShiftMode" class="rule-form__hint">
            排班制按排班表执行，不需要固定工作日
          </div>
          <n-checkbox-group v-else v-model:value="form.days">
            <n-space :size="18">
              <n-checkbox v-for="item in WEEKDAYS" :key="item.value" :value="item.value" :label="item.label" />
            </n-space>
          </n-checkbox-group>
        </n-form-item-gi>

        <n-form-item-gi label="上班时间">
          <n-time-picker v-model:value="form.startTime" format="HH:mm" class="w-full" :clearable="false" />
        </n-form-item-gi>
        <n-form-item-gi label="下班时间">
          <n-time-picker v-model:value="form.endTime" format="HH:mm" class="w-full" :clearable="false" />
        </n-form-item-gi>

        <n-form-item-gi label="休息开始">
          <n-time-picker v-model:value="form.restStart" format="HH:mm" class="w-full" placeholder="不休息" />
        </n-form-item-gi>
        <n-form-item-gi label="休息结束">
          <n-time-picker v-model:value="form.restEnd" format="HH:mm" class="w-full" placeholder="不休息" />
        </n-form-item-gi>
      </n-grid>

      <div class="rule-form__group">
        参数与生效
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
  &__body {
    padding-right: 4px;
  }

  // 分组标题做成「小字 + 一条延伸到右边的细线」：能分段，又不至于像三个大标题
  // 把表单切成三块 —— 视觉上仍是一个连续的表单
  &__group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px 0 4px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--atlas-text-secondary);

    &:first-child {
      margin-top: 0;
    }

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--atlas-divider);
    }
  }

  &__hint {
    font-size: 12px;
    line-height: 32px;
    color: var(--atlas-text-tertiary);
  }

  &__number {
    width: 110px;
    flex: none;
  }

  // 生效时间不是「填内容」而是「选一个开关」，宽度收到和输入框相当即可
  &__picker {
    width: 320px;
  }

  // 生效时间不是「填内容」而是「选一个开关」，宽度收到和输入框相当即可
  &__picker {
    width: 320px;
  }

  &__unit {
    font-size: 12px;
    color: var(--atlas-text-secondary);

    &--gap {
      margin-left: 10px;
    }
  }
}
</style>
