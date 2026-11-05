<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { budget } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/budget/project-cost',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: budget.projectSearch },
  createQueryModel,
  columns: [
    { field: 'project', title: '项目', width: 160 },
    { field: 'contract_amount', title: '合同金额', width: 120, align: 'right' },
    { field: 'labor_cost', title: '人工成本', width: 110, align: 'right' },
    { field: 'purchase_cost', title: '采购成本', width: 110, align: 'right' },
    // 差旅与其他金额都小，分两列会把毛利率挤出可视区，用合计列合成一列
    { field: 'other_total_amount', title: '其他成本', width: 110, align: 'right' },
    { field: 'profit_amount', title: '毛利', width: 115, align: 'right' },
    { field: 'gross_rate', title: '毛利率(%)', width: 95, align: 'right' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'FinanceBudgetProject' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="项目名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" />
      </n-card>
    </n-flex>
  </NaPage>
</template>
