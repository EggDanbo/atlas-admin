<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { maintain } from '@/service/api/asset'

function createQueryModel() {
  return {
    format: 'atlas/asset/maintain/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/asset/maintain/list',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['maintain_no'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 780,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: maintain.listSearch },
  createQueryModel,
  columns: [
    { field: 'maintain_no', title: '维保单号', width: 130 },
    { field: 'asset_name', title: '资产名称', width: 180 },
    { field: 'maintain_type', title: '维保类型', width: 105, align: 'center', slots: { default: 'type' } },
    { field: 'plan_date', title: '计划日期', width: 110, align: 'center' },
    { field: 'last_date', title: '上次维保', width: 110, align: 'center' },
    { field: 'cost_amount', title: '费用', width: 100, align: 'right' },
    { field: 'maintain_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateTag(state: string) {
  if (state === '已完成')
    return 'success'
  if (state === '即将到期')
    return 'warning'
  return 'info'
}
</script>

<script lang="ts">
export default { name: 'AssetMaintainList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="维保单号 / 资产名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增维保
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #type="{ row }">
            <n-tag
              v-if="row.maintain_type"
              :type="row.maintain_type === '故障维修' ? 'error' : 'info'"
              size="small"
              :bordered="false"
            >
              {{ row.maintain_type }}
            </n-tag>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.maintain_state" :type="stateTag(row.maintain_state)" size="small" :bordered="false">
              {{ row.maintain_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
