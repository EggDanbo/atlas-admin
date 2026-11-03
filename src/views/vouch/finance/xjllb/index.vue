<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { useListPage } from '@/hooks/list'
import { content as contentApi } from '@/service/api/basic'
import { xjllb as api } from '@/service/api/vouch/finance'
import fmtMoney from '@/utils/fmtMoney'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import cashflow from '@/views/vouch/cashflow/table.vue'
import kmyeb from '@/views/vouch/report/kmyeb/table.vue'
import adjust from './adjust.vue'

const kmyebRef = ref<OpenModal | null>(null)
const cashflowRef = ref<OpenModal | null>(null)
const adjustRef = ref<OpenModal | null>(null)

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (isSuccess) {
    queryModel.date = Number(data)
  }
}

onMounted(() => getLastDate())

function createQueryModel() {
  return {
    format: 'atlas/vouch/finance/xjllb',
    date: null as any,
    source: false,
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
    if (Number(row.id) === 0) {
      return 'font-bold'
    }
    return null
  },
  cellClassName: ({ row, column }) => {
    if (Number(row.id) === 0 && row.year !== row.value && column.field === 'year') {
      return 'cell-error-200'
    }
    return 'null'
  },
  columns: [
    {
      field: 'year',
      slots: {
        default: ({ row }) => {
          if (row.year && row.code) {
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
    {
      field: 'moon',
      slots: {
        default: ({ row }) => {
          if (row.moon && row.code) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery('moon', row),
                },
                fmtMoney(row.moon, 2, false, '.', ','),
              ),
            ]
          }
          else if (row.moon) {
            return fmtMoney(row.moon, 2, false, '.', ',')
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

function handleQuery(opt: string, row: Recordable) {
  const year = Number(format(Number(queryModel.date), 'yyyy'))
  const month = Number(format(Number(queryModel.date), 'MM'))

  if (row.code.includes(',')) {
    if (opt === 'year') {
      kmyebRef.value?.open({
        codes: row.code,
        year,
        month_begin: 1,
        month_end: month,
      })
    }
    else if (opt === 'moon') {
      kmyebRef.value?.open({
        codes: row.code,
        year,
        month_begin: month,
        month_end: month,
      })
    }
  }
  else {
    if (opt === 'year') {
      cashflowRef.value?.open({
        cashflow_code: row.code,
        year,
        month_begin: 1,
        month_end: month,
      })
    }
    else if (opt === 'moon') {
      cashflowRef.value?.open({
        cashflow_code: row.code,
        year,
        month_begin: month,
        month_end: month,
      })
    }
  }
}

function editAction() {
  tableRef.value.refresh()
}

function handleAdjust() {
  if (!tenantStorage.get()) {
    toast.warning('请先选择组织机构')
    return
  }

  adjustRef.value?.open({
    date: queryModel.date,
  })
}
</script>

<script lang="ts">
export default { name: 'VouchFinanceXjllb' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.date"
              placeholder="会计期间"
              type="month"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
          <n-gi span="1" style="display: flex; align-items: center;">
            <n-switch v-model:value="queryModel.source" size="large" :round="false">
              <template #checked>
                按金蝶导入取数
              </template>
              <template #unchecked>
                按系统匹配取数
              </template>
            </n-switch>
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="default" @click="handleAdjust">
              现金流项目调整数
            </n-button>
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
    <cashflow ref="cashflowRef" />
    <PdfSetting ref="pdfSettingRef" />
    <adjust ref="adjustRef" @on-action="editAction" />
  </NaPage>
</template>
