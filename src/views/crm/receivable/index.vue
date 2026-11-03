<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/Logs/Biz'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpCascader } from '@/components/SpCascader'
import { SpTree } from '@/components/SpTree'
import { OuterSelect } from '@/components/TableSelect/index.ts'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { receivable as api } from '@/service/api/crm'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const contractModalRef = ref<ModalInst | null>(null)
const exportModalRef = ref<ModalInst | null>(null)
const reasonModalRef = ref<ModalInst | null>(null)

const btnLoading = ref(false)
const statusOptions = ref<Recordable[]>([
  {
    value: '未开票',
    label: '未开票',
  },
  {
    value: '未回款',
    label: '未回款',
  },
  {
    value: '已回款',
    label: '已回款',
  },
  {
    value: '延迟回款',
    label: '延迟回款',
  },
  {
    value: '无法回款',
    label: '无法回款',
  },
])

const contractInfoId = ref<string | null>(null)
const exportInfo = ref({
  month: null as number | null,
  team_id: null as string | null,
})
const reasonInfo = ref({
  id: null as string | null,
  reason: null as string | null,
  unback: false as boolean,
})

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

const contractOptions = ref<Recordable[]>([])
async function loadContractOptions() {
  const { isSuccess, data } = await api.getList()
  if (!isSuccess)
    return
  contractOptions.value = data
}

onMounted(() => {
  loadTeamTree()
})

function createQueryModel() {
  return {
    format: 'atlas/crm/receivable',
    team_id: new Array<string>(),
    outer_id: new Array<string>(),
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
  tabPermName,
  hasPermAdd,
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
  rowClassName: ({ row }) => {
    if (Number(row.back) !== 0) {
      return 'row-success'
    }
    else {
      return row.unback ? 'row-error' : (row.reason !== '' ? 'row-warning' : null)
    }
  },
  columns: [
    {
      field: 'project_no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.project_no,
            ),
          ]
        },
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 180,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  customHandleEdit: (action, row, extra) => {
    if (!tenantStorage.get()) {
      toast.warning('请先选择组织机构')
      return
    }

    if (action === 'add') {
      detailRef.value?.open()
    }
    else if (action === 'alter' || action === 'renew') {
      // 补充或续签
      detailRef.value?.open({ id: row?.project_id, opt: 'EDIT', action })
    }
    else {
      detailRef.value?.open({ id: row?.project_id, opt: 'VIEW' })
    }
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id, name: 'trade_promise' })
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

async function contractModalShow() {
  await loadContractOptions()

  contractInfoId.value = null
  contractModalRef.value?.open()
}

async function handleContractCreate() {
  if (!contractInfoId.value) {
    toast.info('请选择应收款项目')
    return
  }
  detailRef.value?.open({
    id: contractInfoId.value,
    opt: 'edit',
  })
  contractModalRef.value?.close()
}

function exportModalShow() {
  exportInfo.value.month = null
  exportInfo.value.team_id = null
  exportModalRef.value?.open()
}

async function handleExportSheet() {
  if (!exportInfo.value.month) {
    toast.error('请选择开票月份')
    return
  }
  if (!exportInfo.value.team_id) {
    toast.error('请选择单位部门')
    return
  }

  btnLoading.value = true
  const { isSuccess, data } = await api.sheet({
    status: '未开票',
    month: exportInfo.value.month,
    team_id: [exportInfo.value.team_id],
  }).finally(() => (btnLoading.value = false))

  if (!isSuccess)
    return

  location.href = data
  exportModalRef.value?.close()
}

function reasonModalShow(row: Recordable) {
  reasonInfo.value.id = row.id
  reasonInfo.value.reason = row.reason
  reasonInfo.value.unback = row.unback
  reasonModalRef.value?.open()
}

async function handleReason() {
  if (!reasonInfo.value.reason) {
    toast.info('请输入无法回款原因')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api.updateReason({
    ...reasonInfo.value,
  }).finally(() => btnLoading.value = false)
  if (!isSuccess)
    return
  tableRef.value.refresh()
  reasonModalRef.value?.close()
}
</script>

<script lang="ts">
export default { name: 'TradePromise' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="statusOptions"
              placeholder="收款状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="合同编号或名称"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <OuterSelect
              v-model:value="queryModel.outer_id"
              placeholder="客户"
              types="0"
              :multiple="true"
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
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button-group>
              <n-button type="default" :disabled="!hasPermAdd" @click="contractModalShow">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
                新增
              </n-button>
              <n-button type="default" @click="exportModalShow">
                导出批量开票
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
              <n-button
                text
                type="primary"
                :disabled="Number(row.back) !== 0"
                @click="reasonModalShow(row)"
              >
                无法回款
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

    <SpModal
      ref="contractModalRef"
      title="应收款项目"
      width="600"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex items-center gap-2.5">
          <n-select
            v-model:value="contractInfoId"
            :options="contractOptions"
            placeholder="请选择"
            filterable
            clearable
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="contractModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleContractCreate">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>

    <SpModal
      ref="exportModalRef"
      title="批量开票导出"
      width="600"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <n-form label-placement="left" require-mark-placement="left" :label-width="80">
            <n-grid :cols="24" :x-gap="24" :y-gap="24">
              <n-form-item-gi :span="24" label="开票月份" :show-feedback="false">
                <n-date-picker
                  v-model:value="exportInfo.month"
                  placeholder="请选择"
                  type="month"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="单位部门" :show-feedback="false">
                <SpCascader
                  v-model:value="exportInfo.team_id"
                  :options="teamTreeOptions"
                  placeholder="请选择"
                  value-field="id"
                />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="exportModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleExportSheet">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>

    <SpModal
      ref="reasonModalRef"
      title="无法回款原因"
      width="600"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <n-form label-placement="left" require-mark-placement="left" :label-width="80">
            <n-grid :cols="24" :x-gap="24" :y-gap="24">
              <n-form-item-gi :span="24" :show-feedback="false">
                <n-input v-model:value="reasonInfo.reason" type="textarea" :rows="5" clearable />
              </n-form-item-gi>
              <n-form-item-gi :span="24" :show-feedback="false">
                <n-switch v-model:value="reasonInfo.unback" size="large" :round="false">
                  <template #checked>
                    无法收回
                  </template>
                  <template #unchecked>
                    延迟回款
                  </template>
                </n-switch>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="reasonModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleReason">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
