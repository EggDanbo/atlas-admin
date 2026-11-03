<script lang="ts" setup>
import type { SliderCaptchaInst } from '@/components/SpSliderCaptcha'
import { onKeyStroke } from '@vueuse/core'
import { useMessage, useNotification } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useAppInfoStore } from '@/store/modules/appinfo'
import { useUserStore } from '@/store/modules/user'

const formRef = ref()
const usernameRef = ref()
const Message = useMessage()
const { logincaptcha } = useAppInfoStore()

const userStore = useUserStore()
const notification = useNotification()

// 滑块验证组件引用
const sliderCaptchaRef = ref<SliderCaptchaInst>()

const formModel = reactive<Auth.PasswordTokenCommand>({
  username: '',
  password: '',
  verifyToken: undefined,
})

const rules = {
  username: { required: true, message: '请输入账号', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

async function handleSubmit(e?) {
  e?.preventDefault()

  try {
    // 先验证表单
    await formRef.value?.validate()
  }
  catch {
    // 表单验证失败，直接返回
    return
  }

  // 表单验证通过，如果需要验证码，先进行滑块验证
  if (logincaptcha) {
    try {
      const verifyToken = await sliderCaptchaRef.value?.verify()
      // 将 verifyToken 设置到 captcha.key 中
      formModel.verifyToken = verifyToken || ''
    }
    catch {
      // 滑块验证失败或取消
      return
    }
  }

  // 提交登录
  Message.loading('登录中...')
  try {
    const { isSuccess, message } = await userStore.asyncLogin(formModel)
    if (!isSuccess) {
      Message.destroyAll()
      Message.error(message)
      return
    }
    Message.destroyAll()
  }
  catch (error: any) {
    notification.error({
      title: '登录失败',
      content: error.message,
      duration: 2000,
    })
  }
}

onKeyStroke('Enter', (e) => {
  e.preventDefault()
  handleSubmit()
})

onMounted(async () => {
  usernameRef.value.focus()
})
</script>

<template>
  <n-form
    ref="formRef"
    :model="formModel"
    :rules="rules"
    :show-label="false"
    :show-require-mark="false"
    class="plus-login-form"
    size="large"
  >
    <n-form-item path="username">
      <n-input
        ref="usernameRef"
        v-model:value="formModel.username"
        class="rounded-lg"
        placeholder="请输入账号"
      >
        <template #prefix>
          <NaIcon icon="ant-design:user-outlined" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item path="password">
      <n-input
        v-model:value="formModel.password"
        class="rounded-lg"
        placeholder="请输入密码"
        show-password-on="click"
        type="password"
      >
        <template #prefix>
          <NaIcon icon="ant-design:lock-outlined" />
        </template>
      </n-input>
    </n-form-item>
    <n-button
      :loading="userStore.loginLoading"
      block
      class="rounded-lg"
      size="large"
      type="primary"
      @click="handleSubmit"
    >
      {{ userStore.loginLoading ? '登录中...' : '登 录' }}
    </n-button>
  </n-form>

  <!-- 滑块验证组件 -->
  <SpSliderCaptcha v-if="logincaptcha" ref="sliderCaptchaRef" />
</template>
