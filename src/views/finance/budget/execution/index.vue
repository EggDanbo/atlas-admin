<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { budget } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/budget/execution',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: budget.executionSearch },
  createQueryModel,
  columns: [
    { field: 'dept', title: '部门', width: 180 },
    { field: 'year', title: '年度', width: 90, align: 'center' },
    { field: 'budget_amount', title: '年度预算', width: 160, align: 'right' },
    { field: 'used_amount', title: '已使用', width: 160, align: 'right' },
    { field: 'remain_amount', title: '剩余', width: 160, align: 'right' },
    { field: 'execution_rate', title: '执行率(%)', width: 120, align: 'right' },
    { field: 'warning', title: '预警', width: 100, align: 'center', slots: { default: 'warning' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})

/** 预警色：超支红、关注橙、正常绿，比单纯数字更容易扫出来 */
function warningType(warning: string) {
  if (warning === '超支')
    return 'error'
  if (warning === '关注')
    return 'warning'
  return 'success'
}
</script>

<script lang="ts">
export default { name: 'FinanceBudgetExecution' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="部门名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #warning="{ row }">
            <!-- 合计行没有状态值，不渲染空标签 -->
            <n-tag v-if="row.warning" :type="warningType(row.warning)" size="small" :bordered="false">
              {{ row.warning }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
