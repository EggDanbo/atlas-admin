<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { receipt } from '@/service/api/purchase'

function createQueryModel() {
  return {
    format: 'atlas/purchase/settlement/receipt',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/**
 * 验收决定这批货能不能入库：不合格数不为零时，应付也要跟着打折
 */
const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/purchase/settlement/receipt',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['qualified_rate', 'supplier_name', 'category'],
  nameFields: ['receipt_no'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 880,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: receipt.listSearch },
  createQueryModel,
  columns: [
    { field: 'receipt_no', title: '验收单号', width: 125, align: 'left' },
    { field: 'order_no', title: '采购订单', width: 120, align: 'left' },
    { field: 'supplier_name', title: '供应商', width: 170, align: 'left' },
    { field: 'arrival_qty', title: '到货数量', width: 90, align: 'right' },
    { field: 'qualified_qty', title: '合格数', width: 85, align: 'right' },
    { field: 'reject_qty', title: '不合格数', width: 90, align: 'right' },
    { field: 'qualified_rate', title: '合格率(%)', width: 100, align: 'right' },
    { field: 'receipt_date', title: '验收日期', width: 105, align: 'center' },
    { field: 'receipt_result', title: '验收结论', width: 100, align: 'center', slots: { default: 'result' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function resultTag(result: string) {
  if (result === '全部合格')
    return 'success'
  if (result === '部分合格')
    return 'warning'
  return 'error'
}
</script>

<script lang="ts">
export default { name: 'PurchaseSettlementReceipt' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="验收单号 / 订单号 / 供应商" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              登记验收
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #result="{ row }">
            <n-tag v-if="row.receipt_result" :type="resultTag(row.receipt_result)" size="small" :bordered="false">
              {{ row.receipt_result }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
