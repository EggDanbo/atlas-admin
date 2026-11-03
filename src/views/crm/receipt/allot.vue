<script lang="ts" setup>
import type { TableProps } from '@/components/SpTable'
import { SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpCascader } from '@/components/SpCascader'
import { OuterSelect } from '@/components/TableSelect'
import { unit as teamApi } from '@/service/api/access'
import { receipt as api } from '@/service/api/crm'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)

const batchImportRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const btnLoading = ref(false)
const invoiceId = ref<string | null>(null)
const invoiceList = ref<any>([])
const dataList = ref<any>([])
const teamTreeOptions = ref<Recordable[]>([])

async function fetch() {
  if (!invoiceId.value)
    return

  const { isSuccess, data } = await api.get({ id: invoiceId.value, list: invoiceList.value })
  if (isSuccess) {
    dataList.value = data.list
    if (dataList.value.length === 0) {
      addList()
    }

    modalRef.value.open()
    setTimeout(() => {
      tableRef.value.redoHeight()
    })
  }
}

async function open(params: any) {
  await load()
  invoiceId.value = params?.id
  invoiceList.value = params?.list || []

  await fetch()
}

function close() {
  modalRef.value?.close()
}

async function submit() {
  if (itemsCheck())
    return
    // 去掉网格无用数据
  const listArr = dataList.value.filter(q => q.team_id)

  btnLoading.value = true
  const { isSuccess } = await api
    .confirm({
      id: invoiceId.value,
      list: listArr,
    })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('保存成功')
    close()
    emit('on-action', 'edit')
  }
}

async function importAllot() {
  batchImportRef.value?.open()
}

async function handleImportSuccess(fileId: string) {
  const { isSuccess, data } = await api.allotBatchImport({
    value: fileId,
  }).finally(() => batchImportRef.value?.close())

  if (isSuccess) {
    dataList.value = data
  }
}

function handleTeamSelected(row: Recordable, options: any) {
  if (options) {
    row.team_name = options.label
  }
}

function handleOuterSelected(row: Recordable, options: any) {
  if (options) {
    row.outer_id = options.id
    row.outer_name = options.name
  }
}

const gridOptions = reactive<TableProps>({
  canResize: true,
  resizeHeightOffset: 120,
  keepSource: true,
  rowClassName: ({ row }) => {
    if (row.stoped) {
      return 'row-warning'
    }
    return null
  },
  rowConfig: { isCurrent: true, isHover: false },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    icon: 'fa fa-file-text-o',
    autoClear: false,
  },
  editRules: {
    outer_id: [{ required: true }],
    team_id: [{ required: true }],
    amount: [{ required: true }],
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 70, align: 'right' },
    {
      minWidth: 200,
      field: 'invoice_no',
      title: '发票号码',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'invoice_edit' },
    },
    {
      minWidth: 240,
      field: 'outer_id',
      title: '客户名称',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'outer_edit', default: 'outer_default' },
    },
    {
      minWidth: 220,
      field: 'team_id',
      title: '分摊单位',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'team_edit', default: 'team_default' },
    },
    {
      width: 180,
      field: 'amount',
      title: '分摊金额',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'amount_edit' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  pagination: false,
})

function itemsCheck() {
  for (const i in dataList.value) {
    const items = dataList.value[i]

    if (!items.team_id) {
      toast.error(`第${Number(i) + 1}行的单位部门不能为空`)
      return true
    }
    if (!items.amount) {
      toast.error(`第${Number(i) + 1}行的分摊金额不能为空`)
      return true
    }
  }
  return false
}

function addList() {
  const listNums = 0
  const list = {
    invoice_no: null,
    team_id: null,
    team_name: null,
    amount: null,
  }

  dataList.value.splice(listNums + 1, 0, list)
}

function removeEvent(key) {
  if (dataList.value.length <= 1) {
    toast.info('不能少于一行')
    return
  }

  dataList.value.splice(key, 1)
}

function rowsChange(e) {
  tableRef.value.editRowEvent(e.row)
}

async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    all: true,
    alone: true,
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="分摊详细"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="dataList" @current-change="rowsChange">
        <template #operate="{ rowIndex }">
          <div class="flex items-center justify-center">
            <n-button text type="primary" @click="addList">
              增行
            </n-button>
            <n-divider vertical />
            <n-button text type="primary" @click="removeEvent(rowIndex)">
              删行
            </n-button>
          </div>
        </template>
        <template #invoice_edit="{ row }">
          <n-input v-model:value="row.invoice_no" clearable />
        </template>
        <template #outer_default="{ row }">
          {{ row.outer_name }}
        </template>
        <template #outer_edit="{ row }">
          <OuterSelect v-model:value="row.outer_id" types="0" @change="(options) => handleOuterSelected(row, options)" />
        </template>
        <template #team_default="{ row }">
          {{ row.team_name }}
        </template>
        <template #team_edit="{ row }">
          <SpCascader
            v-model:value="row.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="(e, options) => handleTeamSelected(row, options)"
          />
        </template>
        <template #amount_edit="{ row }">
          <n-input-number
            v-model:value="row.amount"
            clearable
            :show-button="false"
            :precision="2"
          />
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button :loading="btnLoading" @click="importAllot">
          导入分摊
        </n-button>
        <n-button :loading="btnLoading" @click="submit">
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpBatchImportModal
    ref="batchImportRef"
    title="发票分摊导入"
    template-download-url="/template/发票分摊导入模板.xlsx"
    :check-file-download-url="checkFileUrl"
    :check-file-message="checkFileMessage"
    @upload-success="handleImportSuccess"
  />
</template>
