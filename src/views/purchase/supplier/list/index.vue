<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { supplier } from '@/service/api/purchase'

function createQueryModel() {
  return {
    format: 'atlas/purchase/supplier/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/**
 * 供应商是采购的主数据：准入状态决定能不能下单，评级与准时率决定该不该继续用
 */
const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/purchase/supplier/list',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['purchase_total'],
  nameFields: ['supplier_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 880,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: supplier.listSearch },
  createQueryModel,
  columns: [
    { field: 'supplier_no', title: '供应商编码', width: 110, align: 'left' },
    { field: 'supplier_name', title: '供应商名称', width: 170, align: 'left' },
    { field: 'supplier_category', title: '供应品类', width: 95, align: 'center' },
    { field: 'credit_days', title: '账期(天)', width: 85, align: 'right' },
    { field: 'access_state', title: '准入状态', width: 105, align: 'center', slots: { default: 'access' } },
    { field: 'rating', title: '评级', width: 68, align: 'center', slots: { default: 'rating' } },
    { field: 'ontime_rate', title: '准时率(%)', width: 100, align: 'right' },
    { field: 'purchase_total', title: '累计采购额', width: 135, align: 'right' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function accessTag(state: string) {
  if (state === '合格供应商')
    return 'success'
  if (state === '考察中')
    return 'warning'
  return 'error'
}

function ratingTag(rating: string) {
  if (rating === 'A')
    return 'success'
  if (rating === 'B')
    return 'info'
  return 'warning'
}
</script>

<script lang="ts">
export default { name: 'PurchaseSupplierList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="供应商名称 / 城市 / 品类" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增供应商
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #access="{ row }">
            <n-tag v-if="row.access_state" :type="accessTag(row.access_state)" size="small" :bordered="false">
              {{ row.access_state }}
            </n-tag>
          </template>
          <template #rating="{ row }">
            <n-tag v-if="row.rating" :type="ratingTag(row.rating)" size="small" :bordered="false">
              {{ row.rating }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
