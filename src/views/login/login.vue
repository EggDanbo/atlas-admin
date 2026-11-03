<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { Icon } from '@iconify/vue'
import { createReusableTemplate } from '@vueuse/core'
import { ref } from 'vue'
import { projectConfig } from '@/config'
import { useGlobSetting } from '@/hooks/setting'
import { useAppInfoStore } from '@/store/modules/appinfo'
import { useThemeStore } from '@/store/modules/theme'
import MobileForm from '@/views/login/components/MobileForm.vue'
import LoginForm from './components/LoginForm.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import Qrcode from './components/Qrcode.vue'
import { useParallax } from './composables/useParallax'
import Privacy from './privacy.vue'
import Protocol from './protocol.vue'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const loginType = ref('account')

const protocolRef = ref<ModalInst>()
const privacyRef = ref<ModalInst>()

const globSetting = useGlobSetting()

const { isDark } = storeToRefs(useThemeStore())
const { version } = useAppInfoStore()

// 登录页配置
const { login } = projectConfig

// 卡片视差（触屏/关闭时返回 none）
const { transform } = useParallax({ strength: login.parallaxStrength })
const parallaxStyle = computed(() => login.parallax ? transform.value : 'none')
</script>

<template>
  <div class="login-page h-screen flex flex-col overflow-x-hidden" :class="{ dark: isDark }">
    <!-- 登录表单模板 -->
    <DefineTemplate>
      <div class="login-form-comp">
        <div class="mt-4 flex items-center justify-center">
          <n-h1 class="mb-6 text-center tracking-3">
            {{ globSetting.title }}
          </n-h1>
        </div>
        <div class="mx-auto mb-6">
          <n-tabs v-model:value="loginType" justify-content="space-evenly" animated type="segment">
            <n-tab name="account">
              <n-flex :size="4" align="center">
                <n-icon size="18">
                  <Icon icon="ant-design:user-outlined" />
                </n-icon>
                <span>账号</span>
              </n-flex>
            </n-tab>
            <n-tab name="mobile">
              <n-flex :size="4" align="center">
                <n-icon size="18">
                  <Icon icon="ant-design:mobile-outlined" />
                </n-icon>
                <span>手机号</span>
              </n-flex>
            </n-tab>
            <n-tab name="scanCode">
              <n-flex :size="4" align="center">
                <n-icon size="18">
                  <Icon icon="ant-design:qrcode-outlined" />
                </n-icon>
                <span>扫码</span>
              </n-flex>
            </n-tab>
          </n-tabs>
        </div>
        <!-- 账号登录 -->
        <LoginForm v-if="loginType === 'account'" />
        <!-- 手机登录 -->
        <MobileForm v-if=" loginType === 'mobile'" />
        <!-- 扫码登录 -->
        <Qrcode v-if=" loginType === 'scanCode'" />

        <div class="mt-3 pl-1 pr-1 text-center">
          登录即表示您同意并愿意遵守<br>
          <n-button
            text
            type="primary"
            @click="protocolRef?.open()"
          >
            软件使用协议
          </n-button>
          与
          <n-button
            text
            type="primary"
            @click="privacyRef?.open()"
          >
            用户隐私政策
          </n-button>
        </div>
      </div>
    </DefineTemplate>

    <!-- 布局容器 -->
    <n-el tag="div" class="flex-1">
      <!-- 居中 -->
      <ParticleBackground v-if="login.particles" />
      <div class="login-wrapper h-full flex flex-col">
        <div class="w-full flex flex-1 items-center justify-center">
          <div
            class="login-card mx-auto my-auto w-[410px] flex items-center justify-center"
            :style="{ transform: parallaxStyle, transformStyle: 'preserve-3d' }"
          >
            <n-card class="shadow-float w-full px-4">
              <ReuseTemplate />
            </n-card>
          </div>
        </div>

        <div class="loginBox-footer">
          <div class="h-full flex flex-wrap items-center justify-center">
            <div class="text-center">
              <n-text depth="3" class="text-xs">
                演示环境 · 数据均为本地模拟
              </n-text>
              <br><span v-if="version">V1.0.{{ version }}</span>
            </div>
          </div>
        </div>
      </div>
    </n-el>
  </div>

  <Protocol ref="protocolRef" />
  <Privacy ref="privacyRef" />
</template>

<style lang="less" scoped>
.login {
  &-form-comp {
    min-width: 320px;
  }
  &-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
  }
  &-wrapper {
    width: 100vw;
    height: 100vh;
  }
  &-title {
    font-weight: 400;
    letter-spacing: 1.2px;
  }
  &-describe {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1.2px;
  }
  &-left-container {
    &-img {
      width: 78%;
    }
  }
}

.loginBox {
  &-footer {
    height: 80px;
    background-color: transparent !important;
    color: rgba(0, 0, 0, 0.7);
  }
}

.shadow-float {
  position: relative;
  z-index: 10;
  width: 440px;
  padding: 50px 45px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 视差倾斜容器：相对定位抬高层级，平滑过渡
.login-card {
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.dark {
  .loginBox {
    &-footer {
      height: 80px;
      background-color: transparent !important;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>

<style lang="less">
.login-page {
  .n-card > .n-card-content {
    padding: 0;
  }
}
</style>
