<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import { add, round } from 'xe-utils'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { createTransformer, useDetail } from '@/hooks/detail'
import { cashflow as api } from '@/service/api/finance'
import { cashflowItem as cashflowApi } from '@/service/api/masterdata'
import toast from '@/utils/toast'
import { gridOptions, updateDataTableCount, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const cashflowTreeOptions = ref<any>([])
async function loadCashflowTreeOptions() {
  const { isSuccess, data } = await cashflowApi.tree({ types: 0 })
  if (!isSuccess)
    return
  cashflowTreeOptions.value = data
}

const cashsubTreeOptions = ref<any>([])
async function loadCashsubTreeOptions() {
  const { isSuccess, data } = await cashflowApi.tree({ types: 1 })
  if (!isSuccess)
    return
  cashsubTreeOptions.value = data
}

async function load() {
  loadCashflowTreeOptions()
  loadCashsubTreeOptions()
}

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    opt_confirm: false,
    date: null,
    code: null,
    cash_amount: null as any,
    list: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {}

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  showEdit,
  submit,
  edit,
  clearTabState,
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '现金流向',
  permission: { useTabPermission: true, permName: 'FIN_CASHFLOW' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
  }),
  async beforeEdit(data) {
    await load()

    formModel.list = data.list.map((item: any) => {
      return {
        ...item,
        cash_dir_id: !Number(item.cash_dir_id) ? null : item.cash_dir_id,
        cash_sub_id: !Number(item.cash_sub_id) ? null : item.cash_sub_id,
      }
    }) as any
    updateDataTableCount(data.list)

    return true
  },
  beforeView() {
    return true
  },
  beforeSubmit() {
    if (itemsCheck())
      return false
    const list: any = formModel.list.map((item: any, index) => {
      return { ...item, line: Number(index) + 1 }
    })
    formModel.list = list
    return true
  },
  onOpen: async (params, mode) => {
    await nextTick()
    if (mode === 'view') {
      viewTableRef.value?.redoHeight()
      updateDataTableCount(formModel.list)
    }
  },
})

function rowsChange(e) {
  tableRef.value?.editRowEvent(e.row)
}

function itemsCheck() {
  for (const i in formModel.list) {
    const item: any = formModel.list[i]
    if ((item.cash_dir_id || item.cash_sub_id) && !item.amount) {
      toast.error(`第${Number(i) + 1}行选择了现金流项目所以金额不能为空`)
      return true
    }
  }

  return false
}

function handleItemCashflowSelected(options, row) {
  row.cash_dir_name = options?.label
}

function handleItemCashsubSelected(options, row) {
  row.cash_sub_name = options?.label
}

function handleAountUpdate() {
  let amount = 0
  for (const i in formModel.list) {
    const item: any = formModel.list[i]
    amount = add(amount, item.amount || 0)
  }
  formModel.cash_amount = String(round(amount, 2))
  updateDataTableCount(formModel.list)
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'vouch_bills' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'VouchCashflowDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formModel.stoped ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="凭证日期" path="date">
          <n-input v-model:value="formModel.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="凭证号" path="code">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借贷差额" path="cash_amount">
          <n-input v-model:value="formModel.cash_amount" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="凭证日期" path="date">
          <n-input v-model:value="formModel.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="凭证号" path="code">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借贷差额" path="cash_amount">
          <n-input v-model:value="formModel.cash_amount" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <SpTable v-if="isEdit" ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange">
      <template #cash_dir_default="{ row }">
        {{ row.cash_dir_name }}
      </template>
      <template #cash_dir_edit="{ row }">
        <SpCascader
          v-model:value="row.cash_dir_id"
          :options="cashflowTreeOptions"
          placeholder="请选择"
          value-field="id"
          @update:value="(_e, options) => handleItemCashflowSelected(options, row)"
        />
      </template>
      <template #amount_edit="{ row }">
        <n-input-number
          v-model:value="row.amount"
          clearable
          :show-button="false"
          :precision="2"
          @update:value="handleAountUpdate"
        />
      </template>
      <template #cash_sub_default="{ row }">
        {{ row.cash_sub_name }}
      </template>
      <template #cash_sub_edit="{ row }">
        <SpCascader
          v-model:value="row.cash_sub_id"
          :options="cashsubTreeOptions"
          placeholder="请选择"
          value-field="id"
          @update:value="(_e, options) => handleItemCashsubSelected(options, row)"
        />
      </template>
    </SpTable>
    <SpTable v-else ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list" />

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="finance/cashflow"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || formModel.stoped"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
