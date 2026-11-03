<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { AuxDimensionPicker } from '@/components/SpTablePicker'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { opening as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { getMonthFirstAndLastDayTimestamp } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const batchImportDownloadRef = ref<InstanceType<typeof BatchImportDownloadModal> | null>(null)
const batchImportRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await contentApi.tree({
    stoped: true,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (isSuccess) {
    queryModel.year = Number(data)
  }
}

onMounted(() => {
  getLastDate()
  loadContentOptions()
})

function createQueryModel() {
  return {
    format: 'atlas/finance/opening',
    date: getMonthFirstAndLastDayTimestamp() as any,
    content_id: null as string[] | null,
    assist_id: null as string[] | null,
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
      field: 'content_code',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.content_code,
            ),
          ]
        },
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 150,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    immediate: false,
  },
  beforeFetch: (options) => {
    const year = options.year ? format(Number(options.year), 'yyyy') : null
    const params: any = { ...options, year }
    return params
  },
  customHandleEdit: (action, row, extra) => {
    if (!tenantStorage.get()) {
      toast.warning('请先选择组织机构')
      return
    }

    if (action === 'add') {
      if (!queryModel.year) {
        toast.info('请选择会计年度')
        return
      }

      const year = format(queryModel.year, 'yyyy')
      detailRef.value?.open({ year })
    }
    else {
      detailRef.value?.open({ id: row?.id })
    }
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
  { type: 'divider', key: 'd1' },
  { label: '批量导入删除', key: '批量导入删除' },
  { label: '下载导入文件', key: '下载导入文件' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id, name: 'vouch_entry' })
  }
  else if (key === '批量导入删除') {
    handleRemove([row], true)
  }
  else if (key === '下载导入文件') {
    batchImportDownloadRef.value?.open(row.id)
  }
}

const moreOptions = reactive([
  { label: '批量导入', key: '批量导入', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd2' },
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
  else if (key === '批量导入') {
    batchImportRef.value?.open()
  }
}

function handleRemove(rows: Recordable[], batch: boolean = false) {
  if (rows.length === 0) {
    toast.warning('请选择要删除的行')
    return
  }
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ list: rows.map(m => m.id), batch })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      tableRef.value?.refresh()
    },
  })
}

async function handleImportSuccess(fileId: string) {
  const { isSuccess, data } = await api.batchImport({
    value: fileId,
    year: format(queryModel.year, 'yyyy'),
  })

  batchImportRef.value?.close()
  if (isSuccess) {
    if (data) {
      checkFileUrl.value = data.url
      checkFileMessage.value = data.message

      batchImportRef.value?.check()
    }
    else {
      toast.success('导入成功')
    }
    tableRef.value?.refresh()
  }
  else {
    toast.error(data.message)
  }
}
</script>

<script lang="ts">
export default { name: 'FinanceOpening' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.year"
              placeholder="会计年度"
              type="year"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
          <n-gi span="4">
            <SpTree
              v-model:value="queryModel.content_id"
              :options="contentTreeOptions"
              placeholder="会计科目"
              value-field="id"
            />
          </n-gi>
          <n-gi span="5">
            <AuxDimensionPicker
              v-model:value="queryModel.assist_id"
              placeholder="核算维度"
              :team_id="tenantStorage.get()"
              :multiple="true"
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
              <n-dropdown trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary" icon-placement="right">
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
    <BatchImportDownloadModal ref="batchImportDownloadRef" />
    <SpBatchImportModal
      ref="batchImportRef"
      title="期初余额批量导入"
      template-download-url="/template/期初余额导入模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />
  </NaPage>
</template>
