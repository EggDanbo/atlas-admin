<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import { profile as api } from '@/service/api/identity'

const message = useMessage()

const modalRef = ref()
const formRef = ref()

function createFormModel() {
  return {
    oldpassword: '',
    newpassword: '',
    confirmPassword: '',
  }
}

type FormModel = ReturnType<typeof createFormModel>

const formModel = ref<FormModel>(createFormModel())

const formRules: FormRules = {
  oldpassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newpassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (value !== formModel.value.newpassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

async function handleSubmit({ done }: { done: (close?: boolean) => void }) {
  try {
    await formRef.value?.validate()
  }
  catch {
    done(false)
    return
  }

  const { isSuccess } = await api.changePassword({
    oldpassword: formModel.value.oldpassword,
    newpassword: formModel.value.newpassword,
  })

  if (isSuccess) {
    message.success('密码修改成功')
    done(true)
  }
  else {
    done(false)
  }
}

function open() {
  formModel.value = createFormModel()
  formRef.value?.restoreValidation?.()
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="修改密码"
    width="460px"
    :draggable="true"
    @ok="handleSubmit"
  >
    <n-form
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      label-placement="left"
      label-width="80"
      require-mark-placement="left"
    >
      <n-form-item label="旧密码" path="oldpassword">
        <n-input
          v-model:value="formModel.oldpassword"
          type="password"
          placeholder="请输入旧密码"
          show-password-on="click"
          clearable
        />
      </n-form-item>
      <n-form-item label="新密码" path="newpassword">
        <n-input
          v-model:value="formModel.newpassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          show-password-on="click"
          clearable
        />
      </n-form-item>
      <n-form-item label="确认密码" path="confirmPassword">
        <n-input
          v-model:value="formModel.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password-on="click"
          clearable
        />
      </n-form-item>
    </n-form>
  </SpModal>
</template>
