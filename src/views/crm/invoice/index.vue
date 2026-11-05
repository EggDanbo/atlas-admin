<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { UploadBtn } from '@/components/BizFile/UploadBtn'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { invoice as api } from '@/service/api/crm'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import allot from './allot.vue'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const allotModalRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const batchImportDownloadRef = ref<InstanceType<typeof BatchImportDownloadModal> | null>(null)
const batchImportRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const uploadModalRef = ref<ModalInst | null>(null)

const allotRef = ref<OpenModal | null>(null)
const btnLoading = ref<boolean>(false)

const querySchemas = computed(() => ({
  status: [
    {
      value: '未分摊',
      label: '未分摊',
    },
    {
      value: '已分摊',
      label: '已分摊',
    },
    {
      value: '未结清',
      label: '未结清',
    },
    {
      value: '已结清',
      label: '已结清',
    },
    {
      value: '未入账',
      label: '未入账',
    },
    {
      value: '已入账',
      label: '已入账',
    },
  ],
  stoped: [
    {
      label: '未停用',
      value: '0',
    },
    {
      label: '已停用',
      value: '1',
    },
  ],
}))

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/crm/invoice',
    date: defDate({ start: -1, ymd: 'm' }),
    filter: null,
    source: '0',
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
  tabPermName,
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
      width: 240,
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
    else if (action === 'ALLOT') {
      allotRef.value?.open({
        id: row?.id,
        amount: row?.totals,
      })
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
    logBizRef.value?.open({ xid: row.id })
  }
  else if (key === '批量导入删除') {
    handleRemove([row], true)
  }
  else if (key === '下载导入文件') {
    batchImportDownloadRef.value?.open(row.id)
  }
}

const moreOptions = reactive([
  { label: '发票上传', key: '发票上传', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '批量导入', key: '批量导入', icon: createIcon('ant-design:cloud-upload-outlined') },
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
  else if (key === '发票上传') {
    uploadModalRef.value?.open()
  }
  else if (key === '批量导入') {
    batchImportRef.value?.open()
  }
  else if (key === '批量删除') {
    handleRemove(rows)
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

async function uploadZIP(file: any, uploading: Ref) {
  btnLoading.value = true
  const { isSuccess } = await api.batchUpload({
    value: file.id,
  }).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return

  uploadModalRef.value?.close()
}

function handleAllot(row: Recordable) {
  allotModalRef.value?.open({
    id: row.id,
    amount: row.totals,
  })
}
</script>

<script lang="ts">
export default { name: 'CrmInvoice' }
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
              placeholder="发票状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="发票号码"
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
              <n-button
                text type="primary"
                :disabled="
                  !hasPermDele || Number(row.receive) !== 0 || Number(row.settle_id) !== 0
                "
                @click="handleRemove([row])"
              >
                删除
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleAllot(row)">
                分摊
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
      title="全量发票批量导入"
      template-download-url="/template/全量发票导入模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />
    <allot ref="allotModalRef" @on-action="editAction" />

    <SpModal
      ref="uploadModalRef"
      title="上传发票压缩包"
      width="500"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div style="font-size: 16px; text-align: center; padding: 15px 0;">
          发票导入后，请下载对应的发票附件压缩包上传。
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <UploadBtn
            type="primary"
            :max-size="500"
            :accept="['application/zip', 'application/x-zip-compressed']"
            @upload-change="uploadZIP"
          >
            <template #icon>
              <Icon icon="ant-design:cloud-upload-outlined" />
            </template>
            上传压缩包
          </UploadBtn>
          <n-button @click="uploadModalRef?.close">
            关闭
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
