<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { assist as api } from '@/service/api/basic'
import { team as teamApi } from '@/service/api/organ'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

const teamOptions = ref<any>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.getTenantList()
  if (!isSuccess)
    return
  teamOptions.value = data
}

async function load() {
  loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    team_id: null,
    team_name: null,
    types: null as string | null,
    code: null,
    name: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  types: [{ required: true, message: '请选择核算类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入编码', trigger: 'change' }],
  name: [{ required: true, message: '请输入名称', trigger: 'change' }],
}

const editRules = ref<any>(formRules)
function handleRules() {
  editRules.value = formRules
  switch (formModel.types) {
    case '部门':
    case '员工':
    case '项目':
    case '客户':
    case '供应商':
    case '往来单位':
    case '银行账号':
      editRules.value = {
        ...formRules,
        team_id: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
      }
      break
    default:
      formModel.team_id = null
      formModel.team_name = null
      break
  }
}

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  showEdit,
  submit,
  edit,
  clearTabState,
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '核算维度',
  permission: { useTabPermission: true, permName: 'DEMO_BASIC_ASSIST' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_assist' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicAssistDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formModel.stoped ? {} : editRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="核算维度" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="请选择"
            clearable
            :options="enumStore.getEnumOptions('basic_content_assist', 'label')"
            @update:value="handleRules"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="所属机构" path="team_id">
          <n-select
            v-model:value="formModel.team_id"
            placeholder="请选择"
            clearable
            :options="teamOptions"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="核算类型">
          <n-input :value="formModel.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="所属机构">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="basic/assist"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || formModel.stoped"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
