<script setup lang="ts">
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { org } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/org/team',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost, openCreate, canAdd } = useRecordActions({
  format: 'atlas/hr/org/team',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: ['on_job', 'vacancy', 'avg_tenure'],
  nameFields: ['dept_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 720,
})

const { tableRef, pageLoading, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: org.teamSearch },
  createQueryModel,
  columns: [
    { field: 'dept_name', title: '部门', width: 160 },
    { field: 'manager', title: '负责人', width: 110, align: 'center' },
    { field: 'headcount', title: '编制人数', width: 100, align: 'right' },
    { field: 'on_job', title: '在职人数', width: 100, align: 'right' },
    { field: 'vacancy', title: '空缺', width: 90, align: 'right', slots: { default: 'vacancy' } },
    { field: 'avg_tenure', title: '平均司龄(年)', width: 120, align: 'right' },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
  },
})
</script>

<script lang="ts">
export default { name: 'HrOrgTeam' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增部门
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #vacancy="{ row }">
            <n-tag
              v-if="Number(row.vacancy) > 0"
              type="warning"
              size="small"
              :bordered="false"
            >
              缺 {{ row.vacancy }}
            </n-tag>
            <n-tag v-else type="success" size="small" :bordered="false">
              满编
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
