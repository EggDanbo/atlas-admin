<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { isNil } from 'lodash-es'
import { useThemeVars } from 'naive-ui'
import { BizDetailHost } from '@/components/BizDetailHost'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useConfigStore } from '@/store/modules/config'
import { useThemeStore } from '@/store/modules/theme'
import { useUserStore } from '@/store/modules/user'
import { Logo, MainView, NavCenter, NavLeft, NavRight, Sidebar, SidebarExtra, Tabbar } from './components/index'
import { useLayout } from './hooks/useLayout'
import { useLayoutMenu } from './hooks/useLayoutMenu'

const userStore = useUserStore()

// 异步组件优化加载
const Footer = defineAsyncComponent(() => import('./components/Footer/Footer.vue'))
const PreferencesFloatBtn = defineAsyncComponent(() => import('./components/Preferences/components/FloatBtn.vue'))
const RollbackMode = defineAsyncComponent(() => import('./components/RollbackMode/RollbackMode.vue'))
const DemoSwitch = defineAsyncComponent(() => import('./components/DemoSwitch/DemoSwitch.vue'))

const { isDark, themeType, themeSkin, headerLucency, sidebarLucency, containerLucency } = storeToRefs(useThemeStore())
const {
  intervalLayout,
  mode,
  mobile,
  tablet,
  showNav,
  showLogo,
  navFixed,
  navHeight,
  collapsed,
  showFooter,
  showTabbar,
  footerFixed,
  tabbarHeight,
  sidebarWidth,
  preferencesLocation,
  tabbarStyle,
} = storeToRefs(useConfigStore())
const themeVars = useThemeVars()
const route = useRoute()
const asyncRouteStore = useAsyncRouteStore()
const menusList = computed<MenuOption[]>(() => asyncRouteStore.getMenus as MenuOption[])

const isThemeSkin = computed(() => themeType.value === 'skin' && themeSkin.value)

// 只有跑在 mock 数据上时才显示演示开关，接真实后端时自动隐藏
const showDemoSwitch = computed(() => String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false')

// 只有跑在 mock 数据上时才显示演示开关，接真实后端时自动隐藏

// 平板/手机不显示多标签栏，但平板保持桌面布局形态
const finalShowTabbar = computed(() => showTabbar.value && !tablet.value && !mobile.value)

// 摘取主体变量，挂载到 Layout 上面
const excerptThemeVars = computed(() => {
  return {
    '--primary-color': themeVars.value.primaryColor,
    '--card-color': themeVars.value.cardColor,
    '--border-radius': themeVars.value.borderRadius,
  }
})

const {
  layout,
  activeKey,
  fullKeys,
  verticalLayout,
} = useLayoutMenu({ mode, menus: menusList })

provide('layout', layout)
provide('verticalLayout', verticalLayout)

/**
 * 路由切换时，设置当前激活的菜单 key
 */
watch(() => route.path, (path) => {
  if (activeKey.value === path) {
    return
  }
  // 处理高亮指定 菜单 path（空字符串表示不高亮任何菜单）
  if (route.meta?.activePath !== undefined) {
    activeKey.value = route.meta.activePath as string
    return
  }
  const key = findAvailableMenuKey()
  if (isNil(key)) {
    console.warn('This looks like a bug, please open an issue to report this problem')
    return
  }
  activeKey.value = key!
}, { immediate: true })

const getSkinImg = computed(() => {
  return new URL(`/src/assets/images/skins/${themeSkin.value}-bg.jpg`, import.meta.url).pathname
})

/**
 * 获取当前激活的菜单 key
 */
function findAvailableMenuKey() {
  const keys = fullKeys.value
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const item = route.matched[i]!
    if (keys.includes(item.path)) {
      return item.path
    }
  }
}

const {
  getLogoClass,
  finalSidebarCollapsedWidth,
  finalShowSidebar,
  showSidebarExtra,
  isSidebarDark,
  isSidebarPrimary,
  isNavPrimary,
  isNavDark,
} = useLayout(layout)
</script>

<template>
  <div
    :class="{
      'hide-tabbar': !finalShowTabbar,
      'sidebar-dark': isSidebarDark,
      'nav-dark': isNavDark,
      'interval-style': intervalLayout,
      'light-layout': !isDark,
      'dark-layout': isDark,
      'header-lucency': headerLucency,
      'sidebar-lucency': sidebarLucency,
      'container-lucency': containerLucency,
      'theme-skin': isThemeSkin,
    }"
    class="naive-layout"
  >
    <!-- 主题皮肤 -->
    <div
      v-if="isThemeSkin"
      class="naive-layout-skin"
      :style="`background-image: url(${getSkinImg}); background-size: 100% 100%`"
    />
    <n-layout
      has-sider
      class="naive-layout-body"
      :style="{
        ...excerptThemeVars,
        // Tabbar.vue 内部用这个变量算高度，pro-naive-ui 移除后需要自己给
        '--pro-layout-tabbar-height': `${tabbarHeight}px`,
      }"
    >
      <!-- 侧栏模式：logo 在侧栏顶部 -->
      <n-layout-sider
        v-if="finalShowSidebar"
        :collapsed="collapsed"
        :collapsed-width="finalSidebarCollapsedWidth"
        :width="sidebarWidth"
        :native-scrollbar="false"
        :show-trigger="false"
        :class="isSidebarPrimary ? 'naive-layout-sidebar sidebar-primary' : 'naive-layout-sidebar'"
        @update:collapsed="(value: boolean) => (collapsed = value)"
      >
        <div class="naive-layout-sidebar-inner">
          <div
            v-if="showLogo"
            :class="getLogoClass"
            class="naive-layout-logo"
            :style="{ height: `${navHeight}px` }"
          >
            <Logo />
          </div>
          <Sidebar />
          <div v-if="showSidebarExtra" class="naive-layout-sidebar-extra">
            <SidebarExtra />
          </div>
        </div>
      </n-layout-sider>

      <n-layout class="naive-layout-container" :native-scrollbar="false">
        <!-- 顶栏 -->
        <n-layout-header
          v-if="showNav"
          :class="[
            isNavPrimary && !isDark ? 'naive-layout-header nav-primary' : 'naive-layout-header',
            navFixed && 'is-nav-fixed',
          ]"
          :style="{ height: `${navHeight}px` }"
        >
          <NavLeft />
          <NavCenter />
          <NavRight />
        </n-layout-header>

        <Tabbar v-if="finalShowTabbar" />

        <!-- 主内容区 -->
        <n-layout-content class="naive-layout-main" :native-scrollbar="false">
          <div
            :class="{
              'px-2.5': ['mixed-sidebar', 'horizontal', 'full-content', 'sidebar', 'vertical'].includes(mode) || !intervalLayout || mobile,
              '!pt-0': finalShowTabbar && tabbarStyle === 'card',
            }"
            class="box-border size-full pt-2.5"
          >
            <MainView />
          </div>
        </n-layout-content>

        <div v-if="showFooter" :class="{ 'footer-fixed': footerFixed }" class="naive-layout-footer">
          <Footer />
        </div>
      </n-layout>
    </n-layout>
    <!-- 偏好设置 -->
    <PreferencesFloatBtn v-if="mode !== 'full-content' && preferencesLocation === 'fixed'" />
    <!-- 全屏水印 -->
    <n-watermark
      v-if="userStore.userInfo?.watermark"
      :content="`${userStore.userInfo?.name} ${(userStore.userInfo?.mobile_number || '').slice(-4)}`"
      :font-size="16"
      :height="384"
      :line-height="16"
      :rotate="-45"
      :width="384"
      :x-offset="12"
      :y-offset="60"
      :z-index="9999"
      cross
      fullscreen
    />
    <!-- 回滚布局模式 -->
    <RollbackMode v-if="mode === 'full-content'" />
    <!-- 业务详情弹窗宿主 -->
    <BizDetailHost />
    <!-- 演示模式切换：正常 / 空数据 / 接口异常 -->
    <DemoSwitch v-if="showDemoSwitch" />
    <!-- 演示模式切换：正常 / 空数据 / 接口异常 -->
    <DemoSwitch v-if="showDemoSwitch" />
  </div>
</template>

<style lang="less" scoped>
@import './styles/layout.less';
</style>
