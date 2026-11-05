<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { flow } from '@/service/api/asset'

function createQueryModel() {
  return {
    format: 'atlas/asset/flow/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: flow.listSearch },
  createQueryModel,
  columns: [
    { field: 'flow_no', title: '流水号', width: 140 },
    { field: 'flow_type', title: '类型', width: 90, align: 'center', slots: { default: 'type' } },
    { field: 'asset_name', title: '资产', width: 180 },
    { field: 'handler', title: '经办人', width: 85, align: 'center' },
    { field: 'from_dept', title: '原部门', width: 120 },
    { field: 'to_dept', title: '新部门', width: 120 },
    { field: 'flow_date', title: '发生日期', width: 110, align: 'center' },
    { field: 'flow_state', title: '状态', width: 95, align: 'center', slots: { default: 'state' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function typeTag(type: string) {
  if (type === '领用')
    return 'success'
  if (type === '调拨')
    return 'info'
  if (type === '借出')
    return 'warning'
  if (type === '处置')
    return 'error'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'AssetFlowList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="流水号 / 资产 / 经办人 / 部门"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #type="{ row }">
            <n-tag v-if="row.flow_type" :type="typeTag(row.flow_type)" size="small" :bordered="false">
              {{ row.flow_type }}
            </n-tag>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.flow_state" :type="row.flow_state === '已完成' ? 'success' : 'warning'" size="small" :bordered="false">
              {{ row.flow_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
