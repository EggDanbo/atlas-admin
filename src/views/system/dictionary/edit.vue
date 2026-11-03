<script lang="ts" setup>
import type { FormRules } from 'naive-ui'
import { useDetail } from '@/hooks/detail'
import { dictionary as api } from '@/service/api/system'

const emit = defineEmits(['on-action'])

function createFormModel() {
  return {
    id: '0',
    name: null,
    sort: 0,
    child: false,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  name: [{ required: true, message: '请填写名称', trigger: 'change' }],
}

const {
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  submit,
  clearTabState,
} = useDetail<FormModel>({
  api,
  createFormModel,
  beforeSubmit(data, params) {
    data.parent_id = params.parent_id
    return true
  },
  onSuccess: (action) => {
    emit('on-action', action)
  },
})

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="460" :mask="true" :before-close="clearTabState">
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
      <n-form-item label="排序">
        <n-input-number v-model:value="formModel.sort" :precision="0" :show-button="false" class="w-full" />
      </n-form-item>
      <n-form-item label="开启子级">
        <n-switch v-model:value="formModel.child" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
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
</template>
