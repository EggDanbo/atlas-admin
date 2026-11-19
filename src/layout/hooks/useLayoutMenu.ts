import type { MenuOption } from 'naive-ui'
import type { LayoutMenuReturn } from '@/layout/Injection'
import { isNil } from 'lodash-es'

/**
 * 布局模式
 *
 * 原先是 pro-naive-ui 的类型，这里保留同样的取值，方便配置项与偏好设置复用。
 */
export type ProLayoutMode
  = | 'vertical'
    | 'sidebar'
    | 'horizontal'
    | 'mixed-sidebar'
    | 'full-content'
    | 'mobile'
    | 'two-column'
    | 'mixed-two-column'

export type { LayoutMenuReturn }

type MenuKey = string | number

interface MenuMeta {
  item: MenuOption
  parentKey: MenuKey | null
  childrenKeys: MenuKey[]
}

/**
 * 按布局模式把菜单树拆成「水平 / 垂直」两套 props
 *
 * 这段逻辑原本来自 pro-naive-ui 的 useLayoutMenu，项目只需要其中三种模式
 * （vertical / horizontal / mixed-sidebar），所以重写成一个小实现，
 * 顺带去掉对 pro-naive-ui 的依赖。
 */
export function useLayoutMenu(options: {
  mode: Ref<ProLayoutMode> | ComputedRef<ProLayoutMode>
  menus: ComputedRef<MenuOption[]>
  accordion?: boolean
}) {
  const activeKey = ref<MenuKey | null>(null)
  const expandedKeys = ref<MenuKey[]>([])

  /** key → 菜单项、父 key、子 key，用于算祖先链与高亮 */
  const metaMap = computed(() => {
    const map = new Map<MenuKey, MenuMeta>()

    const walk = (items: MenuOption[], parentKey: MenuKey | null = null) => {
      for (const item of items) {
        if (isNil(item.key))
          continue
        const children = item.children ?? []
        map.set(item.key, {
          item,
          parentKey,
          childrenKeys: children.map(child => child.key).filter((key): key is MenuKey => !isNil(key)),
        })
        if (children.length)
          walk(children, item.key)
      }
    }

    walk(options.menus.value)
    return map
  })

  /** 所有出现过的菜单 key，路由匹配时用 */
  const fullKeys = computed<MenuKey[]>(() => [...metaMap.value.keys()])

  /** 从顶层到自身的 key 链 */
  function getMenuKeyFullPath(key: MenuKey | null): MenuKey[] {
    const path: MenuKey[] = []
    let cursor: MenuKey | null = key

    while (!isNil(cursor)) {
      path.unshift(cursor)
      cursor = metaMap.value.get(cursor)?.parentKey ?? null
    }

    return path
  }

  function getAncestorKeys(key: MenuKey | null) {
    return getMenuKeyFullPath(key).slice(0, -1)
  }

  const sharedHandlers = {
    onUpdateValue: (key: MenuKey) => {
      activeKey.value = key
    },
    onUpdateExpandedKeys: (keys: MenuKey[]) => {
      expandedKeys.value = keys
    },
  }

  /* ---------- 垂直（侧栏）---------- */

  const verticalLayout = computed<LayoutMenuReturn>(() => ({
    horizontalMenuProps: {},
    verticalExtraMenuProps: {},
    verticalMenuProps: {
      mode: 'vertical',
      options: options.menus.value,
      value: activeKey.value,
      expandedKeys: expandedKeys.value,
      ...sharedHandlers,
    },
  }))

  /* ---------- 水平（顶栏）---------- */

  const horizontalLayout = computed<LayoutMenuReturn>(() => ({
    horizontalMenuProps: {
      mode: 'horizontal',
      options: options.menus.value,
      value: activeKey.value,
      responsive: true,
      ...sharedHandlers,
    },
    verticalMenuProps: {},
    verticalExtraMenuProps: {},
  }))

  /* ---------- 混合：一级在顶栏，二级在侧栏 ---------- */

  const mixedSidebarLayout = computed<LayoutMenuReturn>(() => {
    const topKey = getMenuKeyFullPath(activeKey.value)[0] ?? null
    const verticalOptions = topKey ? (metaMap.value.get(topKey)?.item.children ?? []) : []

    return {
      horizontalMenuProps: {
        mode: 'horizontal',
        options: options.menus.value,
        value: topKey,
        responsive: true,
        onUpdateValue: (key: MenuKey) => {
          activeKey.value = key
        },
      },
      verticalMenuProps: {
        mode: 'vertical',
        options: verticalOptions,
        value: activeKey.value,
        expandedKeys: expandedKeys.value,
        ...sharedHandlers,
      },
      verticalExtraMenuProps: {},
    }
  })

  const layout = computed<LayoutMenuReturn>(() => {
    switch (options.mode.value) {
      case 'horizontal':
        return horizontalLayout.value
      case 'mixed-sidebar':
        return mixedSidebarLayout.value
      default:
        return verticalLayout.value
    }
  })

  // 激活项变化时把祖先链展开（手风琴模式下只留当前分支）
  watch(activeKey, (key) => {
    if (isNil(key))
      return
    const ancestors = getAncestorKeys(key)
    const keys = options.accordion ? ancestors : [...expandedKeys.value, ...ancestors]
    expandedKeys.value = Array.from(new Set(keys))
  })

  return {
    activeKey,
    fullKeys,
    getMenuKeyFullPath,
    layout,
    verticalLayout,
    horizontalLayout,
    mixedSidebarLayout,
  }
}
