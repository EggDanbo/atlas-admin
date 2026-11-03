<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { SpDict } from '@/components/SpDict'
import { createTransformer, useDetail } from '@/hooks/detail'
import { partner as api } from '@/service/api/access'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    no: null,
    code: null,
    name: null,
    hotline: null,
    types: null,
    account: null,
    deposit: null,
    contact: null,
    mobile: null,
    email: null,
    address: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    types: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
    name: [{ required: true, message: '请填写机构名称', trigger: 'change' }],
    no: [{ required: false, message: '请填写统一社会信用代码', trigger: 'change' }],
  }

  if (formModel.types && Number(formModel.types) === 0) {
    rules.no[0].required = true
  }

  return rules
})

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
  title: '外部机构',
  permission: { useTabPermission: true, permName: 'IAM_UNIT' },
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
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'organ_outer' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'OrganOuterDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
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
        <n-form-item-gi :span="7" label="机构类型" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="机构类型"
            :options="enumStore.getEnumOptions('organ_outer_types')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="税号" path="no">
          <n-input v-model:value="formModel.no" maxlength="18" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="机构编码" path="code">
          <n-input v-model:value="formModel.code" maxlength="20" placeholder="空则按类型自动编码" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="机构名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="50" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="邮件地址" path="email">
          <n-input v-model:value="formModel.email" maxlength="20" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="联系人" path="contact">
          <n-input v-model:value="formModel.contact" maxlength="25" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="手机号" path="mobile">
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
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="7" label="机构类型">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="税号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="机构编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="机构名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="邮件地址">
          <n-input v-model:value="formModel.email" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="联系人">
          <n-input v-model:value="formModel.contact" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="手机号">
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
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="access/partner"
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
