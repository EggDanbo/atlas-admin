<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { customer as api } from '@/service/api/crm'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    types: '0',
    stoped: false,
    team_id: null as string | null,
    team_name: null,
    no: null,
    code: null,
    name: null,
    nature: null,
    account: null,
    deposit: null,
    contact: null,
    mobile: null,
    email: null,
    hotline: null,
    address: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  team_id: [{ required: true, message: '请选择分管部门', trigger: 'change' }],
  no: [{ required: true, message: '请填写税号', trigger: 'change' }],
  name: [{ required: true, message: '请填写客户名称', trigger: 'change' }],
  nature: [{ required: true, message: '请选择客户性质', trigger: 'change' }],
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
  title: '客户信息',
  permission: { useTabPermission: true, permName: 'CRM_CUSTOMER' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types'],
    enum: {
      types: 'organ_outer_types',
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'organ_outer' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'CrmCustomerDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="90"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="分管部门" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="税号" path="no">
          <n-input v-model:value="formModel.no" maxlength="18" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="客户名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="50" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="客户性质" path="nature">
          <n-select
            v-model:value="formModel.nature"
            :options="enumStore.getEnumOptions('trade_custom_nature', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="客户编码" path="code">
          <n-input v-model:value="formModel.code" maxlength="20" placeholder="空则自动编码" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="邮件地址" path="email">
          <n-input v-model:value="formModel.email" maxlength="20" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="联系人" path="contact">
          <n-input v-model:value="formModel.contact" maxlength="25" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="手机号" path="mobile">
          <n-input v-model:value="formModel.mobile" maxlength="20" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="电话" path="hotline">
          <n-input v-model:value="formModel.hotline" maxlength="20" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="开户银行" path="deposit">
          <SpDict v-model:value="formModel.deposit" name="开户银行" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行账号" path="account">
          <n-input v-model:value="formModel.account" maxlength="36" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="地址" path="address">
          <n-input v-model:value="formModel.address" maxlength="120" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件" path="files">
          <Upload
            v-model:value="formModel.files"
            upload-title="附件"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="90"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="分管部门">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="税号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="客户名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="客户性质">
          <n-input v-model:value="formModel.nature" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="客户编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="邮件地址">
          <n-input v-model:value="formModel.email" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="联系人">
          <n-input v-model:value="formModel.contact" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="手机号">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="电话">
          <n-input v-model:value="formModel.hotline" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="开户银行">
          <n-input v-model:value="formModel.deposit" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行账号">
          <n-input v-model:value="formModel.account" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="地址">
          <n-input v-model:value="formModel.address" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件" path="files">
          <Upload
            v-model:value="formModel.files"
            upload-title="附件"
            :disabled="true"
          />
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
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="crm/customer"
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
