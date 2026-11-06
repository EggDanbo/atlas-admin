<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { employee } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/employee/movement',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate } = useRecordActions({
  format: 'atlas/hr/employee/movement',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['employee_no'],
  nameFields: ['employee_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 780,
})

const { tableRef, pageLoading, queryModel, gridOptions } = useListPage<QueryModel>({
  api: { search: employee.movementSearch },
  createQueryModel,
  columns: [
    { field: 'employee_name', title: '员工', width: 100, align: 'center' },
    { field: 'employee_no', title: '工号', width: 100 },
    { field: 'movement_type', title: '异动类型', width: 110, align: 'center', slots: { default: 'type' } },
    { field: 'from_dept', title: '原部门', width: 140 },
    { field: 'to_dept', title: '新部门', width: 140 },
    { field: 'effect_date', title: '生效日期', width: 110, align: 'center' },
    { field: 'reason', title: '异动原因', width: 140 },
    { field: 'operator', title: '经办人', width: 90, align: 'center' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})

function typeTag(type: string) {
  if (type === '入职')
    return 'success'
  if (type === '晋升')
    return 'warning'
  if (type === '离职')
    return 'error'
  return 'info'
}
</script>

<script lang="ts">
export default { name: 'HrEmployeeMovement' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="员工 / 部门 / 原因" clearable />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" @click="openCreate">
              发起异动
            </n-button>
          </template>
          <template #type="{ row }">
            <n-tag v-if="row.movement_type" :type="typeTag(row.movement_type)" size="small" :bordered="false">
              {{ row.movement_type }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
