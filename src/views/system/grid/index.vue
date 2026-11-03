<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type {
  TableColumn,
  TableInstance,
  TableProps,
} from '@/components/SpTable'
import { reactive, ref, unref } from 'vue'

import dataformat from '@/service/api/dataformat'
import toast from '@/utils/toast'
import { columns as columnsConfig } from './columns'

import View from './view.vue'

const pageLoading = ref(false)
const columnsRef = ref<TableColumn[]>(columnsConfig)

const tableRef = ref<TableInstance>({} as TableInstance)
const viewModal = ref<OpenModal | null>(null)
const batchModalRef = ref<ModalInst | null>(null)

function createQueryModel() {
  return {
    name: null,
    mobile_number: null,
    user_id: null,
  }
}

/** 筛选条件 */
const queryModel = reactive(createQueryModel())

const batchModel = reactive({
  user_id: null as string | null,
  name: null as string | null,
})

const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),
  showResetBtn: false,
  async fetchData(params) {
    const { isSuccess, data } = await dataformat.getUserGridList({
      ...params,
      ...queryModel,
    })
    if (!isSuccess)
      return []
    return data
  },
})

function handleSearch() {
  tableRef.value.fetch()
}

function handleView(row: Recordable) {
  viewModal.value?.open({ user_id: row.user_id, name: row.name })
}

function openBatchModal() {
  batchModel.user_id = null
  batchModel.name = null
  batchModalRef.value?.open()
}

async function handleBatchDelete({ done }) {
  if (!batchModel.user_id && !batchModel.name) {
    toast.info('请填写格式名称或用户标识')
    return done(false)
  }

  const { isSuccess } = await dataformat.deleteUserGrid(batchModel)
  if (!isSuccess)
    return done(false)

  done(true)
  toast.success('操作成功')
  handleSearch()
}

function handleSelectDelete() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.warning('请选择要删除的行')
    return
  }

  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await dataformat.deleteUserGrid({
        id: rows.map((m: Recordable) => m.id),
      }).finally(() => {
        pageLoading.value = false
      })
      if (!isSuccess)
        return
      toast.success('操作成功')
      handleSearch()
    },
  })
}
</script>

<script lang="ts">
export default { name: 'SystemGrid' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <n-grid
          cols="12"
          x-gap="16"
          y-gap="16"
          :collapsed-rows="2"
          responsive="screen"
          style="overflow: hidden"
        >
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.name"
              placeholder="格式名称"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.mobile_number"
              placeholder="用户手机"
              clearable
            />
          </n-gi>
          <n-gi span="6">
            <n-input
              v-model:value="queryModel.user_id"
              placeholder="用户标识"
              clearable
            />
          </n-gi>
        </n-grid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable
          ref="tableRef"
          v-bind="gridOptions"
          @cell-dblclick="({ row }) => handleView(row)"
        >
          <template #toolbarLeftBtn>
            <n-button @click="openBatchModal">
              批量删除
            </n-button>
            <n-button @click="handleSelectDelete">
              选择删除
            </n-button>
          </template>
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleView(row)">
                查看
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <View ref="viewModal" />
    <SpModal
      ref="batchModalRef"
      width="500"
      title="批量删除"
      @ok="handleBatchDelete"
    >
      <n-form label-placement="left" require-mark-placement="left">
        <n-form-item label="格式名称" path="name">
          <n-input
            v-model:value="batchModel.name"
            clearable
            placeholder="清空格式名称相等的格式"
          />
        </n-form-item>
        <n-form-item label="用户标识" path="user_id">
          <n-input
            v-model:value="batchModel.user_id"
            clearable
            placeholder="清空用户标识相等的格式"
          />
        </n-form-item>
      </n-form>
    </SpModal>
  </NaPage>
</template>
