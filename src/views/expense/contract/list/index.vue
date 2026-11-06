<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { contract } from '@/service/api/expense'

function createQueryModel() {
  return {
    format: 'atlas/expense/contract/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/expense/contract/list',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['paid_amount', 'payment_rate'],
  nameFields: ['contract_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 820,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: contract.listSearch },
  createQueryModel,
  columns: [
    { field: 'contract_no', title: '合同编号', width: 140 },
    { field: 'contract_name', title: '合同名称', width: 220 },
    { field: 'supplier', title: '供应商', width: 180 },
    { field: 'amount', title: '合同金额', width: 120, align: 'right' },
    { field: 'paid_amount', title: '已付款', width: 115, align: 'right' },
    { field: 'payment_rate', title: '付款进度(%)', width: 115, align: 'right' },
    { field: 'expire_date', title: '到期日', width: 110, align: 'center' },
    { field: 'contract_state', title: '状态', width: 105, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateTag(state: string) {
  if (state === '履行中')
    return 'success'
  if (state === '即将到期')
    return 'warning'
  return 'error'
}
</script>

<script lang="ts">
export default { name: 'ExpenseContractList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="合同编号 / 名称 / 供应商"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增合同
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.contract_state" :type="stateTag(row.contract_state)" size="small" :bordered="false">
              {{ row.contract_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
