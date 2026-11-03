import type { Router, RouteRecordRaw } from 'vue-router'
import { projectConfig } from '@/config'
import {
  ERROR_ROUTE_NAME,
  HOME_ROUTE_NAME,
  HOME_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
} from '@/config/page'
import { useI18n } from '@/hooks/help/useI18n'
import { useLoadingBar } from '@/hooks/naiveui/useLoadingBar'
import { errorRoute } from '@/router/base'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useConfigStore } from '@/store/modules/config'
import { useEnumStore } from '@/store/modules/enums'
import { useTabbarStore } from '@/store/modules/tabbar'
import { useUserStore } from '@/store/modules/user'
import userNet from '@/utils/net/user'

import token from '@/utils/token'

const $loadingBar = useLoadingBar()
const whitePathList = [LOGIN_ROUTE_PATH, '/login-v2', '/login-v3'] // no redirect whitelist

// 全局定时器引用，用于清理
let loadingTimer: number | null = null
export function createRouterGuards(router: Router) {
  const routeStore = useAsyncRouteStore()
  const asyncRouteStore = useAsyncRouteStore()
  const configStore = useConfigStore()
  const tabbarStore = useTabbarStore()
  router.beforeEach(async (to, from) => {
    // 清除之前的定时器
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }

    configStore.pageProgress && $loadingBar.start()
    configStore.loading = true
    const isLoginPage = to.path === LOGIN_ROUTE_PATH

    if (
      isLoginPage
      && ['/[...all]', ERROR_ROUTE_NAME].includes(to.name as string)
    ) {
      return HOME_ROUTE_PATH
    }

    // 检查白名单页面
    if (whitePathList.includes(to.path)) {
      return
    }
    // 检查登录状态
    if (!token.get()) {
      // 如果是忽略页面 放行
      if (to.meta.ignoreAuth) {
        return
      }

      // 从登录页面返回到原来页面
      const redirectData: {
        path: string
        replace: boolean
        query?: Recordable
      } = {
        path: LOGIN_ROUTE_PATH,
        replace: true,
      }
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        }
      }
      return redirectData
    }

    await useEnumStore().asyncEnums()

    // 获取用户信息
    const userStore = useUserStore()
    let userInfo = userStore.userInfo
    if (!userInfo?.userid) {
      try {
        await userStore.asyncUserInfo()
        userInfo = userStore.userInfo
        if (import.meta.env.VITE_USE_MOCK.toString() !== 'true') {
          // websocket连接
          userNet.start()
        }
      }
      catch (error) {
        // 加载用户信息失败，如没权限等
        console.log('加载用户信息异常', error)
        return
      }
    }

    // 判断是否已经动态创建了路由
    if (routeStore.getIsAddedRoute) {
      return
    }

    await userStore.asyncPermission()

    // 获取 routes
    if (userInfo) {
      const routes = await routeStore.generateRoutes(
        userStore.isAdmin,
        userStore.userPermissions,
        userStore.allPermissions,
      )

      // 移除无权限的标签页
      // 递归收集所有路由的 name（包括嵌套路由）
      const collectRouteNames = (routesList: RouteRecordRaw[], names: Set<string> = new Set()) => {
        routesList.forEach((route) => {
          if (route.name)
            names.add(route.name.toString())
          if (route.children?.length)
            collectRouteNames(route.children, names)
        })
        return names
      }
      const validRoutes = collectRouteNames(routes)
      const tabsToRemove: string[] = []
      const namesToRemove: string[] = []

      // 更新有效路由名称列表（用于收藏列表显示过滤，不清理存储）
      tabbarStore.updateValidRouteNames([...validRoutes])

      tabbarStore.tabsList.forEach((tab) => {
        // 保留固定标签页
        if (tab.meta?.affix)
          return

        // 检查标签页对应的路由是否在有效路由列表中
        if (!validRoutes.has(tab.name)) {
          tabsToRemove.push(tab.fullPath)
          if (tab.name && tab.meta?.keepAlive) {
            namesToRemove.push(tab.name)
          }
        }
      })

      // 移除无权限的标签页
      if (tabsToRemove.length > 0) {
        tabbarStore.tabsList = tabbarStore.tabsList.filter(
          tab => !tabsToRemove.includes(tab.fullPath),
        )
        // 清理对应的 keepAlive 缓存
        asyncRouteStore.removeKeepAliveComp(namesToRemove)
      }

      // 动态添加可访问路由表
      routes.forEach((item) => {
        router.addRoute(HOME_ROUTE_NAME, item)
      })
      // 添加 404 route
      const isErrorPage = router
        .getRoutes()
        .findIndex(item => item.name === ERROR_ROUTE_NAME)
      if (isErrorPage === -1) {
        router.addRoute(errorRoute)
      }
    }

    // 如果当前页面被移除了（无权限），重定向到首页
    const redirectPath = (from.query.redirect || to.path) as string
    const redirect = decodeURIComponent(redirectPath)

    // 检查当前路由是否有效
    // 通过 router.resolve 检查是否匹配到 404 路由
    const resolved = router.resolve(to.path)
    const isNotFoundRoute = resolved.name === ERROR_ROUTE_NAME
      || (resolved.matched.length > 0 && resolved.matched.at(-1)?.path === '/:pathMatch(.*)*')

    // 如果当前路由无效（匹配到 404），跳转到首页；否则保持原逻辑
    const nextData
      = isNotFoundRoute
        ? { path: HOME_ROUTE_PATH }
        : (to.path === redirect ? { ...to, replace: true } : { path: redirect })
    asyncRouteStore.setIsAddRoute(true)
    $loadingBar?.finish()
    return nextData
  })

  router.afterEach((to) => {
    const { t } = useI18n()
    const { dynamicTitle } = configStore
    const { title: appTitle } = projectConfig.app
    let title = appTitle
    // 开启动态标题，可自行调整逻辑
    if (dynamicTitle) {
      const routeTitle = to.meta?.documentTitle || t(to.meta?.title as string)
      title = routeTitle ? `${routeTitle} - ${appTitle}` : appTitle
    }
    document.title = title as string

    const asyncRouteStore = useAsyncRouteStore()
    // 处理页面缓存
    asyncRouteStore.initKeepAliveComp(to)

    configStore.pageProgress && $loadingBar?.finish()
    // 清除之前的定时器
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    // 设置新的定时器
    loadingTimer = window.setTimeout(() => {
      configStore.loading = false
      loadingTimer = null
    }, 600)
  })
  return router
}
