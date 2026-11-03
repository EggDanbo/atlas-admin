import type { LayoutMenuReturn } from '@/layout/Injection'
import { computed } from 'vue'
import { useConfigStore } from '@/store/modules/config'
import { useThemeStore } from '@/store/modules/theme.ts'

export function useLayout(layout: Ref<LayoutMenuReturn>) {
  const {
    logoLarge,
    sidebarCollapsedWidthWhenShowMenuTitle,
    sidebarCollapsedWidth,
    sidebarCollapsedShowMenuTitle,
    showSidebar,
    collapsed,
    showLogo,
    isMobile,
    mode,
    hideLayoutBorder,
  } = storeToRefs(useConfigStore())

  const { isDark, sidebarTheme, navTheme } = storeToRefs(useThemeStore())

  /**
   * 是否为两栏布局
   */
  const isTwoColumnLayout = computed(() => ['two-column', 'mixed-two-column'].includes(mode.value))

  /**
   * 是否为多栏布局
   */
  const hasHorizontalMenu = computed(() => ['horizontal', 'mixed-two-column', 'mixed-sidebar'].includes(mode.value))

  /**
   * 获取 logo 的样式
   */
  const getLogoClass = computed(() => {
    return logoLarge.value && !collapsed.value && showLogo.value && !isMobile.value ? 'naive-layout-logo-large' : ''
  })

  /**
   * 获取侧边栏主题样式
   */
  const isSidebarDark = computed(() => !isDark.value && ['primary', 'dark'].includes(sidebarTheme.value))

  /**
   * 获取侧边栏主题样式
   */
  const isSidebarPrimary = computed(() => sidebarTheme.value === 'primary')

  /**
   * 顶栏主题色风格
   */
  const isNavPrimary = computed(() => navTheme.value === 'primary')

  /**
   * 顶栏深色风格
   */
  const isNavDark = computed(() => !isDark.value && navTheme.value === 'dark')

  /**
   * 侧边栏折叠后是否显示菜单名
   */
  const showSidebarExtra = computed(() => {
    const verticalExtraMenuOptions = layout.value.verticalExtraMenuProps?.options ?? []
    return verticalExtraMenuOptions.length > 0
  })

  /**
   * 获取侧边栏折叠样式
   */
  const finalShowSidebar = computed(() => {
    const verticalMenuOptions = layout.value.verticalMenuProps.options ?? []
    return showSidebar.value && verticalMenuOptions.length > 0
  })

  /**
   * 获取侧边栏折叠宽度
   */
  const finalSidebarCollapsedWidth = computed(() => {
    return !sidebarCollapsedShowMenuTitle.value
      ? sidebarCollapsedWidth.value
      : sidebarCollapsedWidthWhenShowMenuTitle.value
  })

  /**
   * 设置内置主题样式
   */
  const builtinThemeOverrides = computed(() => {
    const borderColor = isDark.value ? 'rgba(217, 217, 217, 0.1)' : 'rgba(217, 217, 217, 0.4)'
    return {
      borderColor: !hideLayoutBorder.value ? borderColor : 'transparent',
      color: !isDark.value ? '#f0f2f5' : '#101014',
    }
  })

  return {
    builtinThemeOverrides,
    finalSidebarCollapsedWidth,
    finalShowSidebar,
    isTwoColumnLayout,
    hasHorizontalMenu,
    getLogoClass,
    isSidebarDark,
    isSidebarPrimary,
    isNavPrimary,
    isNavDark,
    showSidebarExtra,
  }
}
