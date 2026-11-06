<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { payable } from '@/service/api/purchase'

function createQueryModel() {
  return {
    format: 'atlas/purchase/settlement/payable',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/**
 * 应付与财务的应付账款同源：未付金额 = 订单金额 - 已付金额，逾期要能一眼看到
 */
const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/purchase/settlement/payable',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['unpaid_amount', 'supplier_name', 'credit_days'],
  nameFields: ['supplier_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 880,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: payable.listSearch },
  createQueryModel,
  columns: [
    { field: 'payable_no', title: '应付单号', width: 120, align: 'left' },
    { field: 'order_no', title: '采购订单', width: 115, align: 'left' },
    { field: 'supplier_name', title: '供应商', width: 165, align: 'left' },
    { field: 'payable_amount', title: '应付金额', width: 115, align: 'right' },
    { field: 'paid_amount', title: '已付金额', width: 110, align: 'right' },
    { field: 'unpaid_amount', title: '未付金额', width: 115, align: 'right' },
    { field: 'due_date', title: '到期日', width: 105, align: 'center' },
    { field: 'remain_days', title: '距到期(天)', width: 110, align: 'center', slots: { default: 'remain' } },
    { field: 'settle_state', title: '结算状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateTag(state: string) {
  if (state === '已结清')
    return 'success'
  if (state === '已逾期')
    return 'error'
  return 'warning'
}
</script>

<script lang="ts">
export default { name: 'PurchaseSettlementPayable' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="应付单号 / 订单号 / 供应商" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              登记付款
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #remain="{ row }">
            <span v-if="row.payable_no" :class="Number(row.remain_days) < 0 ? 'text-red-500' : ''">
              {{ Number(row.remain_days) < 0 ? `逾期 ${Math.abs(Number(row.remain_days))}` : row.remain_days }}
            </span>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.settle_state" :type="stateTag(row.settle_state)" size="small" :bordered="false">
              {{ row.settle_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
