import { isFunction } from 'lodash-es'
import { NBadge } from 'naive-ui'
import { useAsyncRouteStore } from '@/store/modules/async-route'

export type BadgeProps = InstanceType<typeof NBadge>['$props']

interface BadgeState {
  value: string | number | undefined
  visible: boolean
  props: BadgeProps | undefined
  enabled: boolean // 全局控制是否启用 badge
}

const badgeStates = reactive<Record<string, BadgeState>>({})

/**
 * 操作菜单的 badge
 * @param routeName 路由名称
 * @param value badge 值
 */
export function useBadge(routeName?: string, value?: string | number | (() => string | number) | undefined) {
  const asyncRouteStore = useAsyncRouteStore()

  // 初始化 badge 状态
  if (routeName && !(routeName in badgeStates)) {
    const initialValue = isFunction(value) ? value() : unref(value)
    badgeStates[routeName] = {
      value: initialValue,
      visible: initialValue !== undefined && initialValue !== null,
      enabled: true, // 默认启用，允许初始化时显示
      props: undefined,
    }
  }

  /**
   * 渲染 badge 组件
   * @param options badge 属性
   */
  function renderBadge(options?: BadgeProps) {
    return () => {
      // 检查是否应该显示 badge
      if (!routeName)
        return null

      const badgeState = badgeStates[routeName]
      if (!badgeState || !badgeState.enabled)
        return null

      // 判断是否显示数字 badge
      const showValueBadge = badgeState.visible
        && badgeState.value !== undefined
        && badgeState.value !== null

      // 判断是否显示点状 badge
      const showDotBadge = options?.dot === true

      // 只有在需要显示时才渲染 badge 组件
      if (showValueBadge || showDotBadge) {
        return h(NBadge as any, {
          value: badgeState.value,
          show: true,
          ...options,
          ...(badgeState.props || {}),
        })
      }
      return null
    }
  }

  /**
   * 设置 badge
   * @param targetRouteName 目标路由名称
   * @param value badge 值
   * @param props badge 属性
   */
  function setBadge(targetRouteName: string, value: string | number, props?: BadgeProps) {
    // 初始化状态（如果不存在）
    if (!(targetRouteName in badgeStates)) {
      badgeStates[targetRouteName] = {
        value: undefined,
        visible: false,
        enabled: true,
        props: undefined,
      }
    }

    // 更新状态
    badgeStates[targetRouteName]!.value = value
    badgeStates[targetRouteName]!.visible = true
    badgeStates[targetRouteName]!.enabled = true
    if (props) {
      badgeStates[targetRouteName]!.props = props
    }

    // 同步更新菜单数据
    const updateBadgeRecursively = (menus: any[]) => {
      for (const item of menus) {
        if (item.name === targetRouteName) {
          item.meta = { ...item.meta, badge: value }
          return true
        }
        if (item.children?.length) {
          if (updateBadgeRecursively(item.children)) {
            return true
          }
        }
      }
      return false
    }
    updateBadgeRecursively(asyncRouteStore.getMenus)
  }

  /**
   * 清空 badge
   * @param routeName 路由名称
   */
  async function clearBadge(routeName: string) {
    if (!routeName || !(routeName in badgeStates)) {
      return false
    }

    // 禁用整个 badge
    badgeStates[routeName]!.enabled = false
    badgeStates[routeName]!.value = undefined
    badgeStates[routeName]!.visible = false
    badgeStates[routeName]!.props = undefined

    // 同步更新菜单数据
    const updateBadgeRecursively = (menus: any[]) => {
      for (const item of menus) {
        if (item.name === routeName) {
          if (item.meta?.badge !== undefined) {
            delete item.meta.badge
          }
          return true
        }
        if (item.children?.length) {
          if (updateBadgeRecursively(item.children)) {
            return true
          }
        }
      }
      return false
    }

    return updateBadgeRecursively(asyncRouteStore.getMenus)
  }

  return {
    renderBadge,
    clearBadge,
    setBadge,
  }
}
