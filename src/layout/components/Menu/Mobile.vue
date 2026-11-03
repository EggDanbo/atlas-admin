<script lang="ts" setup>
import type { MenuOption, MenuProps } from 'naive-ui'
import type { AppMenuOption } from '@/router/types'
import { Icon } from '@iconify/vue'
import Logo from '@/layout/components/Logo/Logo.vue'
import { useConfigStore } from '@/store/modules/config'
import { buildUrl, ProMenu } from './index'

defineProps({
  menuProps: {
    type: Object as PropType<MenuProps>,
  },
})

// 预编译正则表达式：用于匹配外部链接
const HTTP_LINK_REGEX = /https?:/

const openDrawer = ref(false)
const router = useRouter()
const currentRoute = useRoute()

const { collapsed, sidebarMenuDivider, sidebarMenuGroup } = storeToRefs(useConfigStore())

function handleCollapsed() {
  openDrawer.value = !openDrawer.value
}

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
  <n-button circle class="ml-2" quaternary @click="handleCollapsed">
    <template #icon>
      <n-icon>
        <Icon icon="ant-design:align-left-outlined" />
      </n-icon>
    </template>
  </n-button>
  <n-drawer v-model:show="openDrawer" :width="250" placement="left">
    <n-drawer-content :native-scrollbar="false" body-content-style="padding:0">
      <template #header>
        <Logo source="mobile" />
      </template>
      <ProMenu :collapsed="false" v-bind="menuProps" :options="handleMenuGroupAndDivider(menuProps.options)" @update:value="pageGo" />
    </n-drawer-content>
  </n-drawer>
</template>
