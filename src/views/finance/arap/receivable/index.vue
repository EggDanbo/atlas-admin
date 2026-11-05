<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { arap } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/arap/receivable',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: arap.receivableSearch },
  createQueryModel,
  columns: [
    { field: 'customer', title: '客户', width: 170, fixed: 'left' },
    { field: 'total_amount', title: '应收总额', width: 115, align: 'right' },
    { field: 'not_due_amount', title: '未到期', width: 105, align: 'right' },
    { field: 'overdue_m1_amount', title: '逾期 30 天内', width: 115, align: 'right' },
    { field: 'overdue_m2_amount', title: '逾期 31-60 天', width: 115, align: 'right' },
    { field: 'overdue_m3_amount', title: '逾期 61-90 天', width: 115, align: 'right' },
    { field: 'overdue_over_amount', title: '逾期 90 天以上', width: 125, align: 'right' },
    { field: 'bad_debt_amount', title: '坏账准备', width: 110, align: 'right' },
    { field: 'overdue_days', title: '最长逾期(天)', width: 115, align: 'right' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'FinanceArapReceivable' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="客户名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" />
      </n-card>
    </n-flex>
  </NaPage>
</template>
