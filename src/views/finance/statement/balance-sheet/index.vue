<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { useListPage } from '@/hooks/list'
import { balanceSheet as api } from '@/service/api/finance/statement'
import { subject as contentApi } from '@/service/api/masterdata'
import fmtMoney from '@/utils/fmtMoney'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import kmyeb from '@/views/finance/subject-balance/table.vue'
import adjust from './adjust.vue'

const kmyebRef = ref<OpenModal | null>(null)
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
    format: 'atlas/finance/statement/balance-sheet',
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
    if (Number(row.id) === 0) {
      if (row.lfore !== row.rfore && (column.field === 'lfore' || column.field === 'rfore')) {
        return 'cell-error-200'
      }
      if (row.lyear !== row.ryear && (column.field === 'lyear' || column.field === 'ryear')) {
        return 'cell-error-200'
      }
    }
    return null
  },
  columns: [
    {
      field: 'lyear',
      slots: {
        default: ({ row }) => {
          if (row.lyear && row.lyear_code) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery(row.lyear_code),
                },
                fmtMoney(row.lyear, 2, false, '.', ','),
              ),
            ]
          }
          else if (row.lyear) {
            return fmtMoney(row.lyear, 2, false, '.', ',')
          }
          else {
            return '-'
          }
        },
      },
    },
    {
      field: 'ryear',
      slots: {
        default: ({ row }) => {
          if (row.ryear && row.ryear_code) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery(row.ryear_code),
                },
                fmtMoney(row.ryear, 2, false, '.', ','),
              ),
            ]
          }
          else if (row.ryear) {
            return fmtMoney(row.ryear, 2, false, '.', ',')
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

function handleQuery(code: string) {
  const year = Number(format(Number(queryModel.date), 'yyyy'))
  const month = Number(format(Number(queryModel.date), 'MM'))

  kmyebRef.value?.open({
    codes: code,
    year,
    month_begin: month,
    month_end: month,
  })
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
export default { name: 'VouchFinanceZcfzb' }
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
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="default" @click="handleAdjust">
              年内到期调整数
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

    <adjust ref="adjustRef" @on-action="editAction" />
    <kmyeb ref="kmyebRef" />
    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
