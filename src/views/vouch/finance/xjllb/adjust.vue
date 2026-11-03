<script lang="ts" setup>
import type { TableProps } from '@/components/SpTable'
import { SpCascader } from '@/components/SpCascader'
import { cashflow as cashflowApi } from '@/service/api/basic'
import { xjllb as api } from '@/service/api/vouch/finance'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)

const btnLoading = ref(false)
const dateValue = ref<string | null>(null)
const dataList = ref<any>([])

const cashflowTreeOptions = ref<Recordable[]>([])

async function fetch() {
  if (!dateValue.value)
    return

  const { isSuccess, data } = await api.get({
    date: dateValue.value,
  })
  if (isSuccess) {
    dataList.value = data
    if (dataList.value.length === 0) {
      itemsAdd(0)
    }

    modalRef.value.open()

    if (tableRef.value) {
      tableRef.value.redoHeight()
    }
  }
}

async function open(params: any) {
  await load()
  dateValue.value = params?.date

  await fetch()
}

function close() {
  modalRef.value?.close()
}

async function submit() {
  const hasError = dataList.value.some(item => item.error === true)
  if (hasError) {
    toast.error('存在重复的项目编码，请修改后再提交')
    return false
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .save({
      date: dateValue.value,
      list: dataList.value,
    })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('保存成功')
    close()
    emit('on-action')
  }
}

const gridOptions = reactive<TableProps>({
  canResize: true,
  resizeHeightOffset: 125,
  keepSource: true,
  rowClassName: ({ row }) => {
    if (row.error) {
      return 'row-error-200'
    }
    return null
  },
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: {
    height: 56,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    icon: 'fa fa-file-text-o',
    autoClear: false,
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 70, align: 'right' },
    {
      width: 360,
      field: 'code',
      title: '项目编码',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'code_edit', default: 'code_default' },
    },
    {
      width: 180,
      field: 'debit',
      title: '调增数',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'debit_edit' },
    },
    {
      width: 180,
      field: 'credit',
      title: '调减数',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'credit_edit' },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 250,
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'remark_edit' },
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

function itemsAdd(index) {
  const list = {
    code: null,
    debit: null,
    credit: null,
    remark: null,
  }

  dataList.value.splice(Number(index) + 1, 0, list)
}

function itemsRemove(index) {
  if (dataList.value.length <= 1) {
    toast.info('不能少于一行')
    return
  }

  dataList.value.splice(index, 1)
}

function rowsChange(e) {
  tableRef.value.editRowEvent(e.row)
}

function handleItemCashflowSelected(options, row, rowIndex) {
  row.code_name = options?.label
  row.error = false
  checkDuplicate(rowIndex)
}

function checkDuplicate(rowIndex) {
  const currentIndex = rowIndex
  const currentCode = dataList.value[currentIndex].code
  const hasDuplicate = dataList.value.some((item, index) => {
    return index !== currentIndex && item.code === currentCode
  })

  if (hasDuplicate) {
    toast.error('不能选择相同的项目编码')
    dataList.value[currentIndex].error = true
  }
}

async function loadCashflowTreeOptions() {
  const { isSuccess, data } = await cashflowApi.tree({})
  if (!isSuccess)
    return
  cashflowTreeOptions.value = data
}

async function load() {
  loadCashflowTreeOptions()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="现金流项目调整数"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="dataList" @current-change="rowsChange">
        <template #operate="{ rowIndex }">
          <div class="flex items-center justify-center gap-[10px]">
            <n-button text @click="itemsAdd(rowIndex)">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
            </n-button>
            <n-button text @click="itemsRemove(rowIndex)">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:delete-outlined" />
                </n-icon>
              </template>
            </n-button>
          </div>
        </template>
        <!-- 现金编码 -->
        <template #code_default="{ row }">
          {{ row.code_name }}
        </template>
        <template #code_edit="{ row, rowIndex }">
          <SpCascader
            v-model:value="row.code"
            :options="cashflowTreeOptions"
            placeholder="请选择"
            value-field="code"
            @update:value="(e, options) => handleItemCashflowSelected(options, row, rowIndex)"
          />
        </template>
        <!-- 增加数 -->
        <template #debit_edit="{ row }">
          <n-input-number
            v-model:value="row.debit"
            clearable
            :show-button="false"
            :precision="2"
          />
        </template>
        <!-- 减少数 -->
        <template #credit_edit="{ row }">
          <n-input-number
            v-model:value="row.credit"
            clearable
            :show-button="false"
            :precision="2"
          />
        </template>
        <!-- 备注 -->
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="submit">
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
