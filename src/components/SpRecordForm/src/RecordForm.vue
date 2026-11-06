<script setup lang="ts">
import type { RecordFormMode, RecordFormOpenOptions } from './type'
import type { DataFormatColumn } from '@/components/SpTable'
import { computed, reactive, ref } from 'vue'
import { SpModal } from '@/components/SpModal'
import { dictLabel, dictOptions } from '@/dicts'
import dataFormatApi from '@/service/api/dataformat'
import { request } from '@/service/http'
import toast from '@/utils/toast'

/**
 * 通用记录表单 / 详情弹窗
 *
 * 页面的列定义（dataformat）里已经写清了字段名、中文标题、类型和枚举，
 * 表单与详情完全可以由它生成 —— 二十多个台账页各写一套表单既慢又容易走样。
 * 这里按列元数据自动出控件：枚举出下拉、金额出数字框、日期出日期选择、布尔出开关。
 *
 * 只处理「单表记录」的增改查。带明细表格、审批流的单据不适用，那类页面
 * 需要专用明细编辑器，硬套反而更差。
 */
const props = withDefaults(defineProps<{
  /** 数据格式名，如 atlas/crm/customer/archive */
  format: string
  /** 不参与编辑的字段（派生列、汇总列），仍会在详情里展示 */
  readonlyFields?: string[]
  /** 弹窗宽度 */
  width?: number
  /** 当前页数据，用于推断枚举类字段的可选值 */
  rows?: Recordable[]
}>(), {
  readonlyFields: () => [],
  width: 900,
  rows: () => [],
})

const emit = defineEmits<{
  saved: []
}>()

const modalRef = ref<InstanceType<typeof SpModal> | null>(null)
const columns = ref<DataFormatColumn[]>([])
const loading = ref(false)
const mode = ref<RecordFormMode>('view')
const currentId = ref<string>('')
const form = reactive<Recordable>({})
/** 日期字段的中间态：接口给的是字符串，日期控件要时间戳 */
const dateValues = reactive<Recordable>({})

/** 新建单据的默认状态：优先落在「还没走完流程」的那一档 */
const PENDING_STATES = [
  '待审批',
  '待审核',
  '审批中',
  '草稿',
  '待处理',
  '处理中',
  '进行中',
  '未开始',
  '待认证',
  '未认领',
  '待确认',
  '待认领',
  '在途',
]

/** 列表不展示、但表单里也不该让人填的字段 */
const ALWAYS_READONLY = [
  'id',
  'ctime',
  'utime',
  'create_time',
  'update_time',
  'created_at',
  'updated_at',
  'create_user',
  'update_user',
]

/**
 * 系统生成的单号：由后端在保存时产生，编辑时也不应改动。
 *
 * 不能简单地用「以 _no 结尾」判断 —— 账号（account_no）、发票号（invoice_no）、
 * 手机号（phone_no）都是要人手填的业务编号，锁死了反而没法新增。
 */
const SERIAL_RE = /(?:_|^)(?:project|claim|contract|flow|asset|order|apply|bill|voucher|settle|check|maintain|purchase|reimburse|advance|salary|transfer)_no$/i
const BARE_SERIAL_RE = /^(?:no|code)$/i

/** 派生列：金额合计、进度、计数这类由其他字段算出来的值 */
function isDerived(field: string) {
  return /(?:_count|_total|_rate|_progress|progress|_label)$/.test(field)
    || field.endsWith('_days')
    || field === 'progress'
}

function isReadonlyField(field: string) {
  if (ALWAYS_READONLY.includes(field))
    return true
  if (props.readonlyFields.includes(field))
    return true
  if (isDerived(field))
    return true
  // 编号在新增时由系统生成，编辑时保持只读
  return SERIAL_RE.test(field) || BARE_SERIAL_RE.test(field)
}

/** 可见字段：去掉 id 与审计时间，其余按列定义顺序 */
const fields = computed(() =>
  columns.value.filter(item => !ALWAYS_READONLY.includes(item.column)),
)

const canEdit = computed(() => mode.value !== 'view')

const title = computed(() => {
  if (mode.value === 'create')
    return '新增'
  if (mode.value === 'edit')
    return '编辑'
  return '详情'
})

/** 业务模块路径，用于保存接口：atlas/crm/customer/archive → crm/customer/archive */
const modulePath = computed(() => props.format.replace(/^atlas\//, ''))

function toTimestamp(value: unknown, withTime = false): number | null {
  if (value === null || value === undefined || value === '')
    return null
  if (typeof value === 'number')
    return value
  const text = String(value).replace(/-/g, '/')
  const date = new Date(text)
  const time = date.getTime()
  if (!Number.isFinite(time))
    return null
  return withTime ? time : new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function fromTimestamp(value: unknown, withTime = false): string {
  if (!value)
    return ''
  const date = new Date(Number(value))
  if (!Number.isFinite(date.getTime()))
    return ''
  const pad = (item: number) => String(item).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (!withTime)
    return day
  return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function isDateColumn(column: DataFormatColumn) {
  return column.type === 'date' || column.type === 'datetime'
}

async function loadColumns() {
  if (columns.value.length)
    return
  const { isSuccess, data } = await dataFormatApi.get(props.format)
  if (isSuccess && Array.isArray(data))
    columns.value = data
}

function resetForm(row?: Recordable) {
  for (const key of Object.keys(form))
    delete form[key]
  for (const key of Object.keys(dateValues))
    delete dateValues[key]

  for (const column of fields.value) {
    const value = row?.[column.column]
    if (isDateColumn(column)) {
      const timestamp = toTimestamp(value, column.type === 'datetime')
      dateValues[column.column] = timestamp
      form[column.column] = value ?? null
    }
    else {
      form[column.column] = value ?? null
    }
  }

  // 新增时给状态类字段一个合理初值。留空的话列表里会出现空白标签，
  // 而且「状态为空」的单据在业务上也不成立
  if (mode.value === 'create') {
    for (const column of fields.value) {
      if (isReadonlyField(column.column) || form[column.column])
        continue
      const options = enumOptions(column).map(item => String(item.value))
      if (!options.length)
        continue
      form[column.column] = options.find(item => PENDING_STATES.includes(item)) ?? options[0]
    }
  }
}

async function open(options: RecordFormOpenOptions) {
  mode.value = options.opt
  currentId.value = String(options.row?.id ?? '')
  loading.value = true
  await loadColumns()
  resetForm(options.row)
  loading.value = false

  const label = options.title ? `${options.title}` : title.value
  modalRef.value?.setProps({
    title: mode.value === 'view' ? `${label}` : `${label}`,
    width: props.width,
    showOk: canEdit.value,
    okText: '保存',
    cancelText: canEdit.value ? '取消' : '关闭',
  })
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

/** 日期选择后同步回表单值，保存时统一转字符串 */
function onDateChange(field: string, value: unknown, withTime: boolean) {
  dateValues[field] = value ?? null
  form[field] = fromTimestamp(value, withTime) || null
}

function displayValue(column: DataFormatColumn) {
  const raw = form[column.column]
  if (raw === null || raw === undefined || raw === '')
    return '—'
  if (column.type === 'enums' && column.enums)
    return dictLabel(column.enums, raw) || raw
  if (column.type === 'bool')
    return raw === true || raw === '1' || raw === '是' ? '是' : '否'
  if (column.type === 'money')
    return `¥ ${Number(raw).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return String(raw)
}

/**
 * 枚举类字段的可选值
 *
 * 分级、状态、类型这类字段在字段表里只是普通文本，没有登记字典，
 * 手填就会出现「战咯客户」这种拼写错误，之后按分级统计全是漏的。
 * 这里从列表已有数据里收集去重值当选项，不依赖额外的字典配置。
 */
const ENUM_HINT_RE = /(?:_|^)(?:level|state|status|type|types|category|stage|node|role|method|way|source|pattern|grade|nature|region|channel|mode)s?$/i

function enumOptions(column: DataFormatColumn) {
  if (column.enums)
    return dictOptions(column.enums)

  // 字段名不像枚举就直接用输入框，避免把「客户名称」也做成下拉
  if (!ENUM_HINT_RE.test(column.column))
    return []

  const values = new Set<string>()
  for (const row of props.rows) {
    const value = row[column.column]
    if (typeof value === 'string' && value)
      values.add(value)
  }
  // 取值过多说明不是枚举（比如地址、备注），退回输入框
  if (values.size < 2 || values.size > 24)
    return []
  return [...values].map(value => ({ label: value, value }))
}

/** 第一列通常是要害字段（名称、标题），全空保存没有任何意义 */
function validate(): string | null {
  const first = fields.value.find(item => !isReadonlyField(item.column) && item.type === 'text')
  if (first && !String(form[first.column] ?? '').trim())
    return `请填写${first.title}`
  return null
}

async function handleOk({ done }: { done: (close?: boolean) => void }) {
  if (!canEdit.value) {
    done()
    return
  }

  const message = validate()
  if (message) {
    toast.warning(message)
    done(false)
    return
  }

  const payload: Recordable = {}
  if (currentId.value)
    payload.id = currentId.value
  for (const column of fields.value) {
    if (!isReadonlyField(column.column))
      payload[column.column] = form[column.column]
  }

  const { isSuccess } = await request.Post<Service.Response>(`${modulePath.value}/save`, payload)
  if (isSuccess) {
    toast.success('保存成功')
    emit('saved')
    done()
  }
  else {
    toast.error('保存失败')
    done(false)
  }
}

defineExpose({ open, close })
</script>

<template>
  <SpModal ref="modalRef" :width="width" @ok="handleOk">
    <n-spin :show="loading">
      <!-- 只读详情：字段较多时两列排布，长文本整行 -->
      <n-descriptions v-if="!canEdit" bordered :column="2" label-placement="left" size="small">
        <n-descriptions-item
          v-for="column in fields"
          :key="column.column"
          :label="column.title"
          :span="column.type === 'text' && String(form[column.column] ?? '').length > 18 ? 2 : 1"
        >
          <span class="record__value">{{ displayValue(column) }}</span>
        </n-descriptions-item>
      </n-descriptions>

      <n-form v-else label-placement="left" :label-width="112" size="small" require-mark-placement="right-hanging">
        <n-grid :cols="2" :x-gap="18">
          <n-form-item-gi
            v-for="column in fields"
            :key="column.column"
            :label="column.title"
            :span="column.type === 'text' && String(form[column.column] ?? '').length > 18 ? 2 : 1"
          >
            <!-- 编号与派生值只读展示，避免改出对不上的数据 -->
            <n-input
              v-if="isReadonlyField(column.column)"
              :value="form[column.column] === null || form[column.column] === undefined ? '—' : String(form[column.column])"
              disabled
              placeholder="系统生成"
            />

            <!-- 允许 tag：新分级、新类别在业务上真实存在，不该逼着人选旧值 -->
            <n-select
              v-else-if="enumOptions(column).length"
              v-model:value="form[column.column]"
              :options="enumOptions(column)"
              clearable
              filterable
              tag
            />

            <n-switch
              v-else-if="column.type === 'bool'"
              :value="form[column.column] === true || form[column.column] === '1' || form[column.column] === '是'"
              @update:value="(value: boolean) => (form[column.column] = value)"
            />

            <n-date-picker
              v-else-if="isDateColumn(column)"
              :value="dateValues[column.column]"
              :type="column.type === 'datetime' ? 'datetime' : 'date'"
              clearable
              class="w-full"
              @update:value="(value: any) => onDateChange(column.column, value, column.type === 'datetime')"
            />

            <n-input-number
              v-else-if="column.type === 'money' || column.type === 'number'"
              v-model:value="form[column.column]"
              :precision="column.type === 'money' ? 2 : undefined"
              :show-button="false"
              class="w-full"
            />

            <n-input
              v-else
              v-model:value="form[column.column]"
              :placeholder="`请输入${column.title}`"
              clearable
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-spin>
  </SpModal>
</template>

<style scoped>
.record__value {
  word-break: break-all;
}
</style>
