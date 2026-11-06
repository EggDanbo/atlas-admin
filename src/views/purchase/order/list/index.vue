<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { order } from '@/service/api/purchase'

function createQueryModel() {
  return {
    format: 'atlas/purchase/order/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/**
 * 订单是采购的履约凭证：金额、到货进度、结算状态都挂在它身上
 */
const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/purchase/order/list',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['receipt_progress', 'supplier_name', 'category'],
  nameFields: ['order_no'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 880,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: order.listSearch },
  createQueryModel,
  columns: [
    { field: 'order_no', title: '订单号', width: 125, align: 'left' },
    { field: 'supplier_name', title: '供应商', width: 170, align: 'left' },
    { field: 'item_category', title: '品类', width: 100, align: 'center' },
    { field: 'order_amount', title: '订单金额', width: 120, align: 'right' },
    { field: 'receipt_progress', title: '到货进度', width: 130, align: 'center', slots: { default: 'progress' } },
    { field: 'order_date', title: '下单日期', width: 105, align: 'center' },
    { field: 'expect_arrival', title: '期望到货', width: 105, align: 'center' },
    { field: 'order_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function progressStatus(value: number) {
  const rate = Number(value) || 0
  if (rate >= 100)
    return 'success'
  if (rate > 0)
    return 'warning'
  return 'default'
}

function stateTag(state: string) {
  if (state === '已结算')
    return 'success'
  if (state === '已到货')
    return 'info'
  if (state === '部分到货')
    return 'warning'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'PurchaseOrderList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="订单号 / 供应商 / 品类" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新建订单
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #progress="{ row }">
            <div v-if="row.order_no" class="flex items-center gap-2">
              <n-progress
                type="line"
                :percentage="Math.min(100, Number(row.receipt_progress) || 0)"
                :height="5"
                :show-indicator="false"
                :status="progressStatus(row.receipt_progress)"
                class="flex-1"
              />
              <span class="text-xs opacity-70">{{ Number(row.receipt_progress) || 0 }}%</span>
            </div>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.order_state" :type="stateTag(row.order_state)" size="small" :bordered="false">
              {{ row.order_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
