<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import common from '@/service/api/common'
import { entertain as api } from '@/service/api/expense'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const querySchemas = computed(() => ({
  status: [
    { label: '待审批', value: '0' },
    { label: '审批退回', value: '2' },
    { label: '作废', value: '4' },
    { label: '审批中', value: '5' },
    { label: '已审批', value: '6' },
  ],
}))

function createQueryModel() {
  return {
    format: 'atlas/expense/entertain',
    filter: null as string | null,
    date: defDate({ start: -1, ymd: 'm' }),
    status: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  hasPermAdd,
  hasPermDele,
  hasPermExport,
  hasPermPrint,
  editAction,
  handleEdit,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.no,
            ),
          ]
        },
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 200,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  beforeFetch: (options) => {
    const { date, ...newObj } = options
    const params: any = { ...newObj, ...unDate({ dateArr: options.date }) }

    return params
  },
  customHandleEdit: (action, row, extra) => {
    if (!tenantStorage.get()) {
      toast.warning('请先选择组织机构')
      return
    }
    if (action === 'add') {
      detailRef.value?.open()
    }
    else {
      detailRef.value?.open({ id: row?.id, mode: 'apply' })
    }
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id })
  }
}

const moreOptions = reactive([
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd1' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
  else if (key === '批量删除') {
    handleRemove(rows)
  }
}

function handleRemove(rows: Recordable[]) {
  if (rows.length === 0) {
    toast.warning('请选择要删除的行')
    return
  }
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ list: rows.map(m => m.id) })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      tableRef.value?.refresh()
    },
  })
}

async function handleAlert(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await common.alert({
    id: row.id,
    team_id: row.team_id,
  })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
}
</script>

<script lang="ts">
export default { name: 'ExpenseRequestEntertain' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <SpDateRange v-model="queryModel.date" type="date" />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="querySchemas.status"
              placeholder="单据状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="申请单号"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="5">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleEdit('add')">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              新增
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
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove([row])">
                删除
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleAlert(row)">
                催办
              </n-button>
              <n-divider vertical />
              <n-dropdown trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary">
                  更多
                </n-button>
              </n-dropdown>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <detail ref="detailRef" @on-action="editAction" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
  </NaPage>
</template>
