<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import printJS from 'print-js'
import { UploadBtn } from '@/components/BizFile/UploadBtn'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpCascader } from '@/components/SpCascader'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { InvoicePicker } from '@/components/SpTablePicker'
import { useListPage } from '@/hooks/list'
import { receipt as api } from '@/service/api/crm'
import { voucher } from '@/service/api/finance'
import { subject } from '@/service/api/masterdata'
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
const invoiceModalRef = ref<ModalInst | null>(null)

const bankSheet = ref<any>(null)

const vouchModalRef = ref<ModalInst | null>(null)
const vouchEntryDetailRefy = ref<OpenModal | null>(null)

const btnLoading = ref<boolean>(false)

const vouchInfo = ref<vouchInfoTypes>({
  no: null,
  date: null,
  content_debit: null,
  content_credit: null,
  list: [],
})

const invoiceSelectRef = ref<any>(null)
const invoiceSource = ref<string>('0')
const invoiceName = ref<any>(null)
const invoiceInfo = ref<any>({
  id: null,
  invoices: [],
})

/**
 * 统一日期取值：接口/演示数据可能下发时间戳，也可能是 yyyy-MM-dd 字符串，
 * 统一转成毫秒时间戳，避免 Number('2026-11-03') 得到 NaN 后 format() 抛 Invalid time value。
 */
function toTimestamp(value: any): number {
  if (typeof value === 'number')
    return value
  if (!value)
    return 0
  const time = new Date(String(value).replace(/-/g, '/')).getTime()
  return Number.isNaN(time) ? 0 : time
}

const contentDebitOptions = ref<Recordable[]>([])
async function loadContentDebitOptions() {
  const year = toTimestamp(vouchInfo.value.date) ? format(toTimestamp(vouchInfo.value.date), 'yyyy') : null
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
  const year = toTimestamp(vouchInfo.value.date) ? format(toTimestamp(vouchInfo.value.date), 'yyyy') : null
  const { isSuccess, data } = await subject.tree({
    year,
    codes: ['6001', '6051'],
  })
  if (!isSuccess)
    return
  contentCreditOptions.value = data
}

interface vouchInfoTypes {
  no: number | null
  date: number | null
  content_debit: string | null
  content_credit: string | null
  list: string[]
}

const querySchemas = computed(() => ({
  status: [
    {
      value: '未入账',
      label: '未入账',
    },
    {
      value: '已入账',
      label: '已入账',
    },
  ],
}))

function createQueryModel() {
  return {
    format: 'atlas/crm/receipt',
    date: defDate({ start: -1, ymd: 'm' }),
    filter: null,
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
      field: 'date',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('VIEW', row),
              },
              toTimestamp(row.date) ? format(toTimestamp(row.date), 'yyyy-MM-dd') : '',
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
  { label: '回单上传', key: '回单上传', icon: createIcon('ant-design:cloud-upload-outlined'), children: [
    { label: '中国银行', key: '回单上传-中国银行' },
    { label: '工商银行', key: '回单上传-工商银行' },
    { label: '农业银行', key: '回单上传-农业银行' },
    { label: '招商银行', key: '回单上传-招商银行' },
    { label: '兴业银行', key: '回单上传-兴业银行' },
    { label: '华兴银行', key: '回单上传-华兴银行' },
    { label: '宁波银行', key: '回单上传-宁波银行' },
  ] },
  { label: '批量导入', key: '批量导入', icon: createIcon('ant-design:cloud-upload-outlined'), children: [
    { label: '中国银行', key: '批量导入-中国银行' },
    { label: '工商银行', key: '批量导入-工商银行' },
    { label: '农业银行', key: '批量导入-农业银行' },
    { label: '招商银行', key: '批量导入-招商银行' },
    { label: '兴业银行', key: '批量导入-兴业银行' },
    { label: '华兴银行', key: '批量导入-华兴银行' },
    { label: '宁波银行', key: '批量导入-宁波银行' },
  ] },
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
  else if (key.includes('回单上传')) {
    bankSheet.value = key.split('-')[1]
    uploadModalRef.value?.open()
  }
  else if (key.includes('批量导入')) {
    bankSheet.value = key.split('-')[1]
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
    bank: bankSheet.value,
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

async function uploadPDF(file: any, uploading: Ref) {
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

function handleVouch() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的数据')
    return
  }

  vouchInfo.value.no = null
  vouchInfo.value.date = Math.max(...rows.map(q => toTimestamp(q.date)))
  vouchInfo.value.content_debit = null
  vouchInfo.value.content_credit = null
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

  vouchEntryDetailRefy.value?.open({
    data,
    isvouch: true,
  })
}

async function invoiceModalShow(row: Recordable) {
  invoiceSource.value = row.credit ? '1' : row.debit && '0'
  invoiceName.value = row.outer_name
  invoiceInfo.value.id = row.id
  invoiceInfo.value.invoices = null
  invoiceModalRef.value?.open()

  setTimeout(() => {
    if (invoiceSelectRef.value) {
      invoiceSelectRef.value.refresh()
    }
  })
}

async function handleAllot() {
  allotModalRef.value?.open({ id: invoiceInfo.value.id, list: invoiceInfo.value.invoices })

  invoiceModalRef.value?.close()
  await invoiceSelectRef.value.refresh()
}

async function handleCancel(row: Recordable) {
  toast.infoModal('确定取消发票关联吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await api.cancel({ id: row.id }).finally(() => (btnLoading.value = false))
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value.refresh()
      }
    },
  })
}
</script>

<script lang="ts">
export default { name: 'CrmReceipt' }
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
              placeholder="流水状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="转账人或客户名称"
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
            <!-- <n-button
              :disabled="!(queryModel.status && queryModel.status === '未入账')"
              @click="handleVouch"
            >
              入账
            </n-button> -->
            <n-button @click="handleVouch">
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
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove([row])">
                删除
              </n-button>
              <n-divider vertical />
              <n-button v-if="!row.team_list" text type="primary" @click="invoiceModalShow(row)">
                分摊
              </n-button>
              <n-button v-else text type="primary" @click="handleCancel(row)">
                取消
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
      title="银行流水批量导入"
      :template-download-url="`/template/银行流水导入模板-${bankSheet}.xlsx`"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />
    <VouchEntryDetail ref="vouchEntryDetailRefy" @on-action="editAction" />
    <allot ref="allotModalRef" @on-action="editAction" />

    <SpModal
      ref="uploadModalRef"
      title="上传银行回单"
      width="500"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div style="font-size: 16px; text-align: center; padding: 15px 0;">
          流水导入后，请下载对应银行的回单PDF附件上传。
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <UploadBtn
            type="primary"
            :max-size="500"
            :accept="['application/pdf']"
            @upload-change="uploadPDF"
          >
            <template #icon>
              <Icon icon="ant-design:cloud-upload-outlined" />
            </template>
            上传PDF
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
                  placeholder="默认 100201 银行存款-示例分行"
                  value-field="id"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="贷方科目">
                <SpCascader
                  v-model:value="vouchInfo.content_credit"
                  :options="contentCreditOptions"
                  placeholder="默认1122 应收账款"
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

    <SpModal
      ref="invoiceModalRef"
      title="关联发票"
      width="650"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <InvoicePicker
            ref="invoiceSelectRef"
            v-model:value="invoiceInfo.invoices"
            :source="invoiceSource"
            :name="invoiceName"
            status="未结算"
            multiple
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="invoiceModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleAllot">
            分摊
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
