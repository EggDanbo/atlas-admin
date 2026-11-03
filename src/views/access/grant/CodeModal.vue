<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import type { ModalInst } from '@/components/SpModal'
import { permituser as api } from '@/service/api/identity'
import { encrypt } from '@/utils/crypto'
import toast from '@/utils/toast'

const emit = defineEmits(['on-success'])

// 正则表达式移到模块级别避免重复编译
const CODE_REGEX = /^[\w-]*$/

interface CodeModel {
  userId: string
  code: string
}

const formRef = ref<FormInst | null>(null)
const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)

const formModel = reactive<CodeModel>({
  userId: '',
  code: '',
})

const formRules: FormRules = {
  code: [
    { type: 'string', min: 2, message: '登录账号长度至少2位', trigger: 'blur' },
    {
      required: true,
      validator: (_rule, value) => {
        if (!value)
          return new Error('请输入账号')
        if (!CODE_REGEX.test(value))
          return new Error('只能包括字母、数字、下划线、横线')
        return true
      },
      trigger: 'blur',
    },
  ],
}

// 打开弹窗
function open(params: { userId: string, code: string }) {
  formModel.userId = params.userId
  formModel.code = params.code
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
  const { isSuccess } = await api.updateCodeSafety({
    userId: formModel.userId,
    code: encrypt(formModel.code),
  }).finally(() => btnLoading.value = false)

  if (isSuccess) {
    toast.success('修改成功')
    modalRef.value?.close()
    emit('on-success')
  }
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'AccessGrantCodeModal' }
</script>

<template>
  <SpModal ref="modalRef" width="500" title="修改登录账号">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :model="formModel"
      :rules="formRules"
    >
      <n-form-item label="修改登录账号(区分大小写)" path="code">
        <n-input
          v-model:value="formModel.code"
          minlength="2"
          maxlength="20"
          :show-button="false"
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
