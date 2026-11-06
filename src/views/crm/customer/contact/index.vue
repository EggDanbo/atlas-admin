<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { customer } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/customer/contact',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/crm/customer/contact',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['contact_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 780,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: customer.contactSearch },
  createQueryModel,
  columns: [
    { field: 'customer_name', title: '所属客户', width: 200 },
    { field: 'contact_name', title: '姓名', width: 90, align: 'center' },
    { field: 'job_title', title: '职务', width: 110, align: 'center' },
    { field: 'phone', title: '手机号', width: 130 },
    { field: 'email', title: '邮箱', width: 200 },
    { field: 'decision_role', title: '决策角色', width: 100, align: 'center', slots: { default: 'decision' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'CrmCustomerContact' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="客户 / 姓名 / 职务" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增联系人
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #decision="{ row }">
            <n-tag v-if="row.decision_role === '决策人'" type="success" size="small" :bordered="false">
              决策人
            </n-tag>
            <span v-else class="opacity-40">—</span>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
