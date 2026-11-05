<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { Icon } from '@iconify/vue'
import { createReusableTemplate } from '@vueuse/core'
import { ref } from 'vue'
import logo from '@/assets/logo.png'
import { projectConfig } from '@/config'
import { useGlobSetting } from '@/hooks/setting'
import { useAppInfoStore } from '@/store/modules/appinfo'
import { useThemeStore } from '@/store/modules/theme'
import MobileForm from '@/views/login/components/MobileForm.vue'
import LoginForm from './components/LoginForm.vue'
import ParticleBackground from './components/ParticleBackground.vue'
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

/** 登录页品牌面板的能力点 */
const highlights = [
  { title: '11 个业务域', desc: '客户 · 人力 · 费用 · 资产 · 资金 · 文档' },
  { title: '统一的权限模型', desc: '菜单、按钮、数据范围三层校验' },
  { title: '可编排的审批流', desc: '单据提交、审批、过账全链路留痕' },
]

const tagline = computed(() => projectConfig.app.tagline)
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
          </n-tabs>
        </div>
        <!-- 账号登录 -->
        <LoginForm v-if="loginType === 'account'" />
        <!-- 手机登录 -->
        <MobileForm v-if="loginType === 'mobile'" />

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
            class="login-card mx-auto my-auto"
            :style="{ transform: parallaxStyle, transformStyle: 'preserve-3d' }"
          >
            <div class="shadow-float login-shell">
              <!-- 品牌面板：窄屏下自动隐藏，表单居中显示 -->
              <aside class="login-aside">
                <div class="login-aside__brand">
                  <span class="login-aside__mark">
                    <img :src="logo" alt="">
                  </span>
                  <span class="login-aside__names">
                    <strong>{{ globSetting.title }}</strong>
                    <em>{{ tagline }}</em>
                  </span>
                </div>

                <h2 class="login-aside__slogan">
                  把复杂业务<br>
                  收进一块屏幕
                </h2>

                <ul class="login-aside__points">
                  <li v-for="item in highlights" :key="item.title">
                    <span class="dot" />
                    <span class="text">
                      <strong>{{ item.title }}</strong>
                      <em>{{ item.desc }}</em>
                    </span>
                  </li>
                </ul>

                <div class="login-aside__stack">
                  Vue 3 · TypeScript · Vite · Naive UI · ECharts
                </div>
              </aside>

              <section class="login-panel">
                <ReuseTemplate />
                <div class="login-demo">
                  <span class="login-demo__label">演示账号</span>
                  <code>demo</code>
                  <span class="login-demo__sep">/</span>
                  <code>123456</code>
                </div>
              </section>
            </div>
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
  display: flex;
  width: 880px;
  max-width: calc(100vw - 48px);
  overflow: hidden;
  background-color: var(--atlas-surface);
  border: 1px solid var(--atlas-border);
  border-radius: 22px;
  box-shadow:
    0 24px 64px -24px rgba(31, 35, 41, 0.28),
    0 2px 8px rgba(31, 35, 41, 0.06);
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 左侧品牌面板 */
.login-aside {
  display: flex;
  flex-direction: column;
  gap: 28px;
  flex: 0 0 372px;
  padding: 40px 34px;
  color: #fff;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(255, 255, 255, 0.24) 0%, transparent 55%),
    linear-gradient(158deg, var(--atlas-brand) 0%, #ea6a0a 100%);

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    overflow: hidden;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.28);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__names {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    strong {
      font-size: 14px;
      font-weight: 650;
      letter-spacing: 0.01em;
    }

    em {
      margin-top: 2px;
      font-size: 10px;
      font-style: normal;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      opacity: 0.72;
    }
  }

  &__slogan {
    margin: 0;
    font-size: 27px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0.02em;
  }

  &__points {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .dot {
      flex: 0 0 auto;
      width: 6px;
      height: 6px;
      margin-top: 7px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
    }

    .text {
      display: flex;
      flex-direction: column;
      line-height: 1.5;

      strong {
        font-size: 13px;
        font-weight: 600;
      }

      em {
        font-size: 12px;
        font-style: normal;
        opacity: 0.72;
      }
    }
  }

  &__stack {
    margin-top: auto;
    padding-top: 20px;
    font-size: 11px;
    letter-spacing: 0.04em;
    opacity: 0.6;
    border-top: 1px solid rgba(255, 255, 255, 0.16);
  }
}

/* 右侧表单面板 */
.login-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 44px 44px 32px;
  background-color: var(--atlas-surface);

  // 分栏时品牌信息已在左侧，表单不再重复标题
  :deep(.login-form-comp > div:first-child) {
    display: none;
  }
}

/* 演示账号提示：方便评审直接进入系统 */
.login-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--atlas-text-tertiary);
  background-color: var(--atlas-surface-sunken);
  border: 1px dashed var(--atlas-border-strong);
  border-radius: var(--atlas-radius-sm);

  &__label {
    margin-right: 2px;
  }

  &__sep {
    opacity: 0.5;
  }

  code {
    font-family: SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--atlas-brand);
    background: transparent;
  }
}

/* 窄屏：隐藏品牌面板，表单独占卡片 */
@media (max-width: 899px) {
  .shadow-float {
    width: 440px;
  }

  .login-aside {
    display: none;
  }

  .login-panel {
    padding: 36px 28px 28px;

    :deep(.login-form-comp > div:first-child) {
      display: flex;
    }
  }
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
