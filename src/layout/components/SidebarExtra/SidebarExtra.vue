<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import type { ProLayoutMode } from 'pro-naive-ui'
import type { LayoutMenuReturn } from '@/layout/Injection'
import type { AppMenuOption } from '@/router/types'
import { projectConfig } from '@/config'
import { useConfigStore } from '@/store/modules/config'
import CollapsedBtn from '../CollapsedBtn/CollapsedBtn.vue'
import { buildUrl, ProMenu } from '../Menu'

// 预编译正则表达式：用于匹配外部链接
const HTTP_LINK_REGEX = /https?:/

const { app: AppConfig } = projectConfig
const currentRoute = useRoute()
const router = useRouter()
const layout = inject<LayoutMenuReturn>('layout')

const {
  collapsed,
  mode,
  showSidebarCollapsed,
  sidebarCollapsedWidth,
  sidebarCollapsedShowMenuTitle,
  sidebarCollapsedWidthWhenShowMenuTitle,
  sidebarMenuGroup,
  sidebarMenuDivider,
} = storeToRefs(useConfigStore())

const finalSidebarCollapsedWidth = computed(() => {
  return !sidebarCollapsedShowMenuTitle.value
    ? sidebarCollapsedWidth.value
    : sidebarCollapsedWidthWhenShowMenuTitle.value
})

const showSidebarExtraCollapseButton = computed(() => {
  if (!showSidebarCollapsed.value)
    return false
  const layoutMode = mode.value as ProLayoutMode
  return layoutMode === 'two-column'
    || layoutMode === 'mixed-two-column'
})

function pageGo(key: string, item: MenuOption) {
  const appMenuItem = item as unknown as AppMenuOption
  if (appMenuItem.meta?.link && HTTP_LINK_REGEX.test(appMenuItem.meta?.link)) {
    window.open(appMenuItem.meta?.link)
  }
  else if (appMenuItem.meta?.openInNewWindow) {
    window.open(buildUrl(appMenuItem.key as string))
  }
  else {
    if (key === currentRoute.name)
      return
    router.push(key)
  }
}

function handleMenuGroupAndDivider(menus: MenuOption[] = []) {
  let finalMenus: MenuOption[] = menus
  // 处理菜单分割线
  if (sidebarMenuDivider.value) {
    finalMenus = finalMenus.flatMap((item) => {
      return item.children?.length ? [item, { type: 'divider' }] : [item]
    })
  }
  // 处理菜单分组
  if (sidebarMenuGroup.value) {
    if (collapsed.value) {
      finalMenus = finalMenus.flatMap((item) => {
        return item.children?.length ? [...item.children] : [item]
      })
    }
    else {
      finalMenus = finalMenus.map((item) => {
        return item.children?.length ? { ...item, type: 'group' } : item
      })
    }
  }
  return finalMenus
}
</script>

<template>
  <div
    v-if="!collapsed"
    class="sidebar-extra-logo flex justify-center"
  >
    <n-gradient-text
      class="ml-2 text-2xl"
    >
      {{ AppConfig.title }}
    </n-gradient-text>
  </div>
  <n-scrollbar class="flex-[1_0_0]">
    <ProMenu
      :collapsed-show-title="sidebarCollapsedShowMenuTitle"
      :collapsed-width="finalSidebarCollapsedWidth"
      v-bind="layout?.verticalExtraMenuProps"
      :options="handleMenuGroupAndDivider(layout?.verticalExtraMenuProps.options)"
      @update:value="pageGo"
    />
  </n-scrollbar>
  <div v-if="showSidebarExtraCollapseButton" class="sidebar-footer">
    <div :class="{ 'justify-center': collapsed }" class="box-border flex justify-end py-2">
      <CollapsedBtn :class="{ 'mr-3': !collapsed }" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.sidebar-extra-logo {
  padding: 12px 0;
  border-bottom: 1px solid rgba(217, 217, 217, 0.1);
}
</style>
