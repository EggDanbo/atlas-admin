<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { employee } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/employee/roster',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: employee.rosterSearch },
  createQueryModel,
  columns: [
    { field: 'employee_no', title: '工号', width: 100 },
    { field: 'employee_name', title: '姓名', width: 90, align: 'center' },
    { field: 'dept_name', title: '部门', width: 130 },
    { field: 'position_name', title: '岗位', width: 120 },
    { field: 'job_grade', title: '职级', width: 80, align: 'center' },
    { field: 'staff_state', title: '状态', width: 90, align: 'center', slots: { default: 'state' } },
    { field: 'entry_date', title: '入职日期', width: 110, align: 'center' },
    { field: 'education', title: '学历', width: 100, align: 'center' },
    { field: 'age', title: '年龄', width: 70, align: 'right' },
    { field: 'base_salary', title: '基本工资', width: 115, align: 'right' },
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function stateType(state: string) {
  if (state === '在职')
    return 'success'
  if (state === '试用')
    return 'warning'
  return 'default'
}
</script>

<script lang="ts">
export default { name: 'HrEmployeeRoster' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="工号 / 姓名 / 部门 / 岗位" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #state="{ row }">
            <n-tag v-if="row.staff_state" :type="stateType(row.staff_state)" size="small" :bordered="false">
              {{ row.staff_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
