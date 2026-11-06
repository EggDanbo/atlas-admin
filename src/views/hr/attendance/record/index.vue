<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { attendance } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/attendance/record',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate } = useRecordActions({
  format: 'atlas/hr/attendance/record',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['work_hours'],
  nameFields: ['employee_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 720,
})

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: attendance.recordSearch },
  createQueryModel,
  columns: [
    { field: 'work_date', title: '日期', width: 110, align: 'center' },
    { field: 'employee_name', title: '员工', width: 90, align: 'center' },
    { field: 'dept_name', title: '部门', width: 140 },
    { field: 'check_in', title: '上班打卡', width: 100, align: 'center' },
    { field: 'check_out', title: '下班打卡', width: 100, align: 'center' },
    { field: 'work_hours', title: '工时(小时)', width: 100, align: 'right' },
    { field: 'attendance_state', title: '状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateType(state: string) {
  if (state === '正常')
    return 'success'
  if (state === '迟到')
    return 'warning'
  if (state === '请假')
    return 'info'
  return 'error'
}
</script>

<script lang="ts">
export default { name: 'HrAttendanceRecord' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="员工 / 部门 / 日期" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" @click="openCreate">
              补卡登记
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag v-if="row.attendance_state" :type="stateType(row.attendance_state)" size="small" :bordered="false">
              {{ row.attendance_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
