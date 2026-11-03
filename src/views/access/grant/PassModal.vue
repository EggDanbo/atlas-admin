<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import type { ModalInst } from '@/components/SpModal'
import { permituser as api } from '@/service/api/identity'
import { encrypt } from '@/utils/crypto'
import toast from '@/utils/toast'

const emit = defineEmits(['on-success'])

interface PassModel {
  pass1: string
  pass2: string
}

const formRef = ref<FormInst | null>(null)
const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)

const formModel = reactive<PassModel>({
  pass1: '',
  pass2: '',
})

const userIds = ref<string[]>([])

const formRules: FormRules = {
  pass1: [
    { required: true, message: '请填写密码', trigger: 'blur' },
    { type: 'string', min: 4, message: '密码长度至少4位', trigger: 'blur' },
  ],
  pass2: [
    { type: 'string', min: 4, message: '密码长度至少4位', trigger: 'blur' },
    {
      required: true,
      validator: (_rule, value) => {
        if (!value)
          return new Error('请再次输入密码')
        if (value !== formModel.pass1)
          return new Error('两次输入密码不一致')
        return true
      },
      trigger: 'blur',
    },
  ],
}

// 打开弹窗
function open(params: { userIds: string[] }) {
  userIds.value = params.userIds
  formModel.pass1 = ''
  formModel.pass2 = ''
  formRef.value?.restoreValidation()
  modalRef.value?.open()
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api.setPwdSafety({
    list: userIds.value,
    password: encrypt(formModel.pass1),
  }).finally(() => btnLoading.value = false)

  if (isSuccess) {
    toast.success('设置成功')
    modalRef.value?.close()
    emit('on-success')
  }
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'AccessGrantPassModal' }
</script>

<template>
  <SpModal ref="modalRef" width="400" title="设置密码">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :model="formModel"
      :rules="formRules"
    >
      <n-form-item label="设置密码" path="pass1">
        <n-input
          v-model:value="formModel.pass1"
          type="password"
          show-password-on="click"
          clearable
        />
      </n-form-item>
      <n-form-item label="确认密码" path="pass2">
        <n-input
          v-model:value="formModel.pass2"
          type="password"
          show-password-on="click"
          clearable
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleSubmit">
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
