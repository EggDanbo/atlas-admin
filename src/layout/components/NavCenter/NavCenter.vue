<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import type { LayoutMenuReturn } from '@/layout/Injection'
import type { AppMenuOption } from '@/router/types'
import { buildUrl, ProMenu } from '@/layout/components/Menu'
import { useConfigStore } from '@/store/modules/config'

// 预编译正则表达式：用于匹配外部链接
const HTTP_LINK_REGEX = /https?:/

const currentRoute = useRoute()
const router = useRouter()
const { mobile } = storeToRefs(useConfigStore())
const layout = inject<LayoutMenuReturn>('layout')

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
</script>

<template>
  <div
    v-show="!mobile"
    class="h-full flex items-center"
  >
    <ProMenu
      location="nav"
      v-bind="layout?.horizontalMenuProps"
      @update:value="pageGo"
    />
  </div>
</template>
