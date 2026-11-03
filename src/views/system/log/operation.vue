<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableColumn, TableProps } from '@/components/SpTable'
import { addDays, format } from 'date-fns'
import { reactive, ref, unref } from 'vue'
import { BizlogView } from '@/components/Logs/Biz'
import { SpDateRange } from '@/components/SpDateRange'
import { logBizLog as api } from '@/service/api/system'
import { logColumns } from './columns'

const pageLoading = ref(false)
const columnsRef = ref<TableColumn[]>(logColumns)

const detailRef = ref<OpenModal | null>(null)

function createQueryModel() {
  return ({
    date: [addDays(Date.now(), -1).getTime(), addDays(Date.now(), 1).getTime()] as [
      number,
      number,
    ],
    mark: '',
    user_id: null,
    user_name: '',
    name: '',
    xid: null,
    archive: null,
  })
}

/** 筛选条件 */
const queryModel = reactive(createQueryModel())

const querySchemas = computed(() => {
  return {
    archive: [
      { label: '否', value: '0' },
      { label: '是', value: '1' },
    ],
  }
})

const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),
  async fetchData(params) {
    const { isSuccess, data } = await api.getList({
      ...params,
      mark: queryModel.mark,
      user_id: queryModel.user_id,
      user_name: queryModel.user_name,
      name: queryModel.name,
      xid: queryModel.xid,
      archive: queryModel.archive,
      begintime:
        queryModel.date && queryModel.date[0]
          ? format(queryModel.date[0], 'yyyy-MM-dd HH:mm:ss')
          : null,
      endtime:
        queryModel.date && queryModel.date[1]
          ? format(queryModel.date[1], 'yyyy-MM-dd HH:mm:ss')
          : null,
    })
    if (!isSuccess)
      return []
    return data
  },
  resetData: () => Object.assign(queryModel, createQueryModel()),
})

function handleView(row) {
  detailRef.value?.open({ id: row.id })
}
</script>

<script lang="ts">
export default { name: 'LogBizlog' }
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
          <n-gi span="6">
            <SpDateRange v-model="queryModel.date" type="datetime" />
          </n-gi>
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.archive"
              :options="querySchemas.archive"
              placeholder="查询归档"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input
              v-model:value="queryModel.mark"
              placeholder="操作描述"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.user_name"
              placeholder="操作人"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input-number
              v-model:value="queryModel.user_id"
              placeholder="用户ID"
              :show-button="false"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.name"
              placeholder="业务表名"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input-number
              v-model:value="queryModel.xid"
              placeholder="业务ID"
              :show-button="false"
              clearable
            />
          </n-gi>
        </n-grid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable v-bind="gridOptions" @cell-dblclick="({ row }) => handleView(row)">
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
    <BizlogView ref="detailRef" />
  </NaPage>
</template>
