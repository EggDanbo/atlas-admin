<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { SpDict } from '@/components/SpDict'
import { createTransformer, useDetail } from '@/hooks/detail'
import { account as api } from '@/service/api/basic'
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
    code: null,
    name: null,
    types: null,
    no: null,
    bank: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  team_id: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
  types: [{ required: true, message: '请选择账户类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入账户代码', trigger: 'change' }],
  name: [{ required: true, message: '请输入账户名称', trigger: 'change' }],
  no: [{ required: true, message: '请输入银行账号', trigger: 'change' }],
  bank: [{ required: true, message: '请选择银行名称', trigger: 'change' }],
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
  title: '银行帐号',
  permission: { useTabPermission: true, permName: 'DEMO_BASIC_ACCOUNT' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types'],
    enum: {
      types: 'basic_account_types',
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_account' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicAccountDetail' }
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
      :rules="formModel.stoped ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="所属机构" path="team_id">
          <n-select
            v-model:value="formModel.team_id"
            placeholder="请选择"
            clearable
            :options="teamOptions"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="账户类型" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_account_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="账户代码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="账户名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行账号" path="no">
          <n-input v-model:value="formModel.no" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行名称" path="bank">
          <n-select
            v-model:value="formModel.bank"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_account_bank', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="开户行" path="open">
          <SpDict v-model:value="formModel.open" name="开户银行" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="联行号" path="link">
          <n-input v-model:value="formModel.link" clearable />
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
        <n-form-item-gi :span="24" label="所属机构">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="账户类型">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="账户代码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="账户名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行账号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行名称">
          <n-input v-model:value="formModel.bank" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="开户行">
          <n-input v-model:value="formModel.open" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="联行号">
          <n-input v-model:value="formModel.link" placeholder="" readonly="true" />
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
          types="basic/account"
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
