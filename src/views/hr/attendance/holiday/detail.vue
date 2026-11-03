<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import type { FestivalRow } from './types'
import type { ModalInst } from '@/components/SpModal'
import { useFormValid } from '@/hooks/help/useFormValid'
import { holiday as api } from '@/service/api/hr/attendance'
import toast from '@/utils/toast'

interface RangeModel {
  range: [number, number] | null
}

interface FormModel {
  yearValue: number
  name: string | null
  legal_ranges: RangeModel[]
  transfer_ranges: RangeModel[]
  makeup_ranges: RangeModel[]
  notes: string | null
}

const emit = defineEmits(['on-action'])

const DAY_MS = 24 * 60 * 60 * 1000

const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)
const formRef = ref<FormInst | null>(null)
// null:新增,行数据:编辑
let editRow: FestivalRow | null = null
const isEdit = ref(false)

function defModel(yearValue: number = new Date().setHours(0, 0, 0, 0)): FormModel {
  return {
    yearValue,
    name: null,
    legal_ranges: [],
    transfer_ranges: [],
    makeup_ranges: [],
    notes: null,
  }
}

const formModel = reactive(defModel())

const formRules: FormRules = {
  name: { required: true, message: '请输入节日名称', trigger: ['blur', 'input'] },
}

const { validForm } = useFormValid(formRef)

function onCreateRange(): RangeModel {
  return { range: null }
}

function dayMs(day: string): number {
  return new Date(day.replace(/-/g, '/')).setHours(0, 0, 0, 0)
}

/** 连续日期合并为日期段 */
function toRanges(times: number[]): RangeModel[] {
  const sorted = [...times].sort((a, b) => a - b)
  const result: RangeModel[] = []
  let start: number | null = null
  let prev = 0

  for (const time of sorted) {
    if (start === null) {
      start = time
      prev = time
      continue
    }
    if (time - prev === DAY_MS) {
      prev = time
      continue
    }
    result.push({ range: [start, prev] })
    start = time
    prev = time
  }
  if (start !== null) {
    result.push({ range: [start, prev] })
  }

  return result
}

/** 日期段展开为逐日时间戳;跳过未选完整的段 */
function expandRanges(ranges: RangeModel[]): number[] {
  const result: number[] = []
  for (const item of ranges || []) {
    const range = item?.range
    if (!Array.isArray(range) || range.length !== 2 || range[0] == null || range[1] == null) {
      continue
    }
    for (let time = range[0]; time <= range[1]; time += DAY_MS) {
      result.push(time)
    }
  }
  return result
}

function containsPastDate(days: number[]): boolean {
  const today = new Date().setHours(0, 0, 0, 0)
  return days.some(day => day < today)
}

/** 新增;year 为毫秒时间戳 */
function add(year: number) {
  editRow = null
  isEdit.value = false
  Object.assign(formModel, defModel(year))
}

/** 编辑;连续日期合并为日期段回显 */
function edit(row: FestivalRow) {
  editRow = row
  isEdit.value = true
  Object.assign(formModel, defModel(new Date(row.year, 0, 1).getTime()), {
    name: row.name,
    notes: row.notes || null,
    legal_ranges: toRanges(row.days.filter(item => item.day_type === 1).map(item => dayMs(item.day))),
    transfer_ranges: toRanges(
      row.days.filter(item => item.day_type === 2).map(item => dayMs(item.day)),
    ),
    makeup_ranges: toRanges(row.days.filter(item => item.day_type === 3).map(item => dayMs(item.day))),
  })
}

function open(params?: Recordable) {
  if (params?.row) {
    edit(params.row as FestivalRow)
  }
  else {
    add(typeof params?.year === 'number' ? params.year : new Date().setHours(0, 0, 0, 0))
  }
  modalRef.value?.open()
}

function fmtDate(ms: number): string {
  const date = new Date(ms)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function save(legalDays: number[], transferDays: number[], makeupDays: number[]) {
  btnLoading.value = true

  const data = {
    id: editRow?.id ?? 0,
    year: new Date(formModel.yearValue).getFullYear(),
    name: formModel.name,
    notes: formModel.notes,
    legal_days: legalDays.map(day => fmtDate(day)),
    transfer_days: transferDays.map(day => fmtDate(day)),
    makeup_days: makeupDays.map(day => fmtDate(day)),
  }

  const { isSuccess } = editRow ? await api.update(data) : await api.create(data)
  btnLoading.value = false
  if (!isSuccess)
    return

  toast.success('保存成功')
  modalRef.value?.close()
  emit('on-action', editRow ? 'edit' : 'add')
}

async function submit() {
  if (!(await validForm()))
    return

  const legalDays = expandRanges(formModel.legal_ranges)
  const transferDays = expandRanges(formModel.transfer_ranges)
  const makeupDays = expandRanges(formModel.makeup_ranges)

  if (legalDays.length + transferDays.length + makeupDays.length === 0) {
    toast.warning('请至少登记一个日期')
    return
  }

  if (!formModel.yearValue) {
    toast.warning('请选择年份')
    return
  }

  // 包含今天/过去日期的登记保存后立即生效，影响当日考勤判定
  if (containsPastDate([...legalDays, ...transferDays, ...makeupDays])) {
    toast.infoModal('日期包含今天或已过去的日期，保存后立即生效并影响当日考勤判定，确定保存吗？', {
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => save(legalDays, transferDays, makeupDays),
    })
    return
  }

  await save(legalDays, transferDays, makeupDays)
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'StaffCheckinFestivalDetail' }
</script>

<template>
  <SpModal
    ref="modalRef"
    width="720"
    :mask="true"
    :title="isEdit ? '编辑节日' : '新增节日'"
  >
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="90"
      :model="formModel"
      :rules="formRules"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="年份" path="yearValue">
          <n-date-picker
            v-model:value="formModel.yearValue"
            type="year"
            :disabled="isEdit"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="节日名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="20" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="法定节假日" path="legal_ranges">
          <n-dynamic-input v-model:value="formModel.legal_ranges" :on-create="onCreateRange">
            <template #default="{ value }">
              <n-date-picker
                v-model:value="value.range"
                type="daterange"
                clearable
                class="w-full"
              />
            </template>
          </n-dynamic-input>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="调休日期" path="transfer_ranges">
          <n-dynamic-input v-model:value="formModel.transfer_ranges" :on-create="onCreateRange">
            <template #default="{ value }">
              <n-date-picker
                v-model:value="value.range"
                type="daterange"
                clearable
                class="w-full"
              />
            </template>
          </n-dynamic-input>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="补班日期" path="makeup_ranges">
          <n-dynamic-input v-model:value="formModel.makeup_ranges" :on-create="onCreateRange">
            <template #default="{ value }">
              <n-date-picker
                v-model:value="value.range"
                type="daterange"
                clearable
                class="w-full"
              />
            </template>
          </n-dynamic-input>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="notes">
          <n-input
            v-model:value="formModel.notes"
            type="textarea"
            :rows="2"
            maxlength="255"
            clearable
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <template #footer>
      <n-space justify="end" align="center">
        <n-button @click="modalRef?.close()">
          取消
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="submit">
          保存
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>
