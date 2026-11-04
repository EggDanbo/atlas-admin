<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance, TableProps } from '@/components/SpTable'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { invoice as api } from '@/service/api/crm'

import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const tableRef = ref<TableInstance | null>(null)
const updateRedModalRef = ref<ModalInst | null>(null)
const btnLoading = ref<boolean>(false)

const dataList = ref<any>([])
const updateRedValue = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    outer_name: null,
    no: null,
    red: null,
    source: null,
    status: null,
    states: null,
    date: null,
    amount: null,
    taxes: null,
    totals: null,
    drawer: null,
    user_name: null,
    types: null,
    settle: null,
    remark: null,
    list: [],
    files: [],
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
  title: '发票管理',
  permission: { useTabPermission: true, permName: 'CRM_INVOICE' },
  canEdit: form => !form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['source'],
    enum: {
      source: 'trade_invoice_source',
    },
    number: ['date', 'totals'],
    custom: {
      date: val => toDateLabel(val),
    },
  }),
  beforeView() {
    return true
  },
  onOpen: async () => {
    await nextTick()
    tableRef.value?.redoHeight()
  },
})

function updateRed() {
  updateRedValue.value = null
  updateRedModalRef.value?.open()
}

async function handleUpdateRed() {
  btnLoading.value = true
  const { isSuccess } = await api
    .updateRed({
      id: formModel.id,
      red: updateRedValue.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  updateRedModalRef.value?.close()
  modalRef.value.close()
  emit('on-action', 'edit')
}

const gridOptions = reactive<TableProps>({
  rowClassName: ({ row }) => {
    if (row.stoped) {
      return 'row-warning'
    }
    return null
  },
  rowConfig: { isCurrent: true, isHover: false },
  columns: [
    { type: 'seq', title: '行号', width: 70, align: 'right' },
    {
      minWidth: 300,
      field: 'name',
      title: '名称',
    },
    {
      width: 150,
      field: 'model',
      title: '规格型号',
      align: 'center',
      headerAlign: 'center',
    },
    {
      width: 100,
      field: 'unit',
      title: '计量单位',
      align: 'center',
      headerAlign: 'center',
    },
    {
      width: 100,
      field: 'pcs',
      title: '数量',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 120,
      field: 'price',
      title: '单价',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 150,
      field: 'amount',
      title: '金额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 100,
      field: 'rates',
      title: '税率',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 120,
      field: 'taxes',
      title: '税额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 150,
      field: 'totals',
      title: '价税合计',
      align: 'right',
      headerAlign: 'center',
    },
  ],
  immediate: false,
  resizeHeightOffset: 120,
  showQueryBtn: false,
  showResetBtn: false,
  showToolbar: false,
  dataSource: dataList.value,
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'CrmInvoiceDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <!-- 仅在作废单据上盖作废章，避免正常单据也出现红色印章 -->
      <div v-if="String(formModel.status) === '6'" class="stamp-text">
        已作废
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="发票来源">
          <n-input :value="formModel.transform?.source" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开票日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="发票号码">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结算类型">
          <n-input v-model:value="formModel.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开票人">
          <n-input v-model:value="formModel.drawer" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="价税合计">
          <n-input-number v-model:value="formModel.totals" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="客户名称">
          <n-input v-model:value="formModel.outer_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="formModel.files && formModel.files.length > 0"
          :span="24"
          label="附件"
        >
          <Upload v-model:value="formModel.files" :disabled="true" />
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
        <n-button v-if="formModel.opt_confirm" type="primary" @click="updateRed">
          冲红关联
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="updateRedModalRef"
    title="状态设置"
    width="500"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex">
        <n-input v-model:value="updateRedValue" clearable />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateRedModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleUpdateRed">
          设置
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
