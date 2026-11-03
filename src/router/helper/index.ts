import type { RouteRecordRaw } from 'vue-router'
import type { BadgeProps } from './useBadge'
import type { AppMenuOption } from '@/router/types'
import { cloneDeep } from 'lodash-es'
import { LOGIN_ROUTE_PATH } from '@/config/page'
import { createIcon } from '@/utils/iconify'
import { useBadge } from './useBadge'
/**
 * 排除Router
 */
export function filterRouter(routerMap: Array<any>) {
  return routerMap.filter((item) => {
    return (
      (item.meta?.hidden || false) !== true
      && !['/:path(.*)*', '/', LOGIN_ROUTE_PATH].includes(item.path)
    )
  })
}

/**
 * 清洗菜单字段
 * 排除 component 和 components 字段
 * @param list
 * @param parentPath
 */
export function washMenuFields(list: RouteRecordRaw[], parentPath: string = ''): AppMenuOption[] {
  return filterRouter(list).reduce((result, item) => {
    // 拼接完整路径
    const fullPath = parentPath ? `${parentPath}/${item.path}` : item.path
    const { name, meta } = item
    const menu: AppMenuOption = {
      label: meta?.title,
      key: fullPath,
      name: name as string,
      icon: meta?.icon ? createIcon(meta.icon) : undefined,
      hidden: meta?.hidden,
      meta: meta
        ? {
            ...meta,
            icon: meta.icon ? createIcon(meta.icon) : undefined,
          }
        : {},
    }
    // 处理菜单禁用
    if (meta && meta.disabled === true) {
      menu.disabled = true
    }
    // 处理 badge
    const { renderBadge } = useBadge(name as string, meta?.badge)
    const badgeProps: BadgeProps = {
      ...(meta?.badgeDot !== undefined && { dot: meta.badgeDot }),
      ...(meta?.badgeType !== undefined && { type: meta.badgeType }),
      ...(meta?.badgeColor !== undefined && { color: meta.badgeColor }),
    }
    // 自定义实现 extra
    menu._extraRender = renderBadge(badgeProps)
    // 如果有 extraRender 优先使用
    if (meta.extra) {
      menu._extraRender = meta.extraRender
    }
    // 如果存在子路由，递归处理
    if (item.children && item.children.length > 0) {
      menu.children = washMenuFields(item.children, fullPath) as any
    }
    // 当 singleCollapse 为 true 且过滤后仅剩 1 个可见子菜单时，直接提升子菜单（折叠父级）
    if (meta?.singleCollapse === true && menu.children?.length === 1) {
      result.push(menu.children[0])
    }
    else {
      result.push(menu)
    }
    return result
  }, [] as AppMenuOption[])
}

/**
 * 判断路由是否超过2级
 */
export function isMultipleRoute(routeModule: AppMenuOption) {
  if (!routeModule || !Reflect.has(routeModule, 'children') || !routeModule.children?.length) {
    return false
  }
  const children = routeModule.children

  let isFlag = false
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!
    if (child.children?.length) {
      isFlag = true
      break
    }
  }
  return isFlag
}

/**
 * 拍平多级菜单
 */
export function clapMultipleRoute(routeModules: AppMenuOption[]) {
  const modules: AppMenuOption[] = cloneDeep(routeModules)
  for (let i = 0; i < modules.length; i++) {
    const routeModule = modules[i]!
    if (!isMultipleRoute(routeModule)) {
      continue
    }
    routeModule.children = castToFlatRoute(routeModule.children, '')
  }
  return modules
}

/**
 * 将子路由转换为扁平化路由数组（仅一级）
 * @param {待转换的子路由数组} routes
 * @param {父级路由路径} parentPath
 */
export function castToFlatRoute(routes, parentPath, flatRoutes: any[] = []) {
  for (const item of routes) {
    if (item.children && item.children.length > 0) {
      if (item.redirect && item.redirect !== 'noRedirect') {
        flatRoutes.push({
          ...item,
        })
      }
      castToFlatRoute(item.children, `${parentPath}/${item.path}`, flatRoutes)
    }
    else {
      flatRoutes.push({
        ...item,
      })
    }
  }
  return flatRoutes
}
