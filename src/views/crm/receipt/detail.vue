<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { add } from 'xe-utils'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { receipt as api } from '@/service/api/crm'
import { gridOptions } from './columns'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const tableRef = ref<any>(null)
const isConfirm = ref(false)

function createFormModel() {
  return {
    id: '0',
    invoice_id: null,
    date: null,
    totals: null,
    amount: null,
    account: null,
    remark: null,
    list: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const {
  formModel,
  modalRef,
  exposed,
  clearTabState,
  params,
} = useDetail<FormModel>({
  api: {
    get() {
      return api.get({ ...params.value })
    },
  },
  createFormModel,
  title: '收款流水',
  permission: { useTabPermission: true, permName: 'CRM_RECEIPT' },
  canEdit: form => !form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onBeforeOpen: () => {
    isConfirm.value = false

    return true
  },
  transform: createTransformer({
    number: ['date', 'amount', 'totals'],
    custom: {
      date: val => toDateLabel(val),
    },
  }),
  onOpen: async (params, mode) => {
    await nextTick()
    if (formModel.list.length > 0) {
      handleAmountTotal()
    }
    tableRef.value?.redoHeight()
  },
})

function handleAmountTotal() {
  const amountList = formModel.list.map((q: any) => q.amount)
  const total = amountList.reduce((sum, item) => {
    return add(sum, item)
  })
  formModel.amount = total
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'CrmReceiptDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label=" 账户名称">
          <n-input v-model:value="formModel.account_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label=" 交易类型">
          <n-input v-model:value="formModel.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label=" 交易日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label=" 交易内容">
          <n-input v-model:value="formModel.content" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label=" 收入金额">
          <n-input-number v-model:value="formModel.debit" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label=" 对方账户">
          <n-input v-model:value="formModel.outer_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label=" 对方账号">
          <n-input v-model:value="formModel.outer_code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="2"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
      </n-grid>

      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" />
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
