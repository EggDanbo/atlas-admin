import type { Router } from 'vue-router'
import type { RouteItem } from '@/store/modules/tabbar'
import { unref } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useTabbarStore } from '@/store/modules/tabbar'

export function useTabbar(_router?: Router) {
  const asyncRouteStore = useAsyncRouteStore()
  const tabbarStore = useTabbarStore()
  const router = _router || useRouter()

  interface StateParame {
    state?: string
    dialogOptions?: object
  }

  const { currentRoute } = router

  /** 默认是操作当前页面 也可以传入 router */
  function getCurrentTab() {
    const route = unref(currentRoute)
    return tabbarStore.tabsList.find(
      item => item.path === route.path,
    )!
  }

  /** 获取当前标签标题 */
  function getTitle(tab?: RouteItem) {
    const targetTab = tab || getCurrentTab()
    // 优先从 tab 获取，获取不到则从当前路由获取
    if (targetTab?.meta?.title)
      return targetTab.meta.title as string
    // fallback: 直接从当前路由获取
    const route = unref(currentRoute)
    return (route.meta?.title as string) || ''
  }

  /** 获取当前标签权限 */
  function getPermission(tab?: RouteItem) {
    const targetTab = tab || getCurrentTab()
    // 优先从 tab 获取，获取不到则从当前路由获取
    if (targetTab?.meta?.permissions?.[0])
      return targetTab.meta.permissions[0]
    // fallback: 直接从当前路由获取
    const route = unref(currentRoute)
    return route.meta?.permissions?.[0] || ''
  }

  /** 更新tab标题 */
  async function updateTabTitle(title: string, tab?: { name?: string, fullPath?: string }) {
    const targetTab = tab || getCurrentTab()
    await tabbarStore.setTabTitle(title, targetTab)
  }

  /** 关闭当前页面 */
  function closeCurrentTab() {
    tabbarStore.closeCurrentTab(currentRoute)
    asyncRouteStore.removeKeepAliveComp([currentRoute.value.name as string])
    const _currentRoute
      = tabbarStore.tabsList[Math.max(0, tabbarStore.tabsList.length - 1)]
    router && router.push(_currentRoute!)
  }

  /** 更新tab状态 */
  async function setTabState(params: StateParame, tab?: RouteItem) {
    const targetTab = tab || getCurrentTab()
    await tabbarStore.setTabState(params, targetTab)
  }

  /** 清除状态 done */
  function clearTabState() {
    setTabState({
      state: 'done',
    })
  }

  /** 添加undone状态 */
  function addTabState() {
    setTabState({
      state: 'undone',
      dialogOptions: {
        content: '页面尚未提交，是否关闭？',
      },
    })
  }

  return {
    getCurrentTab,
    closeCurrent: () => closeCurrentTab(),
    setTitle: (title: string, tab?: { name?: string, fullPath?: string }) => updateTabTitle(title, tab),
    setTabState,
    getTitle,
    getPermission,
    clearTabState,
    addTabState,
  }
}
