<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { value } from '@/service/api/asset'

function createQueryModel() {
  return {
    format: 'atlas/asset/value/depreciation',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost } = useRecordActions({
  format: 'atlas/asset/value/depreciation',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['asset_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 860,
  mode: 'view',
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: value.listSearch },
  createQueryModel,
  columns: [
    { field: 'dep_month', title: '计提月份', width: 100, align: 'center' },
    { field: 'asset_no', title: '资产编号', width: 130 },
    { field: 'asset_name', title: '资产名称', width: 170 },
    { field: 'dept_name', title: '使用部门', width: 125 },
    { field: 'original_amount', title: '原值', width: 115, align: 'right' },
    { field: 'monthly_amount', title: '本月折旧', width: 105, align: 'right' },
    { field: 'accumulated_amount', title: '累计折旧', width: 115, align: 'right' },
    { field: 'net_amount', title: '净值', width: 115, align: 'right' },
    { field: 'dep_method', title: '折旧方法', width: 110, align: 'center' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'AssetValueDepreciation' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="资产编号 / 名称 / 部门"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
