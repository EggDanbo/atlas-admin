import type { RouteLocationNormalized } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { TABS_ROUTES } from '@/config/common.ts'
import { useGlobSetting } from '@/hooks/setting'
import { useAsyncRouteStore } from '@/store/modules/async-route.ts'
import { useUserStore } from '@/store/modules/user'
import { storage } from '@/utils/storage'

// 不需要出现在标签页中的路由
export const TABBAR_WHITE_LIST = ['Redirect', 'Login']

export type RouteItem = Partial<RouteLocationNormalized> & {
  fullPath: string
  path: string
  name: string
  hash: string
  meta: object
  params: object
  query: object
  key?: string
}

export interface ITabsViewState {
  tabsList: RouteItem[] // 标签页
  myStore: RouteItem[] // 我的收藏
}

// 从路由对象提取简易路由信息
export function getSimpleRoute(route: RouteLocationNormalized): RouteItem {
  const { fullPath, hash, meta, name, params, path, query } = route
  return { fullPath, hash, meta, name: name as string, params, path, query }
}

// 过滤当前路由
function filterCurrentRoute(list: RouteItem[], activeKey) {
  return list.filter(item => item.fullPath !== activeKey)
}

// 保留固定路由
function retainAffixRoute(list: RouteItem[]) {
  return list.filter(item => item?.meta?.affix ?? false)
}

// 筛序最新的
function filterNewTabs(sliceTabs: RouteItem[], tabsList: RouteItem[], activeKey = '') {
  const pathList: string[] = []
  for (const item of sliceTabs) {
    const affix = item?.meta?.affix ?? false
    if (!affix) {
      pathList.push(item.fullPath)
    }
  }
  return tabsList.filter(
    item => item.fullPath === activeKey || !pathList.includes(item.fullPath),
  )
}

export const useTabbarStore = defineStore('tabbar-store', () => {
  const tabsList = ref<RouteItem[]>([])
  const { shortName } = useGlobSetting()
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  // 计算当前用户 ID
  const currentUserId = computed(() => userInfo.value?.userid || '')

  // 计算存储 Key（只有登录后才生成有效 key）
  const favoritesStorageKey = computed(() => {
    if (!currentUserId.value)
      return `${shortName}:tabbar-favorites-guest` // 未登录时使用 guest key
    return `${shortName}:tabbar-favorites-${currentUserId.value}`
  })

  // 使用 VueUse useStorage 管理收藏数据（自动同步 localStorage）
  const favoritesPage = useStorage<RouteItem[]>(favoritesStorageKey, [], localStorage)

  // 当前有效路由名称列表（用于过滤显示）
  const validRouteNames = ref<Set<string>>(new Set())

  // 可见的收藏列表（只显示当前用户有权限访问的收藏，不清理存储）
  const visibleFavoritesPage = computed(() => {
    if (!validRouteNames.value.size)
      return favoritesPage.value // 未加载路由时显示全部
    return favoritesPage.value.filter(
      item => item.name && validRouteNames.value.has(item.name as string),
    )
  })

  // 更新有效路由名称列表（用于显示过滤）
  function updateValidRouteNames(names: string[]) {
    validRouteNames.value = new Set(names)
  }

  // 查找设置缓存name
  function findKeepAliveNames(list) {
    const names = []
    list.forEach((item) => {
      if (item.meta?.keepAlive) {
        names.push(item.name as never)
      }
    })
    return names
  }

  // 从缓存中删除关闭的路由
  function delKeepAliveNames(list) {
    const asyncRouteStore = useAsyncRouteStore()
    const names = findKeepAliveNames(list)
    asyncRouteStore.removeKeepAliveComp(names)
  }

  // 初始化标签页
  function initTabs(routes) {
    tabsList.value = routes
  }

  /**
   * 判断路由是否已收藏
   * @param name 路由名称
   * @returns 是否已收藏
   */
  function isFavorited(name: string): boolean {
    return favoritesPage.value.some(item => item.name === name)
  }

  /**
   * 添加/移除收藏（基于 name 判断）
   * @param route 路由信息
   * @returns 操作后的状态（true=已收藏，false=未收藏）
   */
  function addFavoritesPage(route: RouteItem): boolean {
    if (!route.name || TABBAR_WHITE_LIST.includes(route.name as string)) {
      return false
    }

    const index = favoritesPage.value.findIndex(item => item.name === route.name)
    if (index > -1) {
      // 已存在，移除收藏
      favoritesPage.value.splice(index, 1)
      return false
    }
    // 不存在，添加收藏
    favoritesPage.value.push(route)
    return true
  }

  /**
   * 清理无效收藏（路由中不存在的收藏项）- 仅用户主动调用
   * @param validNames 有效路由名称列表
   * @returns 清理的数量
   */
  function cleanupInvalidFavorites(validNames: string[]): number {
    const before = favoritesPage.value.length
    favoritesPage.value = favoritesPage.value.filter(
      item => item.name && validNames.includes(item.name as string),
    )
    const after = favoritesPage.value.length
    const removed = before - after
    if (removed > 0) {
      console.log(`[收藏清理] 移除了 ${removed} 个无效收藏`)
    }
    return removed
  }

  /**
   * 一键清空所有收藏
   * @returns 清空的数量
   */
  function clearAllFavorites(): number {
    const count = favoritesPage.value.length
    favoritesPage.value = []
    return count
  }

  // 添加标签页
  function addTabs(route: RouteItem): boolean {
    if (TABBAR_WHITE_LIST.includes(route.name as string))
      return false
    const isExists = tabsList.value.some(item => item.fullPath === route.fullPath)
    if (!isExists) {
      tabsList.value.push(route)
    }
    else {
      // 如果是存在的路由，则刷新信息
      const _index = tabsList.value.findIndex(item => item.fullPath === route.fullPath)
      tabsList.value[_index] = route
    }
    return true
  }

  // 关闭左侧
  function closeLeftTabs(route, activeKey) {
    const index = tabsList.value.findIndex(item => item.fullPath === route.value.fullPath)
    if (index > 0) {
      const leftTabs = tabsList.value.slice(0, index)
      const newLeftTabs = filterCurrentRoute(leftTabs, activeKey)
      delKeepAliveNames(newLeftTabs)
      tabsList.value = filterNewTabs(newLeftTabs, tabsList.value, activeKey)
    }
  }

  // 关闭右侧
  function closeRightTabs(route, activeKey) {
    const index = tabsList.value.findIndex(item => item.fullPath === route.value.fullPath)
    if (index >= 0 && index < tabsList.value.length - 1) {
      const rightTabs = tabsList.value.slice(index + 1, tabsList.value.length)
      const newRightTabs = filterCurrentRoute(rightTabs, activeKey)
      delKeepAliveNames(newRightTabs)
      tabsList.value = filterNewTabs(newRightTabs, tabsList.value, activeKey)
    }
  }

  // 关闭其他
  function closeOtherTabs(route, activeKey) {
    const newTabsList = tabsList.value.filter(
      item =>
        ([route.value.fullPath, activeKey].includes(item.fullPath) || item?.meta?.affix) ?? false,
    )
    delKeepAliveNames(newTabsList)
    tabsList.value = newTabsList
  }

  // 关闭当前页
  function closeCurrentTab(route) {
    const index = tabsList.value.findIndex(item => item.fullPath === route.value.fullPath)
    if (index !== -1) {
      delKeepAliveNames([tabsList.value[index]])
      tabsList.value.splice(index, 1)
    }
  }

  // 关闭全部
  function closeAllTabs() {
    delKeepAliveNames(tabsList.value)
    tabsList.value = retainAffixRoute(tabsList.value)
  }

  // 设置标题
  async function setTabTitle(title: string, route: { name?: string, fullPath?: string }) {
    tabsList.value.forEach((item) => {
      if (item.fullPath === route.fullPath) {
        item.meta.title = title
      }
    })
    storage.set(TABS_ROUTES, JSON.stringify(tabsList.value))
  }

  // 设置状态
  async function setTabState(params, route: { name?: string, fullPath?: string }) {
    tabsList.value.forEach((item) => {
      if (item.fullPath === route.fullPath) {
        item.meta = {
          ...item.meta,
          ...params,
        }
      }
    })
    storage.set(TABS_ROUTES, JSON.stringify(tabsList.value))
  }

  return {
    tabsList,
    favoritesPage,
    visibleFavoritesPage,
    initTabs,
    addTabs,
    addFavoritesPage,
    isFavorited,
    updateValidRouteNames,
    cleanupInvalidFavorites,
    clearAllFavorites,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    closeCurrentTab,
    closeAllTabs,
    setTabTitle,
    setTabState,
  }
}, {
  persist: {
    key: 'tabbar-store',
  },
})
