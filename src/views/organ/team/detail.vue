<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { useDetail } from '@/hooks/detail'
import { team as api } from '@/service/api/organ'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    code: null,
    organ_code: null,
    fullname: null,
    name: null,
    fore: null,
    address: null,
    wechat_work_dept: null,
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any }

const formRules: FormRules = {
  code: [{ required: true, message: '请填写单位编码', trigger: 'change' }],
  name: [{ required: true, message: '请填写单位简称', trigger: 'change' }],
  fullname: [{ required: true, message: '请填写单位全称', trigger: 'change' }],
}

function teamNameChange() {
  if (formModel.name === '') {
    formModel.name = formModel.fullname
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
  title: '单位设置',
  permission: { useTabPermission: true, permName: 'ORGAN_TEAM' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'organ_team' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'OrganTeamDetail' }
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
        <n-form-item-gi :span="7" label="单位编码" path="code">
          <n-input v-model:value="formModel.code" maxlength="30" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="机构代码" path="organ_code">
          <n-input v-model:value="formModel.organ_code" maxlength="120" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="单位标识" path="fore">
          <n-input v-model:value="formModel.fore" maxlength="10" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="单位名称" path="fullname">
          <n-input
            v-model:value="formModel.fullname"
            maxlength="50"
            clearable
            @change="teamNameChange"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="单位简称" path="name">
          <n-input v-model:value="formModel.name" maxlength="25" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="企业微信部门" path="wechat_work_dept">
          <n-input v-model:value="formModel.wechat_work_dept" maxlength="200" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="单位地址" path="address">
          <n-input v-model:value="formModel.address" maxlength="120" clearable />
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
        <n-form-item-gi :span="7" label="单位编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="9" label="机构代码">
          <n-input v-model:value="formModel.organ_code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="单位标识">
          <n-input v-model:value="formModel.fore" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="单位名称">
          <n-input v-model:value="formModel.fullname" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="单位简称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="企业微信部门">
          <n-input v-model:value="formModel.wechat_work_dept" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="单位地址">
          <n-input v-model:value="formModel.address" placeholder="" readonly="true" />
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
          types="organ/team"
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
