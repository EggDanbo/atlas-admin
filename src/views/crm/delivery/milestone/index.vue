<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { delivery } from '@/service/api/crm'

function createQueryModel() {
  return {
    format: 'atlas/crm/delivery/milestone',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
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
  </NaPage>
</template>
