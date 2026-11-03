<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableColumn, TableProps } from '@/components/SpTable'
import { addDays, format } from 'date-fns'
import { reactive, ref, unref } from 'vue'
import { SpDateRange } from '@/components/SpDateRange'
import { logApp as api } from '@/service/api/system'
import AppView from './appView.vue'
import Archive from './archive-query.vue'
import { appColumns } from './columns'

const pageLoading = ref(false)
const columnsRef = ref<TableColumn[]>(appColumns)
const active = ref(false)

const detailRef = ref<OpenModal | null>(null)

function createQueryModel() {
  return ({
    date: [addDays(Date.now(), -1).getTime(), addDays(Date.now(), 1).getTime()] as [
      number,
      number,
    ],
    appname: '',
    source: '',
    level: null,
    progress: '',
    messagelike: '',
    archive: null,
  })
}

/** 筛选条件 */
const queryModel = reactive(createQueryModel())

const querySchemas = computed(() => {
  return {
    level: [
      { label: 'Error', value: '4' },
      { label: 'Warn', value: '3' },
      { label: 'Fatal', value: '5' },
      { label: 'Info', value: '2' },
      { label: 'Debug', value: '1' },
      { label: 'Verbose', value: '0' },
    ],
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
      appname: queryModel.appname,
      source: queryModel.source,
      progress: queryModel.progress,
      level: queryModel.level,
      messagelike: queryModel.messagelike,
      archive: queryModel.archive,
      begindate:
        queryModel.date && queryModel.date[0]
          ? format(queryModel.date[0], 'yyyy-MM-dd HH:mm:ss')
          : null,
      enddate:
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
export default { name: 'LogApp' }
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
              v-model:value="queryModel.level"
              :options="querySchemas.level"
              placeholder="日志等级"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.appname"
              placeholder="应用名称"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.messagelike"
              placeholder="消息"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.source"
              placeholder="源"
              clearable
            />
          </n-gi>
          <n-gi span="6">
            <n-input
              v-model:value="queryModel.progress"
              placeholder="进程地址"
              clearable
            />
          </n-gi>
        </n-grid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable v-bind="gridOptions" @cell-dblclick="({ row }) => handleView(row)">
          <template #toolbarLeftBtn>
            <n-button @click="active = true">
              归档
            </n-button>
          </template>
          <!-- 日志等级 -->
          <template #level="{ row }">
            <n-tag v-if="row.level === 1" :bordered="false">
              Debug
            </n-tag>
            <n-tag v-else-if="row.level === 2" :bordered="false" type="info">
              Info
            </n-tag>
            <n-tag v-else-if="row.level === 3" :bordered="false" type="warning">
              Warn
            </n-tag>
            <n-tag v-else-if="row.level === 4" :bordered="false" type="error">
              Error
            </n-tag>
            <n-tag v-else-if="row.level === 5" :bordered="false" type="error">
              Fatal
            </n-tag>
            <n-tag v-else :bordered="false">
              Verbose
            </n-tag>
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
    <AppView ref="detailRef" />
    <Archive v-model:active="active" mark="app" />
  </NaPage>
</template>
