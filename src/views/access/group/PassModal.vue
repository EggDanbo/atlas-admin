<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { permituser as api } from '@/service/api/identity'
import crypto from '@/utils/crypto'
import toast from '@/utils/toast'

const emit = defineEmits(['on-success'])

const modalRef = ref<any>(null)
const formRef = ref<any>(null)

const params = ref<{ list: string[] }>({ list: [] })

const formModel = reactive({
  pass1: '',
  pass2: '',
})

const formRules: FormRules = {
  pass1: [
    { required: true, message: '请填写密码', trigger: 'blur' },
    { type: 'string', min: 4, message: '密码长度至少4位', trigger: 'blur' },
  ],
  pass2: [
    { type: 'string', min: 4, message: '密码长度至少4位', trigger: 'blur' },
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        }
        else if (value !== formModel.pass1) {
          callback(new Error('两次输入密码不一致'))
        }
        else {
          callback()
        }
        return undefined
      },
      trigger: 'blur',
    },
  ],
}

async function handleOk({ done }) {
  try {
    await formRef.value?.validate()
  }
  catch {
    done(false)
    return
  }

  const { isSuccess } = await api.setPwdSafety({
    list: params.value.list,
    password: crypto.encrypt(formModel.pass1),
  })
  done(isSuccess)
  if (isSuccess) {
    toast.success('保存成功')
    modalRef.value?.close()
    emit('on-success')
  }
}

const exposed: OpenModal = {
  open: (args?: any) => {
    formModel.pass1 = ''
    formModel.pass2 = ''
    params.value.list = args?.list || []
    formRef.value?.restoreValidation?.()
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AccessGroupPassModal' }
</script>

<template>
  <SpModal ref="modalRef" width="500" title="设置密码" @ok="handleOk">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
    >
      <n-form-item label="设置密码" path="pass1">
        <n-input v-model:value="formModel.pass1" type="password" clearable />
      </n-form-item>
      <n-form-item label="确认密码" path="pass2">
        <n-input v-model:value="formModel.pass2" type="password" clearable />
      </n-form-item>
    </n-form>
  </SpModal>
</template>
