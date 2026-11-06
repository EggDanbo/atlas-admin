<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { billing } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/billing/invoice',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/crm/billing/invoice',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['customer_name', 'project_name'],
  nameFields: ['invoice_no'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 820,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: billing.invoiceSearch },
  createQueryModel,
  columns: [
    { field: 'invoice_no', title: '发票号码', width: 160 },
    { field: 'customer_name', title: '客户', width: 170 },
    { field: 'project_name', title: '项目', width: 180 },
    { field: 'amount', title: '金额', width: 125, align: 'right' },
    { field: 'tax_rate', title: '税率(%)', width: 90, align: 'right' },
    { field: 'invoice_type', title: '发票类型', width: 130 },
    { field: 'invoice_date', title: '开票日期', width: 110, align: 'center' },
    { field: 'invoice_state', title: '认证状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'CrmBillingInvoice' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="发票号 / 客户 / 项目" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              登记开票
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag
              v-if="row.invoice_state"
              :type="row.invoice_state === '已认证' ? 'success' : 'warning'"
              size="small"
              :bordered="false"
            >
              {{ row.invoice_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
