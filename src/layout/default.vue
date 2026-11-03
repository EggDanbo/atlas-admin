<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { isNil } from 'lodash-es'
import { useThemeVars } from 'naive-ui'
import { ProLayout, useLayoutMenu } from 'pro-naive-ui'
import { BizDetailHost } from '@/components/BizDetailHost'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useConfigStore } from '@/store/modules/config'
import { useThemeStore } from '@/store/modules/theme'
import { useUserStore } from '@/store/modules/user'
import { isSafari } from '@/utils/brower'
import { formatSizeValue } from '@/utils/style'
import { Logo, MainView, NavCenter, NavLeft, NavRight, Sidebar, SidebarExtra, Tabbar } from './components/index'
import { useLayout } from './hooks/useLayout'

const userStore = useUserStore()

const safariPlatform = isSafari()

// 异步组件优化加载
const Footer = defineAsyncComponent(() => import('./components/Footer/Footer.vue'))
const PreferencesFloatBtn = defineAsyncComponent(() => import('./components/Preferences/components/FloatBtn.vue'))
const RollbackMode = defineAsyncComponent(() => import('./components/RollbackMode/RollbackMode.vue'))

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
  footerHeight,
  sidebarWidth,
  tabbarHeight,
  borderRadius,
  preferencesLocation,
  tabbarStyle,
} = storeToRefs(useConfigStore())
const themeVars = useThemeVars()
const route = useRoute()
const asyncRouteStore = useAsyncRouteStore()
const menusList = computed<MenuOption[]>(() => asyncRouteStore.getMenus as MenuOption[])

const isThemeSkin = computed(() => themeType.value === 'skin' && themeSkin.value)

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
  builtinThemeOverrides,
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
    <ProLayout
      v-model:collapsed="collapsed"
      v-model:mode="mode"
      :builtin-theme-overrides="builtinThemeOverrides"
      :footer-fixed="footerFixed"
      :footer-height="footerHeight"
      :is-mobile="mobile"
      :logo-class="getLogoClass"
      :nav-fixed="navFixed"
      :nav-height="navHeight"
      :style="excerptThemeVars"
      :show-footer="showFooter"
      :show-logo="showLogo"
      :show-nav="showNav"
      :show-sidebar="finalShowSidebar"
      :show-sidebar-extra="showSidebarExtra"
      :show-tabbar="finalShowTabbar"
      :sidebar-collapsed-width="finalSidebarCollapsedWidth"
      :sidebar-width="sidebarWidth"
      :tabbar-height="tabbarHeight"
      content-class="naive-layout-main"
      footer-class="naive-layout-footer"
      header-class="naive-layout-header"
      :scrollbar-props="{
        // @ts-ignore
        class: [safariPlatform && 'naive-layout__scrollbar--safari', mobile && '!mr-0'],
        themeOverrides: {
          width: '7px',
          borderRadius: `${formatSizeValue(borderRadius, 'rem')}`,
        },
      }"
      :tabbar-class="['naive-layout-tabbar', `naive-layout-tabbar-${tabbarStyle}`]"
      :aside-class="[`${isSidebarPrimary ? 'naive-layout-sidebar sidebar-primary' : 'naive-layout-sidebar'}`]"
      :nav-class="[`${isNavPrimary && !isDark ? 'naive-layout-nav nav-primary' : 'naive-layout-nav'}`]"
    >
      <template #logo>
        <div
          :class="{
            'pl-2': mode === 'mobile' || mobile,
          }"
          class="h-full flex items-center"
        >
          <Logo />
        </div>
      </template>
      <template #nav-left>
        <NavLeft />
      </template>
      <template #nav-center>
        <NavCenter />
      </template>
      <template #nav-right>
        <NavRight />
      </template>
      <template #sidebar>
        <Sidebar />
      </template>
      <template #sidebar-extra>
        <SidebarExtra />
      </template>
      <template #tabbar>
        <Tabbar />
      </template>
      <template #footer>
        <Footer />
      </template>
      <!-- 主内容区域 -->
      <template #default>
        <div
          :class="{
            'px-2.5': ['mixed-sidebar', 'horizontal', 'full-content', 'sidebar'].includes(mode) || !intervalLayout || mobile,
            '!pt-0': finalShowTabbar && tabbarStyle === 'card',
          }"
          class="box-border size-full pt-2.5"
          style="height: calc(100vh - 106px);"
        >
          <MainView />
        </div>
      </template>
    </ProLayout>
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
  </div>
</template>

<style lang="less" scoped>
@import './styles/layout.less';
</style>
