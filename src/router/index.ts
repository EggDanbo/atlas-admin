import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { ERROR_ROUTE_NAME } from '@/config/page'

import { createRouterGuards } from '@/router/guard'
import { staticRoutes } from './static'

const routeModuleList: RouteRecordRaw[] = []

interface ModuleType {
  [key: string]: unknown
}

const modules: Record<string, { default: ModuleType }> = import.meta.glob(
  './modules/**/*.ts',
  { eager: true },
)

Object.keys(modules).forEach((key) => {
  const mod = modules[key]!.default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

function sortRoute(a: RouteRecordRaw, b: RouteRecordRaw) {
  return (a.meta?.sort || 0) - (b.meta?.sort || 0)
}

routeModuleList.sort(sortRoute)

// 需要验证权限
export const asyncRoutes = [...routeModuleList]

// 创建路由实例
export const router = createRouter({
  // BASE_URL 由 vite 的 base 决定，与资源前缀天然一致；
  // 部署到子路径（如 GitHub Pages 的 /atlas-admin/）时不会出现路由与静态资源各走一套
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
  strict: true,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
  },
})

// 重置路由
export function resetRouter() {
  asyncRoutes.forEach((item) => {
    if (item.name && router.hasRoute(item.name)) {
      item.name && router.removeRoute(item.name)
    }
  })
  router.removeRoute(ERROR_ROUTE_NAME)
}

export function setupRouter(app: App) {
  app.use(router)
  // 创建路由守卫
  return createRouterGuards(router)
}
