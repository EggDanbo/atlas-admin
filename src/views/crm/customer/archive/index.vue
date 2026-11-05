<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { customer } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/customer/archive',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: customer.archiveSearch },
  createQueryModel,
  columns: [
    { field: 'customer_name', title: '客户名称', width: 200 },
    { field: 'customer_level', title: '客户分级', width: 110, align: 'center', slots: { default: 'level' } },
    { field: 'owner', title: '负责人', width: 90, align: 'center' },
    { field: 'coop_state', title: '合作状态', width: 110, align: 'center', slots: { default: 'state' } },
    { field: 'project_count', title: '项目数', width: 80, align: 'right' },
    { field: 'contract_total', title: '累计合同额', width: 130, align: 'right' },
    { field: 'receivable_amount', title: '应收余额', width: 130, align: 'right' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function levelType(level: string) {
  if (level === '战略客户')
    return 'error'
  if (level === '重点客户')
    return 'warning'
  return 'default'
}

function stateType(state: string) {
  if (state === '合作中')
    return 'success'
  if (state === '已成交')
    return 'info'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'CrmCustomerArchive' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="客户名称 / 负责人" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #level="{ row }">
            <n-tag :type="levelType(row.customer_level)" size="small" :bordered="false">
              {{ row.customer_level }}
            </n-tag>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.coop_state" :type="stateType(row.coop_state)" size="small" :bordered="false">
              {{ row.coop_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
