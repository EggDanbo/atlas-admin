<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { treasury } from '@/service/api/finance'

const currentYear = new Date().getFullYear()
/** 只保留三个年度，年份写成数字而不是日期：接口按会计年度过滤，不是时间戳 */
const yearOptions = [-2, -1, 0].map(offset => ({
  label: `${currentYear + offset} 年`,
  value: currentYear + offset,
}))

function createQueryModel() {
  return {
    format: 'atlas/finance/treasury/plan',
    year: currentYear as number | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/finance/treasury/plan',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['actual_in_amount', 'actual_out_amount', 'diff_amount', 'execution_rate'],
  nameFields: ['year'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 800,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: treasury.planSearch },
  createQueryModel,
  columns: [
    { field: 'year', title: '年度', width: 90, align: 'center' },
    { field: 'month', title: '月份', width: 80, align: 'center' },
    { field: 'plan_in_amount', title: '计划流入', width: 150, align: 'right' },
    { field: 'plan_out_amount', title: '计划流出', width: 150, align: 'right' },
    { field: 'actual_in_amount', title: '实际流入', width: 150, align: 'right' },
    { field: 'actual_out_amount', title: '实际流出', width: 150, align: 'right' },
    { field: 'diff_amount', title: '净额差异', width: 150, align: 'right' },
    { field: 'execution_rate', title: '执行率(%)', width: 110, align: 'right' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})
</script>

<script lang="ts">
export default { name: 'FinanceTreasuryPlan' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.year"
              :options="yearOptions"
              placeholder="计划年度"
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增计划
            </n-button>
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
