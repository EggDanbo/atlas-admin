<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { BatchImportDownloadModal, SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpCascader } from '@/components/SpCascader'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { unit as api } from '@/service/api/access'
import { useUserStore } from '@/store/modules/user'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import detail from './detail.vue'

const userStore = useUserStore()

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const batchImportDownloadRef = ref<InstanceType<typeof BatchImportDownloadModal> | null>(null)
const batchImportRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const treeOptions = ref<Recordable[]>([])
const treeRef = ref<OpenModal | null>(null)

const querySchemas = computed(() => ({
  status: [
    { label: '未停用', value: '0' },
    { label: '已停用', value: '1' },
  ],
}))

function createQueryModel() {
  return {
    format: 'atlas/access/unit',
    filter: null as string | null,
    stoped: null as string | null,
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
  hasPermEdit,
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
      width: 200,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
  { type: 'divider', key: 'd1' },
  { label: '批量导入删除', key: '批量导入删除' },
  { label: '下载导入文件', key: '下载导入文件' },
]

if (userStore.isAdmin) {
  rowMoreOptions.push({ type: 'divider', key: 'd2' })
  rowMoreOptions.push({ label: '设为成本中心', key: '设为成本中心' })
}

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id, name: 'organ_team' })
  }
  else if (key === '批量导入删除') {
    handleRemove([row], true)
  }
  else if (key === '下载导入文件') {
    batchImportDownloadRef.value?.open(row.id)
  }
  else if (key === '设为成本中心') {
    toast.infoModal('确定将本单位设置为下级单位的成本中心吗？', {
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        pageLoading.value = true
        const { isSuccess } = await api.updateAlone({ id: row.id })
          .finally(() => pageLoading.value = false)
        if (!isSuccess)
          return
        toast.success('操作成功')
      },
    })
  }
}

const moreOptions = reactive([
  { label: '树状预览', key: '树状预览', icon: createIcon('ant-design:partition-outlined') },
  { type: 'divider', key: 'd1' },
  { label: '批量导入', key: '批量导入', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd2' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

if (userStore.isAdmin) {
  moreOptions.push({ type: 'divider', key: 'd3' })
  moreOptions.push({ label: '结构重算(按编码)', key: '结构重算', icon: createIcon('ant-design:apartment-outlined') })
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
  else if (key === '结构重算') {
    handleRebuild()
  }
  else if (key === '树状预览') {
    if (!hasPermEdit) {
      toast.warning('无编辑权限不允许预览')
      return
    }
    const { isSuccess, data } = await api.tree({ all: true, stoped: true })
    if (!isSuccess)
      return
    treeOptions.value = data
    treeRef.value?.open()
  }
}

/**
 * 结构重算：以编码前缀重新确定上下级关系并重算全部结构列（历史/导入数据修复）
 */
function handleRebuild() {
  toast.infoModal('将按编码前缀重新确定上下级关系并重算全部结构列（用于历史数据修复）。存在"按上级创建"的单位时禁止使用！确定执行吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.rebuild({ from_code: true })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('结构重算完成')
      tableRef.value?.refresh()
    },
  })
}

function handleStoped(row: Recordable) {
  toast.infoModal(`确定${row.stoped ? '启用' : '停用'}吗？`, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.updateStoped({ id: row.id, stoped: !row.stoped })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      row.stoped = !row.stoped
      toast.success('操作成功')
    },
  })
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
</script>

<script lang="ts">
export default { name: 'AccessUnit' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.stoped"
              :options="querySchemas.status"
              placeholder="是否停用"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="编码、名称等"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="4">
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
              <n-button text type="primary" :disabled="!hasPermEdit" @click="handleStoped(row)">
                {{ row.stoped ? '启用' : '停用' }}
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
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
    <BatchImportDownloadModal ref="batchImportDownloadRef" />
    <SpBatchImportModal
      ref="batchImportRef"
      title="单位信息批量导入"
      template-download-url="/template/单位信息导入模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />

    <!-- 树状预览弹窗 -->
    <SpModal ref="treeRef" title="树结构预览" width="600" :show-ok="false">
      <n-form :show-feedback="false">
        <n-form-item>
          <SpTree
            placeholder="树状选择"
            value-field="id"
            :options="treeOptions"
            :multiple="false"
          />
        </n-form-item>
        <n-form-item>
          <SpCascader
            placeholder="级联选择"
            value-field="id"
            :options="treeOptions"
          />
        </n-form-item>
      </n-form>
    </SpModal>
  </NaPage>
</template>
