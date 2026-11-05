<script setup lang="ts">
import { useListPage } from '@/hooks/list'
import { budget } from '@/service/api/expense'

function createQueryModel() {
  return {
    format: 'atlas/expense/budget/quota',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, gridOptions } = useListPage<QueryModel>({
  api: { search: budget.quotaSearch },
  createQueryModel,
  columns: [
    { field: 'expense_type', title: '费用类别', width: 150 },
    { field: 'year', title: '年度', width: 90, align: 'center' },
    { field: 'budget_amount', title: '年度预算', width: 140, align: 'right' },
    { field: 'used_amount', title: '已使用', width: 130, align: 'right' },
    { field: 'remain_amount', title: '剩余额度', width: 130, align: 'right' },
    { field: 'execution_rate', title: '执行率(%)', width: 160, align: 'center', slots: { default: 'rate' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})

function rateColor(rate: number) {
  if (rate >= 90)
    return '#E8635F'
  if (rate >= 70)
    return '#E9A020'
  return '#22B99A'
}
</script>

<script lang="ts">
export default { name: 'ExpenseBudgetQuota' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #rate="{ row }">
            <div class="flex items-center gap-2">
              <n-progress
                type="line"
                :percentage="Math.min(100, Number(row.execution_rate) || 0)"
                :height="6"
                :show-indicator="false"
                :color="rateColor(Number(row.execution_rate) || 0)"
                rail-color="rgba(128, 128, 128, 0.2)"
                style="flex: 1"
              />
              <span class="w-9 text-right text-xs opacity-70">{{ row.execution_rate }}%</span>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
