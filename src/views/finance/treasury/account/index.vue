<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { treasury } from '@/service/api/finance'

function createQueryModel() {
  return {
    format: 'atlas/finance/treasury/account',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
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
        <SpTable ref="tableRef" v-bind="gridOptions" />
      </n-card>
    </n-flex>
  </NaPage>
</template>
