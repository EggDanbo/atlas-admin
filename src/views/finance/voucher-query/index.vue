<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { AuxDimensionPicker } from '@/components/SpTablePicker'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { voucherQuery as api, voucher as entryApi } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { useUserStore } from '@/store/modules/user'
import { getMonthFirstAndLastDayTimestamp } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from '@/views/finance/voucher/detail.vue'
import print from '@/views/finance/voucher/print.vue'

const userStore = useUserStore()

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)
const printModalRef = ref<any>(null)

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

onMounted(() => loadContentOptions())

function createQueryModel() {
  return {
    format: 'atlas/finance/voucher-query',
    filter: null as string | null,
    date: getMonthFirstAndLastDayTimestamp() as any,
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
      width: 150,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  customHandleEdit: (action, row, extra) => {
    if (row?.id) {
      detailRef.value?.open({ id: row?.bill_id, mode: 'input' })
    }
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
  { type: 'divider', key: 'd1' },
  { label: '批量导入删除', key: '批量导入删除' },
  { label: '下载导入文件', key: '下载导入文件' },
  { type: 'divider', key: 'd1' },
  { label: '调整金额方向', key: '调整金额方向' },
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
  else if (key === '调整金额方向') {
    toast.infoModal('确定调整金额借贷方向吗？', {
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        pageLoading.value = true
        const { isSuccess } = await api.direction({ id: row.id })
          .finally(() => pageLoading.value = false)
        if (!isSuccess)
          return
        toast.success('操作成功')
        tableRef.value?.refresh()
      },
    })
  }
}

const moreOptions = reactive([
  { label: '批量导入', key: '批量导入', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd1' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

if (userStore.isAdmin) {
  moreOptions.push({ type: 'divider', key: 'd2' })
  moreOptions.push({ label: '数据调整', key: '数据调整', icon: createIcon('ant-design:cloud-upload-outlined') })
}

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
  else if (key === '数据调整') {
    pageLoading.value = true
    const { isSuccess } = await api.allot()
      .finally(() => pageLoading.value = false)
    if (!isSuccess)
      return
    toast.success('操作成功')
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
      const { isSuccess } = await entryApi.delete({ list: rows.map(m => m.bill_id), batch })
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
export default { name: 'FinanceVoucherList' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <SpDateRange
              v-model="queryModel.date"
              type="date"
              :min="new Date(2008, 0, 1).getTime()"
              :max="new Date(new Date().getFullYear() + 1, 11, 31).getTime()"
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="摘要或制单"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="2">
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
            <n-button type="default" @click="printModalRef?.open">
              凭证打印
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
              <n-button text type="primary" @click="handleRemove([row])">
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
    <print ref="printModalRef" @on-action="editAction" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
    <BatchImportDownloadModal ref="batchImportDownloadRef" />
    <SpBatchImportModal
      ref="batchImportRef"
      title="凭证分录批量导入"
      template-download-url="/template/凭证分录导入模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />
  </NaPage>
</template>
