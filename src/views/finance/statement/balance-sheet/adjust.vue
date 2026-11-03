<script lang="ts" setup>
import type { TableProps } from '@/components/SpTable'
import { balanceSheet as api } from '@/service/api/finance/statement'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)

const btnLoading = ref(false)
const dateValue = ref<string | null>(null)
const dataList = ref<any>([])

async function fetch() {
  if (!dateValue.value)
    return

  const { isSuccess, data } = await api.get({
    date: dateValue.value,
  })
  if (isSuccess) {
    dataList.value = data

    modalRef.value.open()

    if (tableRef.value) {
      tableRef.value.setData(dataList.value)
      tableRef.value.redoHeight()
    }
  }
}

async function open(params: any) {
  await load()
  dateValue.value = params?.date

  await fetch()
}

function close() {
  modalRef.value?.close()
}

async function submit() {
  btnLoading.value = true
  const { isSuccess } = await api
    .save({
      date: dateValue.value,
      list: dataList.value,
    })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('保存成功')
    close()
    emit('on-action')
  }
}

const gridOptions = reactive<TableProps>({
  canResize: true,
  resizeHeightOffset: 125,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    icon: 'fa fa-file-text-o',
    autoClear: false,
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 70, align: 'right' },
    {
      width: 120,
      field: 'name',
      title: '名称',
      align: 'center',
      headerAlign: 'center',
    },
    {
      width: 180,
      field: 'debit',
      title: '一年内到期投资',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'debit_edit' },
    },
    {
      width: 180,
      field: 'credit',
      title: '一年内到期负债',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'credit_edit' },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 250,
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'remark_edit' },
    },
  ],
  pagination: false,
  dataSource: dataList.value,
})

function rowsChange(e) {
  tableRef.value.editRowEvent(e.row)
}

async function load() {}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="年内到期调整数"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions" @current-change="rowsChange">
        <!-- 年内到期投资 -->
        <template #debit_edit="{ row }">
          <n-input-number
            v-model:value="row.debit"
            clearable
            :show-button="false"
            :precision="2"
          />
        </template>
        <!-- 年内到期负债 -->
        <template #credit_edit="{ row }">
          <n-input-number
            v-model:value="row.credit"
            clearable
            :show-button="false"
            :precision="2"
          />
        </template>
        <!-- 备注 -->
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="submit">
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
