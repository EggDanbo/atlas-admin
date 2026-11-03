<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import type { ProLayoutMode } from 'pro-naive-ui'
import type { LayoutMenuReturn } from '@/layout/Injection'
import type { AppMenuOption } from '@/router/types'
import CollapsedBtn from '@/layout/components/CollapsedBtn/CollapsedBtn.vue'
import { buildUrl, ProMenu } from '@/layout/components/Menu'
import { useConfigStore } from '@/store/modules/config'

// 预编译正则表达式
const HTTP_LINK_REGEX = /https?:/

const currentRoute = useRoute()
const router = useRouter()
const layout = inject<LayoutMenuReturn>('layout')

const {
  collapsed,
  mode,
  showSidebarCollapsed,
  sidebarCollapsedWidth,
  sidebarCollapsedShowMenuTitle,
  sidebarMenuDivider,
  sidebarMenuGroup,
} = storeToRefs(useConfigStore())

const showSidebarCollapseButton = computed(() => {
  if (!showSidebarCollapsed.value)
    return false
  const layoutMode = mode.value as ProLayoutMode
  return layoutMode === 'vertical'
    || layoutMode === 'sidebar'
    || layoutMode === 'mixed-sidebar'
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
  <n-scrollbar class="flex-[1_0_0]">
    <ProMenu
      :collapsed-show-title="sidebarCollapsedShowMenuTitle"
      :collapsed-width="sidebarCollapsedWidth"
      v-bind="layout?.verticalMenuProps"
      :options="handleMenuGroupAndDivider(layout?.verticalMenuProps.options)"
      @update:value="pageGo"
    />
  </n-scrollbar>
  <div v-if="showSidebarCollapseButton" class="sidebar-footer">
    <div :class="{ 'justify-center': collapsed }" class="flex justify-end py-2">
      <CollapsedBtn :class="{ 'mr-3': !collapsed }" />
    </div>
  </div>
</template>
