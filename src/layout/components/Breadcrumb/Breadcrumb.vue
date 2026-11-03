<script lang="ts" setup>
import type { RouteLocationMatched, RouteRecordNameGeneric } from 'vue-router'
import type { AppRouteMeta } from '../../../../typings/vue-router'
import { NaIcon } from '@/components/NaIcon'
import { getRender, SpRender } from '@/components/SpRender'
import { useGo } from '@/hooks/help/usePage'
import { RedirectName } from '@/router/base'
import { useConfigStore } from '@/store/modules/config'

const { showBreadcrumb, showBreadcrumbIcon } = storeToRefs(useConfigStore())

const route = useRoute()
const go = useGo()

// 定义面包屑项的类型
interface BreadcrumbItem {
  label?: string
  key: RouteRecordNameGeneric
  disabled: boolean
  props: {
    onClick: () => void
  }
  icon: (() => VNode) | null
  children?: BreadcrumbItem[]
  meta?: AppRouteMeta
  name?: string
}

// 判断是否为重定向路由
const isRedirectRoute = computed(() => {
  return route.name === RedirectName || route.path.includes('/redirect/')
})

// 保存上一次非重定向路由的面包屑数据
const cachedBreadcrumbList = ref<BreadcrumbItem[]>([])

const generator: any = (routerMap: RouteLocationMatched[]) => {
  return routerMap
    .filter(item => item.path !== '/')
    .map((item) => {
      const currentMenu = {
        ...item,
        label: item.meta.title,
        key: item.name,
        disabled: item.path === '/',
        props: {
          onClick: () => {
            go(item as any, false)
          },
        },
        // 修改这里：处理 dropdown 中的图标渲染
        icon: showBreadcrumbIcon.value && item.meta.icon
          ? () => h(NaIcon, { icon: item.meta.icon })
          : null,
      }
      // 是否有子菜单，并递归处理
      if (item.children && item.children.length > 0) {
        currentMenu.children = generator(item.children)
      }
      return currentMenu
    })
}

// 使用单个 watch 处理所有逻辑
watch(
  () => route.matched,
  (matched) => {
    // 如果不是重定向路由，则更新缓存
    if (!isRedirectRoute.value) {
      cachedBreadcrumbList.value = generator(matched)
    }
  },
  { immediate: true },
)

// 面包屑列表：重定向时使用缓存，否则使用当前生成的
const breadcrumbList = computed(() => {
  return isRedirectRoute.value ? cachedBreadcrumbList.value : generator(route.matched)
})
</script>

<template>
  <n-breadcrumb v-if="showBreadcrumb">
    <template v-for="routeItem in breadcrumbList" :key="routeItem.name">
      <n-breadcrumb-item v-if="routeItem.meta?.hideBreadcrumb !== false">
        <n-dropdown v-if="routeItem.children?.length" :options="routeItem.children">
          <span class="link-text">
            <NaIcon
              v-if="showBreadcrumbIcon && routeItem.meta.icon" :icon="routeItem.meta.icon"
              class="mr-1"
            />
            <SpRender :ref="`renderDom_${routeItem.name}`" :value="getRender(routeItem.meta.title)" />
          </span>
        </n-dropdown>
        <span v-else class="link-text">
          <NaIcon
            v-if="showBreadcrumbIcon && routeItem.meta.icon" :icon="routeItem.meta.icon"
            class="mr-1"
          />
          <SpRender :ref="`renderDom_${routeItem.name}`" :value="getRender(routeItem.meta.title)" />
        </span>
      </n-breadcrumb-item>
    </template>
  </n-breadcrumb>
</template>
