<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import { useDetail } from '@/hooks/detail'
import { external as api } from '@/service/api/identity'

const emit = defineEmits(['on-action'])

function createFormModel() {
  return {
    id: '0',
    description: null,
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any }

const formRules: FormRules = {
  description: [{ required: true, message: '请输入描述', trigger: 'change' }],
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
} = useDetail<FormModel>({
  api: {
    create(data) {
      return api.account.create(data)
    },
    update(data) {
      return api.account.update(data)
    },
  },
  // 接收外部传入的数据
  onBeforeOpen: (params) => {
    // 将传入的 description 填充到 formModel
    formModel.id = params.id ?? '0'
    if (params.description !== undefined) {
      formModel.description = params.description
    }
    return true
  },
  createFormModel,
  permission: { useTabPermission: true },
  onSuccess: action => emit('on-action', action),
})

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AccessPartnerAccountEdit' }
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
        <n-form-item-gi :span="24" label="账号描述" path="description">
          <n-input
            v-model:value="formModel.description"
            type="textarea"
            maxlength="50"
            placeholder=""
            :rows="3"
            clearable
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
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
