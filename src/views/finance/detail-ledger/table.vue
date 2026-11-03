<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import { detailLedger as api } from '@/service/api/finance'
import detail from '@/views/finance/voucher/detail.vue'

const filterModel = ref<any>({
  format: 'atlas/finance/detail-ledger',
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)
const detailRef = ref<OpenModal | null>(null)

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
  const { isSuccess, data } = await api.search({
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
          if (Number(row.id) !== 0) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery(row),
                },
                row.no,
              ),
            ]
          }
          else {
            return [row.no]
          }
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
  detailRef.value?.open({
    id: row.bill_id,
    opt: 'view',
  })
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    :title="`明细分类账-${filterModel.content_code}`"
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

  <detail ref="detailRef" />
</template>
