<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { request } from '@/service/api/purchase'

function createQueryModel() {
  return {
    format: 'atlas/purchase/order/request',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/**
 * 申请是采购的起点：需求部门提出来，审批通过后才转成订单
 */
const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/purchase/order/request',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['request_no'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 880,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: request.listSearch },
  createQueryModel,
  columns: [
    { field: 'request_no', title: '申请单号', width: 130, align: 'left' },
    { field: 'apply_dept', title: '申请部门', width: 110, align: 'left' },
    { field: 'item_name', title: '物品名称', width: 130, align: 'left' },
    { field: 'item_category', title: '品类', width: 100, align: 'center' },
    { field: 'quantity', title: '数量', width: 80, align: 'right' },
    { field: 'budget_amount', title: '预算金额', width: 120, align: 'right' },
    { field: 'apply_date', title: '申请日期', width: 105, align: 'center' },
    { field: 'expect_date', title: '期望到货', width: 105, align: 'center' },
    { field: 'request_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateTag(state: string) {
  if (state === '已下单')
    return 'success'
  if (state === '已通过')
    return 'info'
  if (state === '已关闭')
    return 'default'
  return 'warning'
}
</script>

<script lang="ts">
export default { name: 'PurchaseOrderRequest' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="申请单号 / 部门 / 物品 / 申请人" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              发起采购申请
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.request_state" :type="stateTag(row.request_state)" size="small" :bordered="false">
              {{ row.request_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
