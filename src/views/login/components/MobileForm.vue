<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core'
import { useMessage, useNotification } from 'naive-ui'
import { reactive, ref } from 'vue'
import authorize from '@/service/api/identity/authorize'
import { verifycode } from '@/service/api/misc'
import { useAppInfoStore } from '@/store/modules/appinfo'
import { useUserStore } from '@/store/modules/user'
import { rules, validMobileNumber } from '@/utils/rules'

// 预编译正则表达式
const DIGIT_ONLY_REGEX = /^\d+$/

const userStore = useUserStore()
const { logincaptcha } = useAppInfoStore()

const onlyAllowNumber = (value: string) => !value || DIGIT_ONLY_REGEX.test(value)
const formRef = ref()
const mobileRef = ref()
const Message = useMessage()
const notification = useNotification()
const sendingCode = ref(false) // 添加发送验证码状态
const countdown = ref(0) // 倒计时
const timer = ref<NodeJS.Timeout | null>(null) // 计时器
const verifyCodeDataMobile = ref('')

const formModel = reactive({
  mobile_number: '',
  password: [],
  captcha: {
    key: '',
    verifycode: '',
  },
})

const formRules = {
  mobile_number: { required: true, validator: validMobileNumber, trigger: 'blur' },
  password: [
    {
      message: '请输入4位动态码',
      validator: (_, value: string[] | null) => {
        if (value === null)
          return false
        return value.filter(Boolean).length === 4
      },
      trigger: ['input'],
    },
  ],
}

if (logincaptcha) {
  formRules['captcha.verifycode'] = { required: true, message: '请输入图形验证码', trigger: 'blur' }
}

// 发送验证码函数
async function sendCaptchaCode() {
  if (!formModel.mobile_number) {
    Message.error('请输入手机号码')
    return
  }
  // 验证手机号格式
  if (!rules.isMobileNumber.test(formModel.mobile_number)) {
    Message.error('请输入正确的手机号码')
    return
  }

  if (!formModel.captcha.verifycode) {
    Message.error('请输入图形验证码')
    return
  }

  // 如果正在倒计时，则不重复发送
  if (countdown.value > 0) {
    return
  }
  sendingCode.value = true
  Message.loading('正在发送短信验证码')

  try {
    const { isSuccess, message } = await authorize.sendVerifyCode({
      mobile_number: formModel.mobile_number,
      captcha: formModel.captcha,
    })

    if (!isSuccess) {
      Message.destroyAll()
      Message.error(message)
      await renderVerfiyCode()
      return
    }
    Message.destroyAll()
    Message.success(`短信验证码已提交至短信服务商，请注意查收`)
    // 开始倒计时
    startCountdown()
  }
  catch (error) {
    console.error(error)
    Message.error('发送短信验证码失败')
  }
  finally {
    sendingCode.value = false
  }
}

// 开始倒计时
function startCountdown() {
  countdown.value = 60
  if (timer.value) {
    clearInterval(timer.value)
  }
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }, 1000)
}

// 清理计时器
onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

function handleSubmit(e?) {
  e?.preventDefault()
  formRef.value.validate(async (errors) => {
    if (!errors) {
      Message.loading('登录中...')
      try {
        const { isSuccess, message } = await userStore.asyncLoginBySms({
          mobile_number: formModel.mobile_number,
          password: formModel.password.join(''),
        })
        if (!isSuccess) {
          Message.destroyAll()
          Message.error(message)
          await renderVerfiyCode()
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
  })
}

async function renderVerfiyCode() {
  const { isSuccess, data, response } = await verifycode.getImage()
  if (isSuccess) {
    verifyCodeDataMobile.value = `data:image/png;base64,${data}`
    formModel.captcha!.key = response.headers['access-token']
  }
  else {
    verifyCodeDataMobile.value = ''
    formModel.captcha!.key = ''
  }
}

onKeyStroke('Enter', (e) => {
  e.preventDefault()
  handleSubmit()
})

onMounted(async () => {
  mobileRef.value.focus()
  await renderVerfiyCode()
})
</script>

<template>
  <n-form
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :show-label="false"
    :show-require-mark="false"
    size="large"
  >
    <n-form-item path="mobile_number">
      <n-input
        ref="mobileRef"
        v-model:value="formModel.mobile_number"
        :maxlength="11"
        class="rounded-lg"
        placeholder="请输入手机号码"
      >
        <template #prefix>
          <NaIcon icon="ant-design:user-outlined" />
        </template>
      </n-input>
    </n-form-item>
    <n-form-item path="captcha.verifycode">
      <div class="w-full flex">
        <n-input-group>
          <n-input
            v-model:value="formModel.captcha!.verifycode"
            :input-props="{ autocomplete: 'new-password' }"
            class="rounded-lg"
            maxlength="4"
            placeholder="请输入图形验证码"
            type="text"
          >
            <template #prefix>
              <n-icon size="18" color="#808695">
                <NaIcon icon="ant-design:code-outlined" />
              </n-icon>
            </template>
            <template #suffix>
              <n-button text @click="renderVerfiyCode">
                <n-icon size="18" color="#808695">
                  <Icon icon="ant-design:reload-outlined" />
                </n-icon>
              </n-button>
            </template>
          </n-input>
          <img
            :src="verifyCodeDataMobile"
            style="vertical-align: middle; border-radius: 4px"
            @click="renderVerfiyCode"
          >
        </n-input-group>
      </div>
    </n-form-item>
    <n-form-item path="password">
      <div class="w-full flex">
        <n-input-otp v-model:value="formModel.password" :allow-input="onlyAllowNumber" :length="4" style="width: 100%;" />
        <n-button
          :disabled="sendingCode || countdown > 0"
          class="ml-3 rounded-lg"
          text
          type="primary"
          @click="sendCaptchaCode"
        >
          {{ countdown > 0 ? `${countdown}秒后重发` : '点击获取短信验证码' }}
        </n-button>
      </div>
    </n-form-item>

    <n-button
      :loading="userStore.loginLoading"
      block
      class="mb-6.5 rounded-lg"
      size="large"
      type="primary"
      @click="handleSubmit"
    >
      {{ userStore.loginLoading ? '登录中...' : '登 录' }}
    </n-button>
  </n-form>
</template>
