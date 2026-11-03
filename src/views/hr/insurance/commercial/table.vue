<script lang="ts" setup>
import type { TableProps } from '@/components/SpTable'
import printJS from 'print-js'
import { commercial as api } from '@/service/api/hr/insurance'

const btnLoading = ref(false)

const filterModel = ref({
  format: 'atlas/hr/insurance/commercial/list',
  types: null,
  filter: null,
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)

const insureId = ref<string[] | null>(null)

const typesOptions = ref([
  {
    label: '在职',
    value: '0',
  },
  {
    label: '离职',
    value: '1',
  },
  {
    label: '重复',
    value: '2',
  },
])

async function open(params: any) {
  await load()
  insureId.value = params.id
  filterModel.value.types = params.types || null
  modalRef.value?.open()

  setTimeout(() => {
    tableRef.value.redoHeight()
    tableRef.value.fetch({ page: 1 })
  }, 0)
}

function close() {
  modalRef.value?.close()
}

async function print() {
  console.log(tableRef.value)
  btnLoading.value = true
  const { isSuccess, data } = await api.printList({ ...filterModel.value, insure_id: insureId.value }).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return
  printJS({
    printable: data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

async function excel() {
  btnLoading.value = true
  const { isSuccess, data } = await api.exportList({ ...filterModel.value, insure_id: insureId.value }).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return
  location.href = data
}

async function fetchData(params: Recordable) {
  const { isSuccess, data } = await api.searchList({
    ...params,
    ...filterModel.value,
    insure_id: insureId.value,
  })
  if (!isSuccess)
    return []
  return data
}

const gridOptions = reactive<TableProps>({
  rowClassName: ({ row }) => {
    if (row.stoped) {
      return 'row-warning'
    }
    return null
  },
  dataFormat: filterModel.value.format,
  columns: [],
  fetchData,
  immediate: false,
  resizeHeightOffset: 140,
  showToolbarRight: false,
})

async function load() {}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="保单人员"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions">
        <template #toolbarLeftBtn>
          <n-space>
            <n-select v-model:value="filterModel.types" :options="typesOptions" clearable style="width: 120px;" @update:value="tableRef.fetch()" />
            <n-input
              v-model:value="filterModel.filter"
              placeholder="工号、姓名、手机号"
              type="text"
              clearable
              style="width: 240px;"
              @keyup.enter="tableRef.fetch()"
            />
          </n-space>
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button :loading="btnLoading" @click="print">
          打印
        </n-button>
        <n-button :loading="btnLoading" @click="excel">
          导出
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
