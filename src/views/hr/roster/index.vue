<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpDict } from '@/components/SpDict'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { roster as api } from '@/service/api/hr'
import { useEnumStore } from '@/store/modules/enums'
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

const updateDateModalRef = ref<ModalInst | null>(null)
const updateDateData = ref({
  id: null as string | null,
  date: null as number | null,
})

const updateModalRef = ref<ModalInst | null>(null)
const updateScale = ref<string | null>(null)

const enumStore = useEnumStore()

const querySchemas = computed(() => ({
  blacked: [
    { label: '是', value: '1' },
    { label: '否', value: '0' },
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
    format: 'atlas/hr/roster',
    team_id: null,
    filter: null,
    status: null,
    blacked: null,
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
  rowClassName: ({ row }) => row.stoped ? 'row-warning' : null,
  columns: [
    {
      field: 'code',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.code,
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
  { type: 'divider', key: 'd2' },
  { label: '调整退休月份', key: '调整退休月份' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id, name: 'staff_info' })
  }
  else if (key === '批量导入删除') {
    handleRemove([row], true)
  }
  else if (key === '下载导入文件') {
    batchImportDownloadRef.value?.open(row.id)
  }
  else if (key === '调整退休月份') {
    updateDateData.value.id = row.id
    updateDateData.value.date = Number(row.out_date)
    updateDateModalRef.value?.open()
  }
}

const moreOptions = computed(() => [
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

async function updateDate() {
  pageLoading.value = true
  const { isSuccess } = await api.updateDate({
    ...updateDateData.value,
  }).finally(() => pageLoading.value = false)

  if (isSuccess) {
    toast.success('操作成功')
    tableRef.value?.refresh()
    updateDateModalRef.value?.close()
  }
}

function handleUpdate() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.warning('请选择要调整的行')
    return
  }

  updateScale.value = null
  updateModalRef.value?.open()
}

async function scale() {
  if (!updateScale.value) {
    toast.warning('请选择工资级别')
    return
  }

  const rows = tableRef.value.getCheckboxRows()

  pageLoading.value = true
  const { isSuccess } = await api
    .updateScale({
      list: rows.map(m => m.id),
      scale: updateScale.value,
    })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  updateModalRef.value?.close()
  tableRef.value?.refresh()
}
</script>

<script lang="ts">
export default { name: 'HrRoster' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.blacked"
              :options="querySchemas.blacked"
              placeholder="黑名单"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.status"
              :options="enumStore.getEnumOptions('staff_info_status')"
              placeholder="在职状态"
              clearable
              max-tag-count="responsive"
              multiple
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="姓名、工号或手机号"
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
              <n-button v-if="false" type="default" @click="handleEdit('add')">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
                新增
              </n-button>
              <n-button type="default" @click="handleUpdate">
                级别调整
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
    <LogBiz ref="logBizRef" />
    <PdfSetting ref="pdfSettingRef" />
    <BatchImportDownloadModal ref="batchImportDownloadRef" />
    <SpBatchImportModal
      ref="batchImportRef"
      title="人员信息批量导入"
      template-download-url="/template/人员信息导入模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />

    <SpModal ref="updateDateModalRef" width="500" title="调整退休月份" :mask="true">
      <div class="w-full flex">
        <n-date-picker v-model:value="updateDateData.date" type="month" />
      </div>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="updateDateModalRef?.close">
            关闭
          </n-button>
          <n-button
            type="primary"
            :loading="pageLoading"
            @click="updateDate"
          >
            保存
          </n-button>
        </n-flex>
      </template>
    </SpModal>

    <SpModal
      ref="updateModalRef"
      width="500"
      title="级别调整"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex flex-col gap-[12px] pb-3 pt-3">
          <div class="w-full">
            <SpDict v-model:value="updateScale" name="工资级别" clearable />
          </div>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="updateModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="pageLoading" @click="scale">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
