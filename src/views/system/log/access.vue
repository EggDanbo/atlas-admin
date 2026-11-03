<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { addDays, format } from 'date-fns'
import { reactive, ref, unref } from 'vue'
import { SpDateRange } from '@/components/SpDateRange'
import { logAccess as api } from '@/service/api/system'
import AccessView from './accessView.vue'
import Archive from './archive-query.vue'
import { accessColumns } from './columns'

const pageLoading = ref(false)
const tableRef = ref<TableInstance | null>(null)
const columnsRef = ref<TableColumn[]>([
  { type: 'checkbox', width: 44, align: 'center', fixed: 'left' },
  ...accessColumns,
])
const active = ref(false)
const exportLoading = ref(false)

const detailRef = ref<OpenModal | null>(null)

function createQueryModel() {
  return ({
    date: [addDays(Date.now(), -1).getTime(), addDays(Date.now(), 1).getTime()] as [
      number,
      number,
    ],
    requestpath: '',
    httpstatuscode: null,
    username: '',
    usersub: '',
    ex: null,
    archive: null,
  })
}

/** 筛选条件 */
const queryModel = reactive(createQueryModel())

const querySchemas = computed(() => {
  return {
    ex: [
      {
        label: '否',
        value: 'false',
      },
      {
        label: '是',
        value: 'true',
      },
    ],
    archive: [
      {
        label: '否',
        value: '0',
      },
      {
        label: '是',
        value: '1',
      },
    ],
  }
})

const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),
  async fetchData(params) {
    const { isSuccess, data } = await api.getList({
      ...params,
      ...queryModel,
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

async function handleExport() {
  const rows = tableRef.value?.getCheckboxRows()
  const ids = rows?.map((row: Recordable) => row.id) ?? []

  exportLoading.value = true
  try {
    const { isSuccess, data } = await api.export({ ids })
    if (!isSuccess)
      return
    location.href = data
  }
  finally {
    exportLoading.value = false
  }
}
</script>

<script lang="ts">
export default { name: 'SystemLogAccess' }
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
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.ex"
              :options="querySchemas.ex"
              placeholder="是否异常"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-input-number
              v-model:value="queryModel.httpstatuscode"
              placeholder="状态码"
              :show-button="false"
              clearable
            />
          </n-gi>
          <n-gi span="6">
            <n-input
              v-model:value="queryModel.requestpath"
              placeholder="请求地址"
              clearable
            />
          </n-gi>

          <n-gi span="2">
            <n-input
              v-model:value="queryModel.username"
              placeholder="用户姓名"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input
              v-model:value="queryModel.usersub"
              placeholder="用户标识"
              clearable
            />
          </n-gi>>
        </n-grid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleView(row)">
          <template #toolbarLeftBtn>
            <n-button @click="active = true">
              归档
            </n-button>
            <n-button class="ml-2" :loading="exportLoading" @click="handleExport">
              导出
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
    <AccessView ref="detailRef" />
    <Archive v-model:active="active" mark="access" />
  </NaPage>
</template>
