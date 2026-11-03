<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { permituser as api } from '@/service/api/identity'
import crypto from '@/utils/crypto'
import toast from '@/utils/toast'

const emit = defineEmits(['on-success'])

const modalRef = ref<any>(null)
const formRef = ref<any>(null)

const formModel = reactive({
  userid: '',
  code: '',
})

const CODE_PATTERN = /^[\w-]*$/

const formRules: FormRules = {
  code: [
    { type: 'string', min: 2, message: '登录账号长度至少2位', trigger: 'blur' },
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入账号'))
        }
        else if (!CODE_PATTERN.test(value)) {
          callback(new Error('只能包括字母、数字、下划线、横线'))
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

  const { isSuccess } = await api.updateCodeSafety({
    userId: formModel.userid,
    code: crypto.encrypt(formModel.code),
  })
  if (isSuccess) {
    toast.success('修改成功')
    modalRef.value?.close()
    emit('on-success')
  }
  done(isSuccess)
}

const exposed: OpenModal = {
  open: (args?: any) => {
    formModel.userid = args?.userid ?? ''
    formModel.code = args?.code ?? ''
    formRef.value?.restoreValidation?.()
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PermitGroupCodeModal' }
</script>

<template>
  <SpModal ref="modalRef" width="500" title="修改登录账号" @ok="handleOk">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="190"
      :model="formModel"
      :rules="formRules"
    >
      <n-form-item label="修改登录账号(区分大小写)" path="code">
        <n-input
          v-model:value="formModel.code"
          minlength="6"
          maxlength="20"
          :show-button="false"
          clearable
        />
      </n-form-item>
    </n-form>
  </SpModal>
</template>
