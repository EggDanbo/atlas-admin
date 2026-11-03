/**
 * mock 模块内部类型
 *
 * 项目全局类型（AppInfo / SystemEnums 等）定义在 typings/global.d.ts 中，
 * 这里做一次显式再导出，便于 mock 目录内引用。
 */

export interface SystemEnumItem {
  name: string
  label: string
  value: string
}

export interface SystemEnums {
  name: string
  items: SystemEnumItem[]
}
