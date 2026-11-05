<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { ledger } from '@/service/api/asset'

function createQueryModel() {
  return {
    format: 'atlas/asset/ledger/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: ledger.listSearch },
  createQueryModel,
  columns: [
    { field: 'asset_no', title: '资产编号', width: 135 },
    { field: 'asset_name', title: '资产名称', width: 170 },
    { field: 'asset_category', title: '资产类别', width: 105, align: 'center' },
    { field: 'dept_name', title: '使用部门', width: 125 },
    { field: 'keeper', title: '使用人', width: 85, align: 'center' },
    { field: 'asset_state', title: '状态', width: 90, align: 'center', slots: { default: 'state' } },
    { field: 'purchase_date', title: '购置日期', width: 110, align: 'center' },
    { field: 'price_amount', title: '原值', width: 115, align: 'right' },
    { field: 'net_amount', title: '净值', width: 115, align: 'right' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateTag(state: string) {
  if (state === '在用')
    return 'success'
  if (state === '闲置')
    return 'info'
  if (state === '维修中')
    return 'warning'
  return 'error'
}
</script>

<script lang="ts">
export default { name: 'AssetLedgerList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="资产编号 / 名称 / 部门 / 使用人"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #state="{ row }">
            <n-tag v-if="row.asset_state" :type="stateTag(row.asset_state)" size="small" :bordered="false">
              {{ row.asset_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
