<script lang="ts" setup>
import type { ProLayoutMode } from 'pro-naive-ui'
import type { LayoutMenuReturn } from '@/layout/Injection'
import { NaIconButton } from '@/components/NaIconButton'
import Breadcrumb from '@/layout/components/Breadcrumb/Breadcrumb.vue'
import { useConfigStore } from '@/store/modules/config'
import CollectPage from '../CollectPage/CollectPage.vue'

const MobileMenu = defineAsyncComponent(() => import('@/layout/components/Menu/Mobile.vue'))

const { mobile, showBreadcrumb, showSidebar, mode } = storeToRefs(useConfigStore())

const verticalLayout = inject<LayoutMenuReturn>('verticalLayout')

const showSidebarHiddenButton = computed(() => {
  if (mobile.value) {
    return false
  }
  const layoutMode = mode.value as ProLayoutMode
  return layoutMode !== 'horizontal'
})
</script>

<template>
  <div
    class="h-full flex items-center gap-1"
  >
    <!-- 手机端菜单 -->
    <MobileMenu
      v-if="mobile || mode === 'mobile'"
      :menu-props="verticalLayout?.verticalMenuProps"
    />
    <!-- 隐藏菜单按钮 -->
    <div v-if="showSidebarHiddenButton" class="ml-2" @click="showSidebar = !showSidebar">
      <NaIconButton :size="21" icon="ant-design:align-left-outlined" :tooltip="showSidebar ? '隐藏菜单' : '显示菜单'" />
    </div>
    <!-- 收藏夹 -->
    <div class="hidden lg:block">
      <CollectPage />
    </div>
    <!-- 面包屑 -->
    <div v-if="showBreadcrumb" class="hidden lg:block">
      <Breadcrumb />
    </div>
  </div>
</template>
