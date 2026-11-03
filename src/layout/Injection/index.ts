import type { MenuProps } from 'naive-ui'

export interface LayoutMenuReturn {
  /**
   * 水平菜单数据,一般放在 header 区域
   */
  horizontalMenuProps: MenuProps
  /**
   * 垂直菜单数据,一般放在 sidebar 区域
   */
  verticalMenuProps: MenuProps
  /**
   * 垂直菜单数据,一般放在 sidebar 额外区域
   */
  verticalExtraMenuProps: MenuProps
}

export const LayoutInjectionKey = Symbol('LayoutInjectionKey')
