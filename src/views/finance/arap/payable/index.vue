<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { arap } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/arap/payable',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: arap.payableSearch },
  createQueryModel,
  columns: [
    { field: 'supplier', title: '供应商', width: 220 },
    { field: 'total_amount', title: '应付总额', width: 150, align: 'right' },
    { field: 'due_month_amount', title: '本月到期', width: 150, align: 'right' },
    { field: 'overdue_amount', title: '逾期未付', width: 150, align: 'right' },
    { field: 'credit_days', title: '信用账期(天)', width: 120, align: 'right' },
    { field: 'credit_level', title: '信用等级', width: 100, align: 'center' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'FinanceArapPayable' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="供应商名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" />
      </n-card>
    </n-flex>
  </NaPage>
</template>
