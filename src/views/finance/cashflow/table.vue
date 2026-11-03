<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import { cashflow as api } from '@/service/api/finance'
import VouchDetail from '@/views/finance/voucher/detail.vue'

const filterModel = ref<any>({
  format: 'atlas/finance/cashflow/list',
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)
const vouchDetailRef = ref<OpenModal | null>(null)

async function open(params: any) {
  filterModel.value = {
    ...filterModel.value,
    ...params,
    format: filterModel.value.format,
  }
  modalRef.value?.open()

  if (tableRef.value) {
    tableRef.value.redoHeight()
    tableRef.value.fetch({ page: 1 })
  }
}

function close() {
  modalRef.value?.close()
}

async function fetchData(params: Recordable) {
  const { isSuccess, data } = await api.list({
    ...params,
    ...filterModel.value,
  })
  if (!isSuccess)
    return []
  return data
}

const gridOptions = reactive<TableProps>({
  dataFormat: filterModel.value.format,
  rowClassName: ({ row }) => {
    if (row.id === '0') {
      return 'font-bold'
    }
    return null
  },
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleQuery(row),
              },
              row.no,
            ),
          ]
        },
      },
    },
  ],
  fetchData,
  checkboxDisabled: true,
  resizeHeightOffset: 140,
  showToolbarRight: false,
  showQueryBtn: false,
  showResetBtn: false,
  pagination: false,
})

function handleQuery(row: Recordable) {
  vouchDetailRef.value?.open({
    id: row.bill_id,
    opt: 'VIEW',
  })
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="现金流向明细表"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions" />
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <VouchDetail ref="vouchDetailRef" />
</template>
