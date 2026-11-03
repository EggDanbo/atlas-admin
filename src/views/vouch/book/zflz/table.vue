<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import { zflz as api } from '@/service/api/vouch/book'
import mxflz from '@/views/vouch/book/mxflz/table.vue'

const filterModel = ref<any>({
  format: 'atlas/vouch/book/zflz',
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)
const mxflzRef = ref<OpenModal | null>(null)

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
      field: 'date',
      slots: {
        default: ({ row }) => {
          if (Number(row.id) !== 0) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery(row),
                },
                row.date,
              ),
            ]
          }
          else {
            return [row.date]
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
  mxflzRef.value?.open({
    content_code: filterModel.value.content_code,
    year: row.year,
    month_begin: row.month,
    month_end: row.month,
  })
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    :title="`总分类账-${filterModel.content_code}`"
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

  <mxflz ref="mxflzRef" />
</template>
