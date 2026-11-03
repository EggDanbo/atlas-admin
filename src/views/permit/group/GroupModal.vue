<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import { SpTree } from '@/components/SpTree'
import { permitgroup as api } from '@/service/api/identity'
import { team as teamApi } from '@/service/api/organ'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const tableRef = ref<any>(null)
const loading = ref(false)

const formData = reactive({
  team: [] as Recordable[],
  permList: [] as DropDownItem[],
})

const filterModel = reactive({
  user_id: null as string | null,
  team_id: null as string | null,
  name: '',
})

function createFormModel() {
  return {
    id: 0,
    user_id: null as string | null,
    perm_name: null as string | null,
    perm_team: [] as string[],
  }
}

const formRules: FormRules = {
  perm_name: [{ required: true, message: '请选择分组权限', trigger: 'change' }],
  perm_team: [{ type: 'array', required: true, message: '请选分管单位', trigger: 'change' }],
}

// 编辑弹窗
const editModalRef = ref<any>(null)
const editFormRef = ref<any>(null)
const editFormModel = reactive(createFormModel())

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
      field: 'perm_name',
      title: '分组权限',
      headerAlign: 'center',
      align: 'left',
      minWidth: 120,
      slots: {
        default: ({ row }: { row: Recordable }) => [
          h('a', { onClick: () => handleEdit(row) }, row.perm_name),
        ],
      },
    },
    {
      field: 'ctime',
      title: '创建时间',
      headerAlign: 'center',
      align: 'left',
      width: 150,
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
      width: 110,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  showPageMode: false,
  showResetBtn: false,
  showReload: true,
  pagination: false,
  canResize: false,
  height: 400,
  async fetchData() {
    if (!filterModel.user_id)
      return []
    const { isSuccess, data } = await api.getGroupList(filterModel.user_id)
    return isSuccess ? data : []
  },
})

async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree()
  if (isSuccess)
    formData.team = data
}

async function loadGroupEnums() {
  const { isSuccess, data } = await api.getGroupEnum()
  if (isSuccess)
    formData.permList = data
}

async function handleEdit(row: Recordable) {
  editModalRef.value?.setProps({ title: '编辑分组权限' })
  loading.value = true
  const { isSuccess, data } = await api.get(row.id).finally(() => loading.value = false)
  if (!isSuccess)
    return
  Object.assign(editFormModel, {
    id: data.id,
    user_id: data.user_id,
    perm_name: data.perm_name,
    perm_team: data.perm_team || [],
  })
  editFormRef.value?.restoreValidation?.()
  editModalRef.value?.open()
}

async function handleAdd() {
  editModalRef.value?.setProps({ title: '新增分组权限' })
  Object.assign(editFormModel, createFormModel(), {
    user_id: filterModel.user_id,
    perm_team: filterModel.team_id ? [filterModel.team_id] : [],
  })
  console.log(editFormModel)
  editFormRef.value?.restoreValidation?.()
  editModalRef.value?.open()
}

function handleDelete(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      loading.value = true
      const { isSuccess } = await api.delete({ id: row.id })
        .finally(() => loading.value = false)
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value?.refresh()
        emit('on-action')
      }
    },
  })
}

async function handleOk({ done }) {
  try {
    await editFormRef.value?.validate()
  }
  catch {
    done(false)
    return
  }

  const request = editFormModel.id > 0
    ? api.update(editFormModel)
    : api.create(editFormModel)

  const { isSuccess } = await request
  done(isSuccess)
  if (isSuccess) {
    toast.success('保存成功')
    editModalRef.value?.close()
    tableRef.value?.refresh()
    emit('on-action')
  }
}

const modalRef = ref<any>(null)

const exposed: OpenModal = {
  open: async (params?: any) => {
    filterModel.user_id = params?.user_id ?? null
    filterModel.team_id = params?.team_id ?? null
    filterModel.name = params?.name ?? ''

    modalRef.value?.setProps({ title: `[${filterModel.name}]分组权限列表` })
    modalRef.value?.open()

    await loadTeamTree()
    await loadGroupEnums()

    await nextTick()
    if (tableRef.value)
      await tableRef.value.search()
  },
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PermitGroupGroupModal' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :mask="true" :show-ok="false">
    <NaPage :loading="loading">
      <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit(row)">
        <template #toolbarLeftBtn>
          <n-button type="default" @click="handleAdd()">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增
          </n-button>
        </template>
        <template #operate="{ row }">
          <div class="flex items-center justify-center">
            <n-button text type="primary" @click="handleEdit(row)">
              查看
            </n-button>
            <n-divider vertical />
            <n-button text type="primary" @click="handleDelete(row)">
              删除
            </n-button>
          </div>
        </template>
      </SpTable>
    </NaPage>
  </SpModal>

  <SpModal ref="editModalRef" width="500" @ok="handleOk">
    <n-form
      ref="editFormRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="editFormModel"
      :rules="formRules"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi v-if="editFormModel.id <= 0" :span="18" label="分组权限" path="perm_name">
          <n-select
            v-model:value="editFormModel.perm_name"
            placeholder="请选择分组权限"
            :options="formData.permList"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="18" label="分管单位" path="perm_team">
          <SpTree
            v-model:value="editFormModel.perm_team"
            :options="formData.team"
            placeholder="请选择"
            value-field="id"
            check-strategy="all"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </SpModal>
</template>
