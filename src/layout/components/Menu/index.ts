import type { MenuOption } from 'naive-ui'

export { default as ProMenu } from './Menu.vue'
export { proMenuProps, type ProMenuProps } from './props'

export type MenuKey = string | number

export type ExpandedKeysHandler = ((keys: MenuKey[]) => void) | Array<(keys: MenuKey[]) => void>

/**
 * 构建完整的URL
 * @param path 路径
 * @param markOpened 是否标记为已打开，避免死循环
 */
export function buildUrl(path: string, markOpened = false) {
  const { hash, origin } = window.location || {}
  let fullPath = path.startsWith('/') ? path : `/${path}`
  if (markOpened) {
    // 添加opened标记，避免死循环
    fullPath += fullPath.includes('?') ? '&opened=true' : '?opened=true'
  }
  return `${origin}${hash ? '/#' : ''}${fullPath}`
}

/**
 * 比较两个键数组是否相同
 * @param keys
 * @param targetKeys
 */
export function isSameKeys(keys: MenuKey[], targetKeys: MenuKey[]) {
  if (keys.length !== targetKeys.length) {
    return false
  }
  return keys.every((key, index) => key === targetKeys[index])
}

/**
 * 查找菜单项的键路径
 * @param targetKey
 * @param menus
 * @param parents
 */
export function findMenuKeyPath(
  targetKey: MenuKey,
  menus: MenuOption[] = [],
  parents: MenuKey[] = [],
): MenuKey[] {
  for (const item of menus) {
    const key = item.key as MenuKey | undefined
    if (key === undefined) {
      continue
    }
    const currentPath = [...parents, key]
    if (key === targetKey) {
      return currentPath
    }
    if (item.children?.length) {
      const childPath = findMenuKeyPath(targetKey, item.children as MenuOption[], currentPath)
      if (childPath.length > 0) {
        return childPath
      }
    }
  }

  return []
}

/**
 * 规范化单分支展开的键
 */
export function normalizeSingleBranchExpandedKeys(options: {
  currentExpandedKeys?: MenuKey[]
  keys: MenuKey[]
  keepKeys?: MenuKey[]
  menus?: MenuOption[]
  enabled: boolean
}) {
  const {
    currentExpandedKeys = [],
    keys,
    keepKeys = [],
    menus = [],
    enabled,
  } = options
  if (!enabled) {
    return keys
  }
  if (keepKeys.length > 0) {
    return [...keepKeys]
  }
  const openedKey = keys.find(key => !currentExpandedKeys.includes(key))
  if (openedKey === undefined) {
    return keys
  }
  const openedPath = findMenuKeyPath(openedKey, menus)
  if (openedPath.length > 0) {
    return openedPath
  }
  return [openedKey]
}
