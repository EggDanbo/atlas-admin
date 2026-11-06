<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { delivery } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/delivery/milestone',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/crm/delivery/milestone',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['delay_days', 'customer_name', 'project_name', 'manager'],
  nameFields: ['project_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 780,
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: delivery.milestoneSearch },
  createQueryModel,
  columns: [
    { field: 'project_name', title: '项目', width: 210 },
    { field: 'customer_name', title: '客户', width: 170 },
    { field: 'milestone_node', title: '里程碑', width: 110, align: 'center' },
    { field: 'plan_date', title: '计划完成', width: 115, align: 'center' },
    { field: 'actual_date', title: '实际完成', width: 115, align: 'center' },
    { field: 'delay_days', title: '延期(天)', width: 95, align: 'right', slots: { default: 'delay' } },
    { field: 'node_state', title: '状态', width: 105, align: 'center', slots: { default: 'state' } },
    { field: 'manager', title: '项目经理', width: 95, align: 'center' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateType(state: string) {
  if (state === '已完成')
    return 'success'
  if (state === '进行中')
    return 'info'
  if (state === '延期完成')
    return 'error'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'CrmDeliveryMilestone' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="项目 / 客户 / 里程碑" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增里程碑
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #delay="{ row }">
            <span :class="row.delay_days > 0 ? 'text-[#E8635F]' : ''">
              {{ row.delay_days > 0 ? `+${row.delay_days}` : '—' }}
            </span>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.node_state" :type="stateType(row.node_state)" size="small" :bordered="false">
              {{ row.node_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
