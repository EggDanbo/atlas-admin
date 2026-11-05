<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { analysis } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/analysis/indicator',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: analysis.indicatorSearch },
  createQueryModel,
  columns: [
    { field: 'indicator', title: '指标', width: 200 },
    { field: 'current_value', title: '本期', width: 130, align: 'right' },
    { field: 'previous_value', title: '上期', width: 130, align: 'right' },
    { field: 'industry_value', title: '行业均值', width: 130, align: 'right' },
    { field: 'rating', title: '评价', width: 100, align: 'center', slots: { default: 'rating' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})

function ratingType(rating: string) {
  if (rating === '优')
    return 'success'
  if (rating === '良')
    return 'info'
  return 'warning'
}
</script>

<script lang="ts">
export default { name: 'FinanceAnalysisIndicator' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="指标名称" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #rating="{ row }">
            <!-- 合计行没有状态值，不渲染空标签 -->
            <n-tag v-if="row.rating" :type="ratingType(row.rating)" size="small" :bordered="false">
              {{ row.rating }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
