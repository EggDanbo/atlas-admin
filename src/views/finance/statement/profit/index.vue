<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { PdfSetting } from '@/components/BizPrint'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { profit as api } from '@/service/api/finance/statement'
import { subject as contentApi } from '@/service/api/masterdata'
import { resolvePeriodTimestamp } from '@/utils/dateUtil'
import fmtMoney from '@/utils/fmtMoney'
import { createIcon } from '@/utils/iconify'
import kmyeb from '@/views/finance/subject-balance/table.vue'

const kmyebRef = ref<OpenModal | null>(null)

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  // 接口返回的是年份，选择器要时间戳，直接赋值会渲染成 1970
  if (isSuccess)
    queryModel.date = resolvePeriodTimestamp(data, 'month') ?? Date.now()
}

onMounted(() => getLastDate())

function createQueryModel() {
  return {
    format: 'atlas/finance/statement/profit',
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
  cellClassName: ({ row, column }) => {
    if (Number(row.value) !== 0 && row.year !== row.value && column.field === 'year') {
      return 'cell-error-200'
    }
    return null
  },
  columns: [
    {
      field: 'term',
      slots: {
        default: ({ row }) => {
          if (row.term && row.term_code) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery('term', row),
                },
                fmtMoney(row.term, 2, false, '.', ','),
              ),
            ]
          }
          else if (row.term) {
            return fmtMoney(row.term, 2, false, '.', ',')
          }
          else {
            return '-'
          }
        },
      },
    },
    {
      field: 'year',
      slots: {
        default: ({ row }) => {
          if (row.year && row.year_code) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery('year', row),
                },
                fmtMoney(row.year, 2, false, '.', ','),
              ),
            ]
          }
          else if (row.year) {
            return fmtMoney(row.year, 2, false, '.', ',')
          }
          else {
            return '-'
          }
        },
      },
    },
  ],
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

    queryModel.year = year
    queryModel.month = month

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

function handleQuery(key: string, row: Recordable) {
  let year = Number(format(Number(queryModel.date), 'yyyy'))

  let month_begin = 1
  let month_end = 12

  if (queryModel.types === 'month') {
    month_begin = Number(format(Number(queryModel.date), 'MM'))
    month_end = month_begin
  }
  else if (queryModel.types === 'quarter') {
    const quarter = Number(format(Number(queryModel.date), 'MM'))
    if (quarter === 1) {
      month_begin = 1
      month_end = 3
    }
    else if (quarter === 4) {
      month_begin = 4
      month_end = 6
    }
    else if (quarter === 7) {
      month_begin = 7
      month_end = 9
    }
    else if (quarter === 10) {
      month_begin = 10
      month_end = 12
    }
  }

  let code
  if (key === 'term') {
    code = row.term_code
  }
  else if (key === 'year') {
    code = row.year_code
    month_begin = 1
  }
  else if (key === 'fore') {
    code = row.fore_code
    month_begin = 1
    year = year - 1
  }

  kmyebRef.value?.open({
    codes: code,
    year,
    month_begin,
    month_end,
  })
}
</script>

<script lang="ts">
export default { name: 'FinanceStatementProfit' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
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
        </SpQueryGrid>
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

    <kmyeb ref="kmyebRef" />
    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
