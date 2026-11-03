<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import { SpTree } from '@/components/SpTree'
import { useDetail } from '@/hooks/detail'
import { unit as teamApi } from '@/service/api/access'
import { role as api } from '@/service/api/identity'

const emit = defineEmits(['on-action'])

interface DataScopeConfig {
  uable: string[]
  utext: string[]
  value: string[]
}

const PRESET_TYPES = ['ALL', 'OWN', 'SUB', 'SUM', 'SUN'] as const

const formData = reactive({
  kind: [] as DropDownItem[],
  team: [] as Recordable[],
  perm: [] as Auth.Permission[],
})

const dataTreeDisabled = reactive<Record<string, boolean>>({ team: false })
const dataSelectOpt = reactive<Record<string, string>>({ team: '' })

const dataTypeOptions = [
  { value: 'ALL', label: '全部' },
  { value: 'SUM', label: '同根' },
  { value: 'SUN', label: '同枝' },
  { value: 'SUB', label: '同级' },
  { value: 'OWN', label: '所属' },
  { value: '', label: '所选' },
]

async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree()
  if (isSuccess)
    formData.team = data
}

async function loadKindList() {
  const { isSuccess, data } = await api.getKind()
  if (isSuccess)
    formData.kind = data
}

async function loadPermTree(kind: string | null) {
  if (!kind) {
    formData.perm = []
    return
  }
  const { isSuccess, data } = await api.getPermList({ kind })
  if (isSuccess)
    formData.perm = data
}

function createFormModel() {
  return {
    role: { id: '0', name: '', description: '', kind: null as string | null },
    perms: [] as string[],
    data: { team: { uable: [], utext: [], value: [] } as DataScopeConfig },
  }
}

const formRules: FormRules = {
  'role.name': [{ required: true, message: '请输入角色名称', trigger: 'change' }],
  'role.kind': [{ required: true, message: '请选择角色类型', trigger: 'change' }],
}

function transformToApi(data: Record<string, DataScopeConfig>) {
  Object.values(data).forEach((scope) => {
    if (!scope)
      return
    if (scope.value.length)
      scope.uable = scope.value.slice()
    else if (!scope.utext.length)
      scope.uable = []
  })
}

function transformToForm(data: Record<string, DataScopeConfig>) {
  Object.keys(data).forEach((key) => {
    const scope = data[key]
    if (!scope)
      return
    const hasValues = scope.uable.length > 0
    const hasLabels = scope.utext.length > 0
    switch (true) {
      case hasValues && !hasLabels:
        scope.value = scope.uable.slice()
        dataSelectOpt[key] = ''
        dataTreeDisabled[key] = false
        break
      case hasValues && hasLabels:
        scope.value = []
        dataSelectOpt[key] = scope.uable[0] ?? ''
        dataTreeDisabled[key] = true
        break
      default:
        scope.uable = []
        scope.utext = []
        scope.value = []
        dataSelectOpt[key] = ''
        dataTreeDisabled[key] = false
    }
  })
}

function resetState() {
  Object.keys(dataTreeDisabled).forEach(k => dataTreeDisabled[k] = false)
  Object.keys(dataSelectOpt).forEach(k => dataSelectOpt[k] = '')
}

const {
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  submit,
  clearTabState,
  params,
} = useDetail({
  api: {
    create(data: Recordable) {
      transformToApi(data.data)
      return api.create({ ...data.role, perms: data.perms, data: data.data })
    },
    update(data: Recordable) {
      transformToApi(data.data)
      return api.update({ ...data.role, perms: data.perms, data: data.data })
    },
    get(id: string) {
      return api.getPerm({ id })
    },
  },
  createFormModel,
  permission: { useTabPermission: true },
  idField: 'role.id',
  canEdit: () => true,
  title: { edit: (_, p) => p.isCopy ? '复制角色设置' : '编辑角色设置' },
  async beforeEdit(data, params) {
    await Promise.all([loadKindList(), loadTeamTree()])
    resetState()
    if (params?.id && params.id !== '0') {
      await loadPermTree(data.role.kind)
      if (params.isCopy) {
        data.role.name = `${data.role.name} (副本)`
        data.role.id = '0'
      }
      transformToForm(data.data)
    }
    return true
  },
  onSuccess: action => emit('on-action', action),
})

function handleKindChange(value: string | null) {
  formModel.perms = []
  loadPermTree(value)
}

function dataTypeUpdate(type: string, value: string) {
  const isPreset = PRESET_TYPES.includes(value as typeof PRESET_TYPES[number])
  const scope = formModel.data[type]!
  dataTreeDisabled[type] = isPreset
  if (isPreset) {
    scope.utext = [dataTypeOptions.find(o => o.value === value)?.label ?? '']
    scope.uable = [value]
    scope.value = []
  }
  else {
    scope.utext = []
    scope.uable = []
    scope.value = []
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AccessRoleDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="角色名称" path="role.name">
          <n-input v-model:value="formModel.role.name" maxlength="50" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="角色类型" path="role.kind">
          <n-select
            v-model:value="formModel.role.kind"
            :disabled="formModel.role.id !== '0' && !params.isCopy"
            :options="formData.kind"
            placeholder=""
            @update:value="handleKindChange"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="功能权限" path="perms">
          <SpTree
            v-model:value="formModel.perms"
            :options="formData.perm"
            placeholder=""
            value-field="id"
            label-field="title"
            check-strategy="all"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="角色说明" path="description">
          <n-input
            v-model:value="formModel.role.description"
            type="textarea"
            maxlength="100"
            placeholder=""
            :rows="3"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="单位权限">
          <n-input-group>
            <n-select
              v-model:value="dataSelectOpt.team"
              style="width: 10%"
              :options="dataTypeOptions"
              @update:value="dataTypeUpdate('team', $event)"
            />
            <SpTree
              v-model:value="formModel.data.team!.value"
              :options="formData.team"
              placeholder=""
              value-field="id"
              check-strategy="all"
              :disabled="dataTreeDisabled.team"
              width="90%"
            />
          </n-input-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <n-alert title="提示" type="info">
      <li>同根：表示第一级下所有数据</li>
      <li>同枝：表示第二级下所有数据</li>
      <li>同级：表示上级包含的所有数据</li>
    </n-alert>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          :disabled="!hasPerm"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
