<script lang="ts" setup>
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'

import api from '@/service/api/draftbox'
import toast from '@/utils/toast'

import { basicProps } from './props'

const props = defineProps({ ...basicProps })
const tableRef = ref<TableInstance>()
const memoRef = ref('')

const queryModel = reactive<any>({
  page: 1,
})

const columnsRef = ref<TableColumn[]>([
  {
    field: 'memo',
    title: '备注',
    headerAlign: 'center',
    align: 'left',
    width: 300,
  },
  {
    field: 'ctime',
    title: '创建时间',
    headerAlign: 'center',
    align: 'right',
    width: 150,
  },
  {
    isOperate: true,
    title: '操作',
    width: 90,
    align: 'center',
    slots: { default: 'operate' },
    fixed: 'right',
  },
])

const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),
  pagination: {
    showQuickJumper: false,
    showSizePicker: false,
    pageSize: 20,
  },
  border: false,
  showHeader: false,
  showReload: false,
  showToolbar: false,
  immediate: true,
  height: 420,
  canResize: false,

  // dataSource: [
  //   { memo: 'aasdas das啊实打实', ctime: '2020-05-65 66:11:11' },
  //   { memo: 'aasdas das啊实打实', ctime: '2020-05-65 66:11:11' },
  //   { memo: 'aasdas das啊实打实', ctime: '2020-05-65 66:11:11' },
  // ],
  async fetchData(params) {
    const { isSuccess, data } = await api.search({
      ...params,
      ...queryModel,
      types: props.types,
    })
    if (!isSuccess)
      return []
    return data
  },
})

async function save() {
  const obj = props.save()
  if (!obj) {
    toast.error('没有设置暂存对想')
    return
  }
  const data = JSON.stringify(obj)
  if (!memoRef.value) {
    toast.info('请输入备注')
    return
  }
  const { isSuccess } = await api.save({ memo: memoRef.value, types: props.types, data })
  if (!isSuccess)
    return
  await tableRef?.value?.search()
  toast.success('保存成功')
  memoRef.value = ''
}

function cancel() {
  memoRef.value = ''
}

function dblClick({ row }) {
  if (row.data) {
    props.get({ ...JSON.parse(row.data), draftbox_id: row.id })
  }
}

async function remove(id) {
  if (!id)
    return
  await api.remove(id)
  await tableRef?.value?.search()
}

watch(
  () => props.memo,
  (value) => {
    memoRef.value = value
  },
  { immediate: true, deep: true },
)

defineExpose({ remove })
</script>

<template>
  <n-button-group>
    <n-popover trigger="hover">
      <template #trigger>
        <n-button strong type="tertiary">
          草稿箱
        </n-button>
      </template>
      <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="dblClick">
        <template #operate="{ row }">
          <div class="flex items-center justify-center">
            <n-button text type="primary" @click="dblClick({ row })">
              选择
            </n-button>
            <n-divider vertical />
            <n-button text type="primary" @click="remove(row.id)">
              删除
            </n-button>
          </div>
        </template>
      </SpTable>
    </n-popover>
    <n-popconfirm @positive-click="save" @negative-click="cancel">
      <template #trigger>
        <n-button strong type="success">
          暂存
        </n-button>
      </template>
      <n-input v-model:value="memoRef" type="text" placeholder="输入备注" :maxlength="200" />
    </n-popconfirm>
  </n-button-group>
</template>
