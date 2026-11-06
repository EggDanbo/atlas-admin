<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { useRecordActions } from '@/hooks/list/useRecordActions'
import { payroll } from '@/service/api/hr'

function createQueryModel() {
  return {
    format: 'atlas/hr/payroll/sheet',
    filter: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const { operateColumn, RecordFormHost } = useRecordActions({
  format: 'atlas/hr/payroll/sheet',
  refresh: () => tableRef.value?.refresh(),
  readonlyFields: [],
  nameFields: ['employee_name'],
  rows: () => tableRef.value?.getData?.() ?? [],
  width: 820,
  mode: 'view',
})

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: payroll.sheetSearch },
  createQueryModel,
  columns: [
    { field: 'pay_month', title: '月份', width: 95, align: 'center' },
    { field: 'employee_name', title: '员工', width: 90, align: 'center' },
    { field: 'dept_name', title: '部门', width: 130 },
    { field: 'gross_amount', title: '应发工资', width: 115, align: 'right' },
    { field: 'social_amount', title: '社保', width: 100, align: 'right' },
    { field: 'fund_amount', title: '公积金', width: 100, align: 'right' },
    { field: 'tax_amount', title: '个税', width: 95, align: 'right' },
    { field: 'net_amount', title: '实发工资', width: 115, align: 'right' },
    { field: 'pay_state', title: '发放状态', width: 100, align: 'center', slots: { default: 'state' } },
    operateColumn,
  ],
  gridOptions: {
    checkboxDisabled: true,
  },
})
</script>

<script lang="ts">
export default { name: 'HrPayrollSheet' }
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
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>
          <template #state="{ row }">
            <n-tag
              v-if="row.pay_state"
              :type="row.pay_state === '已发放' ? 'success' : 'warning'"
              size="small"
              :bordered="false"
            >
              {{ row.pay_state }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RecordFormHost />
  </NaPage>
</template>
