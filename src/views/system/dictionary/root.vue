<script lang="ts" setup>
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance, TableProps } from '@/components/SpTable'
import { reactive, ref } from 'vue'
import { useDetail } from '@/hooks/detail'
import { dictionary as api } from '@/service/api/system'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const modalRef = ref<ModalInst | null>(null)
const tableRef = ref<TableInstance>({} as TableInstance)

function createQueryModel() {
  return ({
    parent_id: '0',
    name: '',
  })
}

/** 筛选条件 */
const queryModel = reactive(createQueryModel())

const gridOptions = reactive<TableProps>({
  columns: [
    {
      type: 'seq',
      title: '序号',
      width: 70,
      resizable: false,
      headerAlign: 'center',
      align: 'right',
    },
    {
      field: 'name',
      title: '名称',
      headerAlign: 'center',
      align: 'left',
      minWidth: 140,
    },
    {
      field: 'kind',
      title: '固定',
      headerAlign: 'center',
      align: 'center',
      width: 80,
      slots: {
        default: ({ row }) => {
          return [row.kind === 1 ? '是' : '否']
        },
      },
    },
    {
      field: 'depth',
      title: '深度',
      headerAlign: 'center',
      align: 'left',
      width: 80,
    },
    {
      field: 'max_depth',
      title: '最大深度',
      headerAlign: 'center',
      align: 'left',
      width: 80,
    },
    {
      field: 'sort',
      title: '排序',
      headerAlign: 'center',
      align: 'left',
      width: 80,
      slots: { default: 'sort' },
    },
    {
      field: 'utime',
      title: '更新时间',
      headerAlign: 'center',
      align: 'left',
      width: 150,
    },
    {
      isOperate: true,
      title: '操作',
      width: 120,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  showReload: true,
  pagination: false,
  canResize: false,
  showResetBtn: false,
  showQueryBtn: false,
  showPageMode: false,
  height: 480,
  async fetchData() {
    const { isSuccess, data } = await api.getNodeList(queryModel.parent_id, queryModel.name)
    if (!isSuccess)
      return []
    return data
  },
})

function createFormModel() {
  return {
    id: '0',
    name: '',
    kind: 0, // 0-正常，1-固定（表单使用数字，提交时转为布尔）
    sort: 0,
    max_depth: 2,
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  name: {
    required: true,
    message: '请填写名称',
    trigger: 'blur',
  },
}

const {
  formModel,
  formRef,
  btnLoading,
  modalRef: editModalRef,
  exposed: editExposed,
  edit,
  submit,
  clearTabState,
} = useDetail<FormModel>({
  api: {
    // kind 字段：表单使用 0/1，API 需要 boolean
    create(data: any) {
      return api.createRoot({ ...data, kind: data.kind === 1 })
    },
    update(data: any) {
      return api.updateRoot({ ...data, kind: data.kind === 1 })
    },
    get(id: string) {
      return api.get(id)
    },
  },
  createFormModel,
  onSuccess: (action) => {
    emit('on-action', action)
    tableRef.value.refresh()
  },
})

async function queryReset() {
  queryModel.name = ''
  await tableRef.value.search()
}

async function handleEdit(row: Recordable) {
  edit(row.id)
}

function handleAdd() {
  editExposed.open()
}

async function handleSort() {
  const data = tableRef.value.getData()
  if (!data || data.length === 0)
    return
  const postData = data.map((s: any) => ({
    id: s.id,
    sort: s.sort || 0,
  }))
  const { isSuccess } = await api.updateSort(postData)
  if (!isSuccess)
    return
  await tableRef.value.fetch()
}

async function handleExport() {
  const { isSuccess, data } = await api.exportScript()
  if (!isSuccess)
    return
  location.href = data
}

async function handleRemove(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const { isSuccess } = await api.deleteRoot({ value: row.id })
        if (!isSuccess)
          return
        tableRef.value.refresh()
        emit('on-action', 'del')
      }
      catch (e) {
        console.error('删除失败:', e)
      }
    },
  })
}

const exposed: OpenModal = {
  open: async () => {
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="900" :show-ok="false" title="根节点管理">
    <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit(row)">
      <template #toolbarLeftBtn>
        <n-space>
          <n-input
            v-model:value="queryModel.name"
            type="text"
            placeholder="搜索"
            clearable
            @clear="queryReset"
            @keyup.enter="tableRef.search()"
          >
            <template #prefix>
              <n-icon>
                <Icon icon="ant-design:search-outlined" />
              </n-icon>
            </template>
          </n-input>
          <n-button type="default" @click="handleAdd()">
            新增
          </n-button>
          <n-button type="default" @click="handleSort()">
            排序
          </n-button>
          <n-button type="default" @click="handleExport()">
            导出
          </n-button>
        </n-space>
      </template>
      <template #sort="{ row }">
        <n-input-number v-model:value="row.sort" :precision="0" :show-button="false" />
      </template>
      <!-- 操作列 -->
      <template #operate="{ row }">
        <div class="flex items-center justify-center">
          <n-button text type="primary" @click="handleEdit(row)">
            查看
          </n-button>
          <n-divider vertical />
          <n-button text type="primary" @click="handleRemove(row)">
            删除
          </n-button>
        </div>
      </template>
    </SpTable>
    <SpModal ref="editModalRef" width="460" :mask="true" :before-close="clearTabState">
      <n-form
        ref="formRef"
        label-placement="left"
        require-mark-placement="left"
        :label-width="70"
        :model="formModel"
        :rules="formRules"
      >
        <n-form-item label="名称" path="name">
          <n-input
            v-model:value="formModel.name"
            placeholder="请填写名称"
            maxlength="50"
            clearable
          />
        </n-form-item>
        <n-form-item label="固定">
          <n-switch v-model:value="formModel.kind!" :checked-value="1" :unchecked-value="0">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number
            v-model:value="formModel.sort"
            :min="0"
            :max="255"
            :show-button="false"
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="最大深度">
          <n-input-number
            v-model:value="formModel.max_depth"
            :min="2"
            :max="255"
            :show-button="false"
            class="w-full"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="editModalRef?.close">
            关闭
          </n-button>
          <n-button
            type="primary"
            :loading="btnLoading"
            @click="submit"
          >
            保存
          </n-button>
        </n-flex>
      </template>
    </SpModal>
  </SpModal>
</template>
