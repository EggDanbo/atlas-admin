<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { claim } from '@/service/api/expense'

function createQueryModel() {
  return {
    format: 'atlas/expense/claim/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: claim.listSearch },
  createQueryModel,
  columns: [
    { field: 'claim_no', title: '申请单号', width: 150 },
    { field: 'expense_type', title: '费用类型', width: 110, align: 'center', slots: { default: 'type' } },
    { field: 'applicant', title: '申请人', width: 90, align: 'center' },
    { field: 'dept_name', title: '部门', width: 130 },
    { field: 'amount', title: '金额', width: 120, align: 'right' },
    { field: 'apply_date', title: '申请日期', width: 110, align: 'center' },
    { field: 'claim_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function typeTag(type: string) {
  if (type === '差旅费')
    return 'info'
  if (type === '业务招待')
    return 'warning'
  if (type === '办公采购')
    return 'success'
  return 'default'
}

function stateTag(state: string) {
  if (state === '已支付')
    return 'success'
  if (state === '已通过')
    return 'info'
  if (state === '已驳回')
    return 'error'
  return 'warning'
}
</script>

<script lang="ts">
export default { name: 'ExpenseClaimList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="单号 / 申请人 / 部门 / 费用类型"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #type="{ row }">
            <n-tag v-if="row.expense_type" :type="typeTag(row.expense_type)" size="small" :bordered="false">
              {{ row.expense_type }}
            </n-tag>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.claim_state" :type="stateTag(row.claim_state)" size="small" :bordered="false">
              {{ row.claim_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
