<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { opportunity } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/opportunity/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: opportunity.listSearch },
  createQueryModel,
  columns: [
    { field: 'opp_name', title: '商机名称', width: 220 },
    { field: 'customer_name', title: '客户', width: 180 },
    { field: 'expect_amount', title: '预计金额', width: 130, align: 'right' },
    { field: 'opp_stage', title: '阶段', width: 110, align: 'center', slots: { default: 'stage' } },
    { field: 'win_rate', title: '赢单率(%)', width: 100, align: 'right' },
    { field: 'expect_date', title: '预计成交', width: 110, align: 'center' },
    { field: 'owner', title: '负责人', width: 90, align: 'center' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stageType(stage: string) {
  if (stage === '赢单')
    return 'success'
  if (stage === '输单')
    return 'default'
  if (stage === '商务谈判')
    return 'warning'
  if (stage === '方案报价')
    return 'info'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'CrmOpportunityList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="商机 / 客户 / 负责人" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #stage="{ row }">
            <n-tag v-if="row.opp_stage" :type="stageType(row.opp_stage)" size="small" :bordered="false">
              {{ row.opp_stage }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
