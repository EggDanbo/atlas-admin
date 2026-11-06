<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { billing } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/billing/receipt',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate } = useRecordActions({
  format: 'atlas/crm/billing/receipt',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['customer_name', 'project_name', 'invoice_no'],
  nameFields: ['customer_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 780,
})

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: billing.receiptSearch },
  createQueryModel,
  columns: [
    { field: 'customer_name', title: '客户', width: 180 },
    { field: 'project_name', title: '项目', width: 190 },
    { field: 'invoice_no', title: '对应发票', width: 160 },
    { field: 'receipt_amount', title: '回款金额', width: 125, align: 'right' },
    { field: 'pay_method', title: '回款方式', width: 105, align: 'center' },
    { field: 'receipt_date', title: '到账日期', width: 110, align: 'center' },
    { field: 'receipt_state', title: '认领状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'CrmBillingReceipt' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="客户 / 项目 / 发票号" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" @click="openCreate">
              登记回款
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag
              v-if="row.receipt_state"
              :type="row.receipt_state === '已认领' ? 'success' : 'warning'"
              size="small"
              :bordered="false"
            >
              {{ row.receipt_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
