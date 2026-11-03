import type { MenuMixedOption } from 'naive-ui/es/menu/src/interface'
import type { defineComponent } from 'vue'
import type { AppRouteMeta } from '../../../typings/vue-router'

export type Component<T = any>
  = | ReturnType<typeof defineComponent>
    | (() => Promise<typeof import('*.vue')>)
    | (() => Promise<T>)

export type AppMenuOption = Omit<MenuMixedOption, 'meta'> & {
  meta: AppRouteMeta
  children?: AppMenuOption[]
}

/**
 * 动态菜单 返回数据结构
 */
export interface MenuRecordRaw {
  path: string
  name: string
  redirect?: string
  meta: AppRouteMeta
  children?: MenuRecordRaw[]
  component?: string
}
