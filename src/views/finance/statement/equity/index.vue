<script setup lang="ts">
import { format } from 'date-fns'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { useListPage } from '@/hooks/list'
import { equity as api } from '@/service/api/finance/statement'
import { subject as contentApi } from '@/service/api/masterdata'
import { createIcon } from '@/utils/iconify'

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (isSuccess) {
    queryModel.date = Number(data)
  }
}

onMounted(() => getLastDate())

function createQueryModel() {
  return {
    format: 'atlas/finance/statement/equity',
    types: 'month' as any,
    date: null as any,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  hasPermExport,
  hasPermPrint,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef: undefined,
  idField: 'id',
  createQueryModel,
  rowClassName: ({ row }) => {
    if (row.id === '0') {
      return 'font-bold'
    }
    return null
  },
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
    immediate: false,
  },
  beforeFetch: (options) => {
    const year = options.date ? Number(format(Number(options.date), 'yyyy')) : null

    let month: number | null = null
    if (options.types === 'quarter') {
      month = options.date ? Number(format(Number(options.date), 'MM')) + 12 : null
    }
    else if (options.types === 'month') {
      month = options.date ? Number(format(Number(options.date), 'MM')) : null
    }
    const params: any = { ...options, year, month }
    return params
  },
})

const moreOptions = reactive([
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
}

function handleTypesChange() {
  // 日期模式切换时重置显示值
  queryModel.date += 1
}
</script>

<script lang="ts">
export default { name: 'VouchFinanceQybdb' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-radio-group
              v-model:value="queryModel.types"
              @update:value="handleTypesChange"
            >
              <n-radio-button label="月份" value="month" />
              <n-radio-button label="季度" value="quarter" />
              <n-radio-button label="年度" value="year" />
            </n-radio-group>
          </n-gi>
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.date"
              placeholder="会计期间"
              :type="queryModel.types"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-dropdown trigger="hover" :options="moreOptions" @select="handleMore">
              <n-button type="default" icon-placement="right">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:down-outlined" />
                  </n-icon>
                </template>
                更多操作
              </n-button>
            </n-dropdown>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
