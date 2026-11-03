<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/Logs/Biz'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpBatchImportModal } from '@/components/SpBatchImportModal'
import { useListPage } from '@/hooks/list'
import { commercial as api } from '@/service/api/hr/insurance'
import { useEnumStore } from '@/store/modules/enums'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import detail from './detail.vue'
import list from './table.vue'

const enumStore = useEnumStore()

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)
const listRef = ref<OpenModal | null>(null)

const batchUserAddRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const batchUserForRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const btnLoading = ref<boolean>(false)
const replaceValue = ref<string | null>(null)
const replaceModalRef = ref<ModalInst | null>(null)

const replaceListOptions = ref<any>([])
async function loadReplaceListOptions(rows: Recordable[]) {
  const { isSuccess, data } = await api.list({ list: rows.map(m => m.id) })
  if (!isSuccess)
    return
  replaceListOptions.value = data
}

function createQueryModel() {
  return {
    format: 'atlas/hr/insurance/commercial',
    filter: null,
    types: null,
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
      field: 'zzs',
      slots: {
        default: ({ row }) => {
          if (row.zzs !== 0) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery([row], '0'),
                },
                row.zzs,
              ),
            ]
          }
          else {
            return '-'
          }
        },
      },
    },
    {
      field: 'lzs',
      slots: {
        default: ({ row }) => {
          if (row.lzs !== 0) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery([row], '1'),
                },
                row.lzs,
              ),
            ]
          }
          else {
            return '-'
          }
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
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id })
  }
}

const moreOptions = computed(() => [
  { label: '参保人员', key: '参保人员', icon: createIcon('ant-design:user-outlined') },
  { type: 'divider', key: 'd1' },
  { label: '保单增人', key: '保单增人', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '参保替换', key: '参保替换', icon: createIcon('ant-design:cloud-upload-outlined') },
  { type: 'divider', key: 'd2' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
  else if (key === '参保人员') {
    handleQuery(rows, '')
  }
  else if (key === '保单增人') {
    batchUserAddRef.value?.open()
  }
  else if (key === '参保替换') {
    batchUserForRef.value?.open()
  }
}

function handleQuery(rows: Recordable[], types: string) {
  listRef.value?.open({ id: rows.map(q => q.id), types: types || null })
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

async function handleReplace() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.warning('请选择要替换的保单')
    return
  }

  await loadReplaceListOptions(rows)

  replaceValue.value = null
  replaceModalRef.value?.open()
}

async function replace() {
  if (!replaceValue.value) {
    toast.warning('请选择新保单')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api.replace({
    list: tableRef.value.getCheckboxRows().map(q => q.id),
    id: replaceValue.value,
  }).finally(() => btnLoading.value = false)
  if (!isSuccess)
    return
  toast.success('操作成功')
  replaceModalRef.value?.close()
  await tableRef.value?.refresh()
}

async function handleUserAddSuccess(fileId: string) {
  const res = await api.batchUserAdd({
    value: fileId,
  })

  batchUserAddRef.value?.close()
  if (res.isSuccess) {
    if (res.data) {
      checkFileUrl.value = res.data
      batchUserAddRef.value?.check()
    }
    else {
      toast.success('导入成功')
      tableRef.value?.refresh()
    }
  }
  else {
    toast.error(res.message)
  }
}

async function handleUserForSuccess(fileId: string) {
  const res = await api.batchUserFor({
    value: fileId,
  })

  batchUserForRef.value?.close()
  if (res.isSuccess) {
    if (res.data) {
      checkFileUrl.value = res.data
      batchUserForRef.value?.check()
    }
    else {
      toast.success('导入成功')
      tableRef.value?.refresh()
    }
  }
  else {
    toast.error(res.message)
  }
}
</script>

<script lang="ts">
export default { name: 'StaffProtectInsure' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.types"
              :options="enumStore.getEnumOptions('staff_insure_status')"
              placeholder="保单状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="保单号或保险公司"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button-group>
              <n-button :disabled="!hasPermAdd" type="default" @click="handleEdit('add')">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
                新增
              </n-button>
              <n-button type="default" @click="handleReplace">
                保单替换
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
    <list ref="listRef" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
    <SpBatchImportModal
      ref="batchUserAddRef"
      title="参保人批量导入"
      template-download-url="/template/商业险保单增人模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleUserAddSuccess"
    />
    <SpBatchImportModal
      ref="batchUserForRef"
      title="参保人批量替换"
      template-download-url="/template/商业险参保替换模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleUserForSuccess"
    />

    <SpModal
      ref="replaceModalRef"
      title="保单替换"
      width="450"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full pb-6 pt-2">
          <n-select v-model:value="replaceValue" placeholder="新保单" :options="replaceListOptions" clearable />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="replaceModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="replace">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
