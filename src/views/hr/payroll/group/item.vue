<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { useListPage } from '@/hooks/list'
import { groupItem as api } from '@/service/api/hr/payroll'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import enumvarEditor from './enumvarEditor.vue'
import formulaEditor from './formulaEditor.vue'
import itemDict from './itemDict.vue'

const detailRef = ref<OpenModal | null>(null)
const itemDictModalRef = ref<OpenModal | null>(null)
const enumvarEditorRef = ref<OpenModal | null>(null)
const formulaEditorRef = ref<OpenModal | null>(null)
const modalRef = ref<ModalInst | null>(null)

const title = ref<string | null>(null)

function createQueryModel() {
  return {
    format: 'atlas/hr/payroll/group/item',
    group_id: null as string | null,
    month: null as number | null,
    filter: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
  hasPermAdd,
  hasPermEdit,
  hasPermDele,
  handleEdit,
  hasPermPrint,
  hasPermExport,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef,
  idField: 'id',
  createQueryModel,
  columns: [
    { field: 'title', title: '名称', dragSort: true },
    {
      isOperate: true,
      title: '操作',
      width: 110,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    canResize: true,
    fitContainer: true,
    resizeHeightOffset: 4,
    pagination: false,
    rowConfig: {
      drag: true,
    },
  },
})

function rowDragChange({ _index }) {
  const data = tableRef.value.getDataSource()
  const currRow = data.splice(_index.oldIndex, 1)[0]
  data.splice(_index.newIndex, 0, currRow!)
}

const moreOptions = computed(() => [
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
}

function open(params: { title?: string, month: number, group_id: string }) {
  if (params.title)
    title.value = params.title

  queryModel.group_id = params.group_id
  queryModel.month = params.month
  modalRef.value?.open()

  if (tableRef.value.search) {
    tableRef.value.search()
  }
}

function handleFormula(row: Recordable) {
  if (Number(row.field_type) === 0) {
    formulaEditorRef.value?.open({
      ...row,
      group_id: queryModel.group_id,
      month: queryModel.month,
    })
  }
  else if (Number(row.field_type) === 4) {
    enumvarEditorRef.value?.open({
      ...row,
      group_id: queryModel.group_id,
      month: queryModel.month,
    })
  }
  else {
    toast.warning('此类型不支持公式编辑')
  }
}

async function handleSort() {
  const data = tableRef.value.getDataSource()
  if (!data || data.length === 0)
    return

  const postData = data.map((s: any, index: number) => ({
    id: s.id,
    line: index,
  }))

  pageLoading.value = true
  const { isSuccess } = await api.updateSort({ list: postData }).finally(() => pageLoading.value = false)
  if (isSuccess)
    tableRef.value.refresh()
}

function handleDict() {
  itemDictModalRef.value?.open({
    group_id: queryModel.group_id,
    month: queryModel.month,
  })
}

function handleCopy() {
  const data = tableRef.value.getDataSource()
  if (data && data.length !== 0) {
    toast.warning('已有工资项目')
    return
  }

  toast.infoModal('确定复制上月工资项目（含公式）到本月吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.copy({
        group_id: queryModel.group_id,
        month: queryModel.month,
      }).finally(() => (pageLoading.value = false))
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value.search()
      }
    },
  })
}

function handleClear() {
  const rows = tableRef.value.getDataSource()
  if (!rows || rows.length === 0) {
    toast.warning('没有工资项目')
    return
  }

  toast.infoModal(`确定清空全部 ${rows.length} 个工资项目吗？`, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ list: rows.map(m => m.id) })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      tableRef.value.refresh()
    },
  })
}

function handleRemove(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ id: row.id }).finally(() => {
        pageLoading.value = false
      })
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value.refresh()
      }
    },
  })
}

function editAction() {
  tableRef.value.refresh()
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'HrPayrollGroupItem' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :mask="true" :title="`工资项目 ${title}`">
    <NaPage :loading="pageLoading">
      <SpTable
        ref="tableRef"
        v-bind="gridOptions"
        @cell-dblclick="({ row }) => handleEdit('view', row)"
        @row-dragend="rowDragChange"
      >
        <template #toolbarLeftBtn>
          <n-button-group>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleDict">
              设置工资项目
            </n-button>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleCopy">
              复制上月项目
            </n-button>
            <n-button :disabled="!hasPermDele" type="default" @click="handleClear">
              清空项目
            </n-button>
          </n-button-group>

          <n-button
            :disabled="!hasPermAdd && !hasPermEdit"
            type="default"
            icon-placement="right"
            @click="handleSort"
          >
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:sort-ascending-outlined" />
              </n-icon>
            </template>
            保存排序
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

        <template #operate="{ row }">
          <div class="flex items-center justify-start" style="padding: 0 8px">
            <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove(row)">
              删除
            </n-button>
            <n-divider v-if="Number(row.field_type) === 0 || Number(row.field_type) === 4" vertical />
            <n-button
              v-if="Number(row.field_type) === 0 || Number(row.field_type) === 4"
              text
              type="primary"
              @click="handleFormula(row)"
            >
              公式
            </n-button>
          </div>
        </template>
      </SpTable>
    </NaPage>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
      </n-flex>
    </template>

    <itemDict ref="itemDictModalRef" @on-action="editAction" />
    <enumvarEditor ref="enumvarEditorRef" @on-action="editAction" />
    <formulaEditor ref="formulaEditorRef" />
  </SpModal>
</template>
