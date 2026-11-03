import type { RouteRecordRaw } from 'vue-router'
import type { MenuRecordRaw } from '@/router/types'
import { Layout } from '@/router/base'

// type AsyncComponent = () => Promise<{ default: DefineComponent }>

const Iframe = () => import('@/views/needs/iframe/index.vue')
const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>()

LayoutMap.set('LAYOUT', Layout)
LayoutMap.set('IFRAME', Iframe)

/**
 * 格式化 后端 结构信息并递归生成层级路由表
 * @param menuList
 * @param parent
 */
export function routerGenerator(menuList: MenuRecordRaw[], parent?: MenuRecordRaw | RouteRecordRaw): RouteRecordRaw[] {
  return menuList.map((item: MenuRecordRaw) => {
    // 判断是否为子路由（parent存在且item.path不以/开头）
    const isChildRoute = parent && !item.path.startsWith('/')
    const currentRouter = {
      // 如果是子路由，保持相对路径；否则构建绝对路径
      path: isChildRoute ? item.path : `${(parent && parent.path) || ''}/${item.path}`.replace('//', '/'),
      name: item.name || '',
      component: item.component as unknown as RouteRecordRaw['component'],
      meta: {
        ...item.meta,
      },
    } as RouteRecordRaw
    // 添加 redirect 属性（如果存在）
    if (item.redirect) {
      currentRouter.redirect = item.redirect
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)

    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // 如果未定义 redirect 默认第一个子路由为 redirect
      !item.redirect && (currentRouter.redirect = `${item.path}/${item.children[0]!.path}`)
      // Recursion
      currentRouter.children = routerGenerator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 动态生成路由
 */
export function getAsyncRoutes(): Promise<RouteRecordRaw[]> {
  return new Promise((resolve) => {
    const routeList = routerGenerator([])
    asyncImportRoute(routeList)
    resolve(routeList)
    // fetchMenus().then((res) => {
    //   const routeList = routerGenerator([])
    //   asyncImportRoute(routeList)
    //   resolve(routeList)
    // }).catch((err) => {
    //   reject(err)
    // })
  })
}
/**
 * 查找views中对应的组件文件
 */
export function asyncImportRoute(routes: RouteRecordRaw[] | undefined): void {
  // 排除内置文件预览页：该页面仅开发模式注册（见 router/static/none.ts），
  // 生产由独立 file-viewer 服务承接；不排除的话 glob 会把它连同 @file-viewer 依赖打进生产包
  const viewsModules: Record<string, () => Promise<Recordable>> = import.meta.glob([
    '../../views/**/*.{vue,tsx}',
    '!../../views/preview/**',
  ])
  if (!routes)
    return
  routes.forEach((item) => {
    if (!item.component && item.meta?.frameSrc) {
      item.component = Iframe
    }
    if (item.component && !item.meta?.frameSrc) {
      item.component = dynamicImport(viewsModules, item.component as RouteRecordRaw['component'])
    }
    item.children && asyncImportRoute(item.children)
  })
}

/**
 * 动态导入对应的视图模块。
 * @param viewsModules 一个记录，键是模块路径，值是返回模块Promise的函数。
 * @param component 需要动态导入的组件名称。
 * @returns 如果找到恰好一个匹配的模块，则返回该模块的Promise。如果找到多个匹配模块，会打印警告并不返回任何内容。
 */
export function dynamicImport(
  viewsModules: Record<string, () => Promise<Recordable>>,
  component: string | RouteRecordRaw['component'],
) {
  // 获取所有模块的键
  const keys = Object.keys(viewsModules)
  // 筛选出与component匹配的键
  const matchKeys = keys.filter((key) => {
    let k = key.replace('../../views', '') // 移除固定的视图路径前缀
    const lastIndex = k.lastIndexOf('.') // 找到文件扩展名的最后一个点
    k = k.substring(0, lastIndex) // 移除文件扩展名
    return k === component // 检查是否匹配组件名称
  })

  // 处理找到的匹配模块
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0]!
    return viewsModules[matchKey] // 返回匹配到的模块的Promise
  }

  // 如果找到多个匹配模块，打印警告
  if (matchKeys?.length > 1) {
    console.warn(
      'Please do not create `.vue` and `.TSX` files with the same file name in the same hierarchical directory under the views folder. This will cause dynamic introduction failure',
    )
  }
}
