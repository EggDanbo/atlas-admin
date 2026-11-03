import type { VNodeChild } from 'vue'
import 'vue-router'

export declare interface AppRouteMeta {
  /*
   * 标题
   */
  title?: string
  /*
   * 图标
   */
  icon?: string
  /*
   * 排序
   */
  sort?: number
  /*
   * 在菜单中隐藏
   */
  hidden?: boolean | undefined
  /*
   * 禁用菜单
   */
  disabled?: boolean
  /*
   * 菜单徽章
   */
  badge?: string | number | (() => string | number)
  /*
   * 徽章颜色
   */
  badgeColor?: string
  /*
   * 标记是否显示为点
   */
  badgeDot?: boolean
  /*
   * 导航徽章 类型
   */
  badgeType?: 'default' | 'success' | 'error' | 'warning' | 'info'
  /*
   * 菜单额外的信息
   */
  extra?: string | (() => VNodeChild)
  /*
   * TODD 布局
   */
  layout?: string | boolean
  /*
   * 权限
   */
  permissions?: string[]
  /*
   * 外链
   */
  link?: string
  /*
   * 是否在新窗口打开
   */
  openInNewWindow?: boolean
  /*
   * 在面包屑中隐藏
   */
  hideBreadcrumb?: boolean
  /*
   * 固定不可关闭
   */
  affix?: boolean
  /*
   * 是否缓存
   */
  keepAlive?: boolean
  /*
   * 激活的菜单名称 路由 `path`
   */
  activePath?: string
  /*
   * iframe 嵌套的链接
   */
  frameSrc?: string
  /*
   * 是否显示在标签页
   */
  tagView?: boolean
  /*
   * 是否验证所有权限
   */
  authEvery?: boolean
  /*
   * 网页标题 优先 title 字段
   */
  documentTitle?: string
}

// 扩展 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {}
}

declare module 'vue-router/auto-routes' {
  export interface AutoRoute extends RouteRecordRaw {
    meta?: AppRouteMeta // 复用之前扩展的 RouteMeta
  }
}

export { }
