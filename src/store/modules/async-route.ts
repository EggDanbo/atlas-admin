import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'
import type { AppMenuOption } from '@/router/types'
import { defineStore, storeToRefs } from 'pinia'
import { computed, nextTick, ref, toRaw } from 'vue'
import { asyncRoutes, router } from '@/router'
import { getAsyncRoutes } from '@/router/create'
import { washMenuFields } from '@/router/helper'
import { useConfigStore } from '@/store/modules/config'
import { matchPermit } from '@/utils/permission'

interface TreeHelperConfig {
  id: string
  children: string
  pid: string
}

const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'pid',
}

let reloadPageTimer: number | null = null
const getConfig = (config: Partial<TreeHelperConfig>) => Object.assign({}, DEFAULT_CONFIG, config)
function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config)
  const children = config.children as string

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children])
        return func(node) || (node[children] && node[children].length)
      })
  }

  return listFilter(tree)
}

/**
 * 修复过滤后的路由 redirect 指向
 * 当子路由因无权限被移除后，将父路由的 redirect 更新到第一个可访问的子路由，避免 404
 */
function fixRedirects(routes: RouteRecordRaw[], parentPath: string = ''): void {
  for (const route of routes) {
    const currentPath = route.path.startsWith('/')
      ? route.path
      : parentPath
        ? `${parentPath}/${route.path}`
        : route.path

    if (route.children && route.children.length > 0) {
      // 先递归修复子路由
      fixRedirects(route.children, currentPath)

      // 检查当前路由的 redirect 是否需要修复
      if (route.redirect && typeof route.redirect === 'string') {
        const redirectTarget = route.redirect
        // 跳过外部链接
        if (/^https?:\/\//.test(redirectTarget))
          continue

        // 收集所有直接子路由的完整路径
        const availableChildPaths = route.children.map(child =>
          currentPath
            ? `${currentPath}/${child.path}`.replace(/\/+/g, '/')
            : child.path,
        )

        // 如果 redirect 目标不在剩余的子路由中，修复到第一个可用子路由
        if (!availableChildPaths.includes(redirectTarget)) {
          route.redirect = availableChildPaths[0]
        }
      }
    }
  }
}

export const useAsyncRouteStore = defineStore('async-route-store', () => {
  const routers = ref<RouteRecordRaw[]>([])
  const menus = ref<AppMenuOption[]>([])
  const isAddRoute = ref(false)
  const keepAliveComp = ref<string[]>([])
  const reloadFlag = ref(true)

  const getIsAddedRoute = computed(() => isAddRoute.value)
  const getRouters = computed(() => routers.value)
  const getMenus = computed(() => menus.value)
  const getKeepAliveComp = computed(() => keepAliveComp.value)
  /**
   * 页面刷新重载（真正的刷新）
   * 清除当前页面的 keep-alive 缓存，然后重新挂载组件
   */
  async function reloadPage(delay = 200) {
    // 清除之前的定时器
    if (reloadPageTimer) {
      clearTimeout(reloadPageTimer)
      reloadPageTimer = null
    }

    const currentRoute = router.currentRoute.value

    // 获取当前组件名（用于清除 keep-alive 缓存）
    const componentName = currentRoute.matched
      .find(item => item.name === currentRoute.name)
      ?.name as string

    // 1. 清除当前页面的 keep-alive 缓存
    if (componentName && keepAliveComp.value.includes(componentName)) {
      removeKeepAliveComp([componentName])
    }

    // 2. 显示加载状态，触发组件卸载
    reloadFlag.value = false
    window.$loadingBar?.start()
    await nextTick()

    // 恢复组件的通用逻辑
    const restoreComponent = () => {
      // 3. 如果当前页面需要缓存，重新添加到缓存列表
      if (componentName && currentRoute.meta?.keepAlive) {
        keepAliveComp.value.push(componentName)
      }
      reloadFlag.value = true
      window.$loadingBar?.finish()
    }

    if (delay) {
      reloadPageTimer = window.setTimeout(restoreComponent, delay)
      return
    }

    restoreComponent()
  }

  /**
   * 初始化缓存的组件
   * @param to
   */
  function initKeepAliveComp(to: RouteLocationNormalizedGeneric) {
    const name = (to.matched.find(item => item.name === to.name)?.name || '') as string
    if (name && !keepAliveComp.value.includes(name) && to.meta?.keepAlive) {
      keepAliveComp.value.push(name)
    }
  }

  /**
   * 添加路由
   * @param routes
   */
  function addRoutes(routes: RouteRecordRaw[]) {
    routers.value = routes
  }

  /**
   * 添加菜单
   * @param values
   */
  function addMenus(values: AppMenuOption[]) {
    menus.value = values
  }

  /**
   * 设置路由
   * @param value
   */
  function setRouters(value: RouteRecordRaw[]) {
    routers.value = value
  }
  /**
   * 设置菜单
   * @param value
   */
  function setMenus(value: AppMenuOption[]) {
    menus.value = value
  }

  /**
   * 设置是否添加路由
   * @param value
   */
  function setIsAddRoute(value: boolean) {
    isAddRoute.value = value
  }

  /**
   * 设置缓存的组件
   * @param value
   */
  function setKeepAliveComp(value: string[]) {
    keepAliveComp.value = value
  }

  /*
  * 移除缓存的组件
  * */
  function removeKeepAliveComp(compNames: string[]) {
    if (!compNames || !compNames.length)
      return
    keepAliveComp.value = keepAliveComp.value.filter(item => !compNames.includes(item))
  }

  /*
  * 生成路由菜单
  * */
  async function generateRoutes(isAdmin: boolean, userPermissions: string[], allPermissions: Auth.Permission[]) {
    let accessedRouters: RouteRecordRaw[] = []
    const { permissionMode } = storeToRefs(useConfigStore())
    const routeFilter = (route: RouteRecordRaw) => {
      const { meta } = route
      const { permissions, authEvery } = meta || {}
      if (!permissions)
        return true
      if (isAdmin)
        return true
      if (authEvery === true) {
        return userPermissions.every(item => permissions.includes(item))
      }
      if (allPermissions.length === 0)
        return true
      return matchPermit(permissions, userPermissions, allPermissions)
    }
    if (permissionMode.value === 'BACK') {
      // 动态获取菜单
      try {
        accessedRouters = await getAsyncRoutes()
      }
      catch {
        // 拉取菜单失败时保留空路由，由页面自行提示
      }
    }
    else {
      try {
        // 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
        accessedRouters = filter(asyncRoutes, routeFilter)
      }
      catch {
        // 拉取菜单失败时保留空路由，由页面自行提示
      }
    }
    accessedRouters = accessedRouters.filter(routeFilter)
    // 修复 redirect 指向，避免因权限过滤导致 404
    fixRedirects(accessedRouters)
    setRouters(accessedRouters)
    setMenus(washMenuFields(accessedRouters))
    return toRaw(accessedRouters)
  }

  return {
    routers,
    menus,
    isAddRoute,
    keepAliveComp,
    getIsAddedRoute,
    getRouters,
    getMenus,
    getKeepAliveComp,
    generateRoutes,
    initKeepAliveComp,
    addRoutes,
    addMenus,
    setIsAddRoute,
    setKeepAliveComp,
    removeKeepAliveComp,
    reloadPage,
    reloadFlag,
  }
})
