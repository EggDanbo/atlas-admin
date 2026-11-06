<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { delivery } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/delivery/project',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate } = useRecordActions({
  format: 'atlas/crm/delivery/project',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['progress', 'receipt_rate', 'customer_name'],
  nameFields: ['project_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 860,
})

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: delivery.projectSearch },
  createQueryModel,
  columns: [
    { field: 'project_no', title: '项目编号', width: 130 },
    { field: 'project_name', title: '项目名称', width: 200 },
    { field: 'customer_name', title: '客户', width: 170 },
    { field: 'contract_amount', title: '合同额', width: 120, align: 'right' },
    { field: 'progress', title: '交付进度', width: 140, align: 'center', slots: { default: 'progress' } },
    { field: 'receipt_rate', title: '回款进度(%)', width: 110, align: 'right' },
    { field: 'project_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
    { field: 'manager', title: '项目经理', width: 95, align: 'center' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateType(state: string) {
  if (state === '已交付')
    return 'success'
  if (state === '进行中')
    return 'info'
  if (state === '已暂停')
    return 'warning'
  return 'default'
}

function progressColor(progress: number) {
  if (progress >= 100)
    return '#22B99A'
  if (progress >= 60)
    return '#2BA8E8'
  return '#E9A020'
}
</script>

<script lang="ts">
export default { name: 'CrmDeliveryProject' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="项目 / 客户 / 项目经理" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" @click="openCreate">
              新增项目
            </n-button>
          </template>
          <template #progress="{ row }">
            <div v-if="row.project_no" class="flex items-center gap-2">
              <n-progress
                type="line"
                :percentage="row.progress"
                :height="6"
                :show-indicator="false"
                :color="progressColor(row.progress)"
                rail-color="rgba(128, 128, 128, 0.2)"
                style="flex: 1"
              />
              <span class="w-9 text-right text-xs opacity-70">{{ row.progress }}%</span>
            </div>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.project_state" :type="stateType(row.project_state)" size="small" :bordered="false">
              {{ row.project_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
