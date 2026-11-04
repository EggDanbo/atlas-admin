<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { SpCascader } from '@/components/SpCascader'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { dictOptions } from '@/dicts'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import common from '@/service/api/common'
import { reimburse as api } from '@/service/api/expense'
import { subject } from '@/service/api/masterdata'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import BorrowDetail from '@/views/expense/advance/detail.vue'
import AnsureDetail from '@/views/expense/deposit/detail.vue'
import ApplyDetail from '@/views/expense/payment/detail.vue'
import PayerDetail from '@/views/expense/tax/detail.vue'
import VouchDetail from '@/views/finance/voucher/detail.vue'

const logBizRef = ref<OpenModal | null>(null)
const ansureDetailRef = ref<OpenModal | null>(null)
const applyDetailRef = ref<OpenModal | null>(null)
const borrowDetailRef = ref<OpenModal | null>(null)
const payerDetailRef = ref<OpenModal | null>(null)
const vouchModalRef = ref<ModalInst | null>(null)
const vouchDetailRef = ref<OpenModal | null>(null)

const btnLoading = ref<boolean>(false)

const querySchemas = computed(() => ({
  status: [
    {
      value: 7,
      label: '待支付',
    },
    {
      value: 8,
      label: '待入账',
    },
    {
      value: 9,
      label: '已入账',
    },
  ],
  printed: [
    {
      value: '是',
      label: '是',
    },
    {
      value: '否',
      label: '否',
    },
  ],
}))

const contentOptions = ref<Recordable[]>([])

const vouchInfo = ref({
  no: null as number | null,
  date: null as number | null,
  content_debit: null as string | null,
  content_credit: null as string | null,
  account_id: null as string | null,
  list: [] as any,
})

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    alone: true,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/expense/reimburse',
    filter: null as string | null,
    date: defDate({ start: -3, ymd: 'm' }),
    team_id: null as string | null,
    user_id: null,
    status: null,
    printed: null,
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
  hasPermExport,
  hasPermPrint,
  handleEdit,
  handleExportOrPrint,
  editAction,
} = useListPage<QueryModel>({
  api,
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

    if (action === 'view' && row) {
      if (Number(row.types) === 6) {
        applyDetailRef.value?.open({ id: row.id, opt: 'VIEW', mode: 'settle' })
      }
      else if (Number(row.types) === 7) {
        borrowDetailRef.value?.open({ id: row.id, opt: 'VIEW', mode: 'settle' })
      }
      else if (Number(row.types) === 8) {
        ansureDetailRef.value?.open({ id: row.id, opt: 'VIEW', mode: 'settle' })
      }
      else if (Number(row.types) === 9) {
        payerDetailRef.value?.open({ id: row.id, opt: 'VIEW', mode: 'settle' })
      }
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
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
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

async function settle() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的数据')
    return
  }

  toast.infoModal('确定支付吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api
        .confirm({
          list: rows.map(q => q.id),
        })
        .finally(() => (pageLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      await tableRef.value.refresh()
    },
  })
}

async function cancel() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的数据')
    return
  }

  pageLoading.value = true
  const { isSuccess } = await api
    .cancel({
      list: rows.map(q => q.id),
    })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

function handleVouch() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的数据')
    return
  }

  vouchInfo.value.no = null
  vouchInfo.value.content_debit = null
  vouchInfo.value.content_credit = null
  vouchInfo.value.account_id = null
  vouchInfo.value.list = rows.map(q => q.id)
  loadContentOptions()

  vouchModalRef.value?.open()
}

async function createVouch() {
  btnLoading.value = true
  const { isSuccess, data } = await api.vouch({ ...vouchInfo.value }).finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return

  vouchModalRef.value?.close()

  vouchDetailRef.value?.open({
    data,
    isvouch: true,
  })
}

async function loadContentOptions() {
  const year = vouchInfo.value.date ? format(Number(vouchInfo.value.date), 'yyyy') : null
  const { isSuccess, data } = await subject.tree({
    year,
    codes: ['1002'],
  })
  if (isSuccess)
    contentOptions.value = data
}
</script>

<script lang="ts">
export default { name: 'ExpenseClaimReimburse' }
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
              v-model:value="queryModel.types"
              :options="dictOptions('pense_bill_types')"
              placeholder="单据类型"
              max-tag-count="responsive"
              multiple
              clearable
              @update:value="tableRef.clear()"
            />
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
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="单号或申请人"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="5">
            <SpTree
              v-model:value="queryModel.team_id"
              :options="teamTreeOptions"
              placeholder="所属单位"
              value-field="id"
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
            <n-button-group>
              <n-button
                :disabled="!(queryModel.status && Number(queryModel.status) === 7)"
                @click="settle"
              >
                支付
              </n-button>
              <n-button
                :disabled="!(queryModel.status && Number(queryModel.status) === 8)"
                @click="cancel"
              >
                取消支付
              </n-button>
              <n-button
                :disabled="!(queryModel.status && Number(queryModel.status) === 8)"
                @click="handleVouch"
              >
                入账
              </n-button>
            </n-button-group>
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

    <AnsureDetail ref="ansureDetailRef" @on-action="editAction" />
    <ApplyDetail ref="applyDetailRef" @on-action="editAction" />
    <BorrowDetail ref="borrowDetailRef" @on-action="editAction" />
    <PayerDetail ref="payerDetailRef" @on-action="editAction" />
    <VouchDetail ref="vouchDetailRef" @on-action="editAction" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />

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
                  @update:value="loadContentOptions"
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
              <n-form-item-gi :span="24" label="银行科目">
                <SpCascader
                  v-model:value="vouchInfo.content_credit"
                  :options="contentOptions"
                  placeholder="默认100206 银行存款-建行白云支行（3811活期）"
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
          <n-button type="primary" :loading="btnLoading" @click="createVouch">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
