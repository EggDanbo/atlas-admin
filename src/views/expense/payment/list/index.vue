<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { payment } from '@/service/api/expense'

function createQueryModel() {
  return {
    format: 'atlas/expense/payment/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: payment.listSearch },
  createQueryModel,
  columns: [
    { field: 'payment_no', title: '支付单号', width: 140 },
    { field: 'claim_no', title: '关联申请单', width: 140 },
    { field: 'applicant', title: '收款人', width: 90, align: 'center' },
    { field: 'dept_name', title: '部门', width: 130 },
    { field: 'amount', title: '支付金额', width: 120, align: 'right' },
    { field: 'pay_method', title: '支付方式', width: 110, align: 'center' },
    { field: 'pay_date', title: '支付日期', width: 110, align: 'center' },
    { field: 'pay_state', title: '状态', width: 95, align: 'center', slots: { default: 'state' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'ExpensePaymentList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="支付单号 / 申请单 / 部门"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #state="{ row }">
            <n-tag
              v-if="row.pay_state"
              :type="row.pay_state === '已支付' ? 'success' : 'warning'"
              size="small"
              :bordered="false"
            >
              {{ row.pay_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
