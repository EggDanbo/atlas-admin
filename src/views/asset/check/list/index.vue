<script setup lang="ts">
import { useListPage } from '@/hooks/list'
import { check } from '@/service/api/asset'

function createQueryModel() {
  return {
    format: 'atlas/asset/check/list',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, gridOptions } = useListPage<QueryModel>({
  api: { search: check.listSearch },
  createQueryModel,
  columns: [
    { field: 'check_no', title: '盘点单号', width: 130 },
    { field: 'check_name', title: '盘点任务', width: 210 },
    { field: 'scope', title: '盘点范围', width: 170 },
    { field: 'checker', title: '盘点人', width: 90, align: 'center' },
    { field: 'plan_date', title: '计划日期', width: 110, align: 'center' },
    { field: 'should_count', title: '应盘', width: 80, align: 'right' },
    { field: 'actual_count', title: '实盘', width: 80, align: 'right' },
    { field: 'loss_count', title: '盘亏', width: 80, align: 'right', slots: { default: 'loss' } },
    { field: 'check_state', title: '状态', width: 95, align: 'center', slots: { default: 'state' } },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})
</script>

<script lang="ts">
export default { name: 'AssetCheckList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #loss="{ row }">
            <span :class="Number(row.loss_count) > 0 ? 'text-[#E8635F]' : 'opacity-50'">
              {{ Number(row.loss_count) > 0 ? row.loss_count : '—' }}
            </span>
          </template>
          <template #state="{ row }">
            <n-tag
              v-if="row.check_state"
              :type="row.check_state === '已完成' ? 'success' : 'warning'"
              size="small"
              :bordered="false"
            >
              {{ row.check_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
