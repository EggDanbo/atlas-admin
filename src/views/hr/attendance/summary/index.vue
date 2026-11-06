<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { attendance } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/attendance/summary',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost } = useRecordActions({
  format: 'atlas/hr/attendance/summary',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['employee_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 760,
  mode: 'view',
})

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: attendance.summarySearch },
  createQueryModel,
  columns: [
    { field: 'employee_name', title: '员工', width: 100, align: 'center' },
    { field: 'dept_name', title: '部门', width: 140 },
    { field: 'should_days', title: '应出勤(天)', width: 110, align: 'right' },
    { field: 'actual_days', title: '实出勤(天)', width: 110, align: 'right' },
    { field: 'late_count', title: '迟到(次)', width: 95, align: 'right' },
    { field: 'leave_days', title: '请假(天)', width: 95, align: 'right' },
    { field: 'overtime_hours', title: '加班(小时)', width: 105, align: 'right' },
    { field: 'exception_count', title: '异常(次)', width: 95, align: 'right', slots: { default: 'exception' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'HrAttendanceSummary' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="员工 / 部门" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #exception="{ row }">
            <span :class="Number(row.exception_count) > 0 ? 'text-[#E8635F]' : 'opacity-50'">
              {{ Number(row.exception_count) > 0 ? row.exception_count : '—' }}
            </span>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
