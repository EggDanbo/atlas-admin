<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { treasury } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/treasury/account',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/finance/treasury/account',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['balance', 'inflow_amount', 'outflow_amount', 'account_state_label'],
  nameFields: ['account_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 820,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: treasury.accountSearch },
  createQueryModel,
  columns: [
    { field: 'account_name', title: '账户名称', width: 150, fixed: 'left' },
    { field: 'bank_name', title: '开户行', width: 140 },
    { field: 'account_no', title: '账号', width: 155 },
    { field: 'currency', title: '币种', width: 80, align: 'center' },
    { field: 'account_type', title: '账户类型', width: 95, align: 'center' },
    { field: 'balance', title: '账户余额', width: 130, align: 'right' },
    { field: 'inflow_amount', title: '本月流入', width: 120, align: 'right' },
    { field: 'outflow_amount', title: '本月流出', width: 120, align: 'right' },
    { field: 'account_state_label', title: '状态', width: 80, align: 'center' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'FinanceTreasuryAccount' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="账户名称 / 开户行"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增账户
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
