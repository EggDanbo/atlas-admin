<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import printJS from 'print-js'
import { UploadBtn } from '@/components/File/UploadBtn'
import { LogBiz } from '@/components/Logs/Biz'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpCascader } from '@/components/SpCascader'
import { SpDateRange } from '@/components/SpDateRange'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { invoice as api } from '@/service/api/crm'
import { voucher } from '@/service/api/finance'
import { bankAccount, subject } from '@/service/api/masterdata'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import VouchEntryDetail from '@/views/finance/voucher/detail.vue'
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
const vouchModalRef = ref<ModalInst | null>(null)
const vouchEntryDetailRef = ref<OpenModal | null>(null)
const btnLoading = ref<boolean>(false)

const vouchInfo = ref<vouchInfoTypes>({
  no: null,
  date: null,
  content_debit: null,
  content_credit: null,
  account_id: null,
  list: [],
})

interface vouchInfoTypes {
  no: number | null
  date: number | null
  content_debit: string | null
  content_credit: string | null
  account_id: string | null
  list: any[]
}

const contentDebitOptions = ref<Recordable[]>([])
async function loadContentDebitOptions() {
  const year = vouchInfo.value.date ? format(Number(vouchInfo.value.date), 'yyyy') : null
  const { isSuccess, data } = await subject.tree({
    year,
    codes: ['1002', '1122', '2203'],
  })
  if (!isSuccess)
    return
  contentDebitOptions.value = data
}

const contentCreditOptions = ref<Recordable[]>([])
async function loadContentCreditOptions() {
  const year = vouchInfo.value.date ? format(Number(vouchInfo.value.date), 'yyyy') : null
  const { isSuccess, data } = await subject.tree({
    year,
    codes: ['6001', '6051'],
  })
  if (!isSuccess)
    return
  contentCreditOptions.value = data
}

const accountOptions = ref<Recordable[]>([])
async function loadAccountOptions() {
  const { isSuccess, data } = await bankAccount.tree({
    stoped: false,
  })
  if (!isSuccess)
    return
  accountOptions.value = data
}

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

async function vouchPrint(row: Recordable) {
  btnLoading.value = true
  const { isSuccess, data } = await voucher.card(row.vouch_id).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return
  printJS({
    printable: data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

function handleVouchDateSelected() {
  if (vouchInfo.value.date) {
    loadContentDebitOptions()
    loadContentCreditOptions()
  }
}

const accountListShow = ref<boolean>(false)
function handleVouchDebitSelected(_e, options) {
  vouchInfo.value.account_id = null
  if (options.code.includes('1002')) {
    loadAccountOptions()
    accountListShow.value = true
  }
  else {
    accountListShow.value = false
  }
}

function handleVouch() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的数据')
    return
  }

  vouchInfo.value.no = null
  vouchInfo.value.date = Math.max(...rows.map(q => q.date))
  vouchInfo.value.content_debit = null
  vouchInfo.value.content_credit = null
  vouchInfo.value.account_id = null
  vouchInfo.value.list = rows.map(q => q.id)
  handleVouchDateSelected()

  vouchModalRef.value?.open()
}

async function handleCreateVouch() {
  btnLoading.value = true
  const { isSuccess, data } = await api.vouch({ ...vouchInfo.value }).finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return

  vouchModalRef.value?.close()

  vouchEntryDetailRef.value?.open({
    data,
    isvouch: true,
  })
}

function handleAllot(row: Recordable) {
  allotModalRef.value?.open({
    id: row.id,
    amount: row.totals,
  })
}
</script>

<script lang="ts">
export default { name: 'TradeInvoice' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
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
          <!-- <n-gi span="1">
            <n-select
              v-model:value="queryModel.stoped"
              :options="querySchemas.stoped"
              placeholder="是否停用"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi> -->
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
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button
              :disabled="!(queryModel.status && queryModel.status === '未入账')"
              @click="handleVouch"
            >
              入账
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
              <n-button
                text type="primary"
                :disabled="
                  !hasPermDele || Number(row.receive) !== 0 || Number(row.settle_id) !== 0 || Number(row.vouch_id) !== 0
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
              <n-button text type="primary" :disabled="Number(row.vouch_id) === 0" @click="vouchPrint(row)">
                打印
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
    <VouchEntryDetail ref="vouchEntryDetailRef" @on-action="editAction" />
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

    <SpModal
      ref="vouchModalRef"
      title="凭证生成"
      width="650"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <n-form label-placement="left" require-mark-placement="left" :label-width="80">
            <n-grid :cols="24" :x-gap="24">
              <n-form-item-gi :span="10" label="凭证日期">
                <n-date-picker
                  v-model:value="vouchInfo.date"
                  type="date"
                  fast-month-select
                  @update:value="handleVouchDateSelected"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="14" label="凭证号码">
                <n-input-number
                  v-model:value="vouchInfo.no"
                  placeholder="非补断号不要填写"
                  :show-button="false"
                  :precision="0"
                  clearable
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="借方科目">
                <SpCascader
                  v-model:value="vouchInfo.content_debit"
                  :options="contentDebitOptions"
                  placeholder="默认1122 应收账款"
                  value-field="id"
                  @update:value="handleVouchDebitSelected"
                />
              </n-form-item-gi>
              <n-form-item-gi v-if="accountListShow" :span="24" label="银行账户">
                <SpCascader
                  v-model:value="vouchInfo.account_id"
                  :options="accountOptions"
                  placeholder="请选择"
                  value-field="id"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="贷方科目">
                <SpCascader
                  v-model:value="vouchInfo.content_credit"
                  :options="contentCreditOptions"
                  placeholder="默认60010501 主营业务收入-安保服务费-劳务派遣收入"
                  value-field="id"
                />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="vouchModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleCreateVouch">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
