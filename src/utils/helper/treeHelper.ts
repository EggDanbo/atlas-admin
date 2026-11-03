interface TreeHelperConfig {
  id: string
  children: string
  pid: string
}
const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'pid',
}

const getConfig = (config: Partial<TreeHelperConfig>) => Object.assign({}, DEFAULT_CONFIG, config)

export function filter<T = any>(tree: T[], func: (n: T) => boolean): T[] {
  const children = 'children'

  function listFilter(list: T[]): T[] {
    return list
      .map((node: T) => ({ ...node }))
      .filter((node) => {
        node[children] = (node[children] as T[] | undefined) && listFilter(node[children] as T[])
        return func(node) || ((node[children] as T[] | undefined)?.length ?? 0) > 0
      })
  }

  return listFilter(tree)
}

export function forEach<T = any>(
  tree: T[],
  func: (n: T) => boolean | void,
  config: Partial<TreeHelperConfig> = {},
): void {
  config = getConfig(config)
  const list: T[] = [...tree]
  const { children } = config
  for (let i = 0; i < list.length; i++) {
    // func 返回true就终止遍历，避免大量节点场景下无意义循环，引起浏览器卡顿
    if (func(list[i])) {
      return
    }
    children && (list[i] as any)[children] && list.splice(i + 1, 0, ...(list[i] as any)[children])
  }
}

export function findNodeAll<T = any>(
  tree: T[],
  func: (n: T) => boolean | void,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config)
  const { children } = config
  const list: T[] = [...tree]
  const result: T[] = []
  for (const node of list) {
    if (func(node)) {
      result.push(node)
    }
    const nodeChildren = node[children as keyof T] as T[] | undefined
    if (nodeChildren) {
      list.push(...nodeChildren)
    }
  }
  return result
}

export function findPath<T = any>(
  tree: T[],
  func: (n: T) => boolean | void,
  config: Partial<TreeHelperConfig> = {},
): T[] | null {
  config = getConfig(config)
  const path: T[] = []
  const list = [...tree]
  const visitedSet = new Set()
  const { children } = config
  while (list.length) {
    const node = list[0]
    if (visitedSet.has(node)) {
      path.pop()
      list.shift()
    }
    else {
      visitedSet.add(node)
      ;(node as any)[children!] && list.unshift(...(node as any)[children!])
      path.push(node)
      if (func(node)) {
        return path
      }
    }
  }
  return null
}

/**
 * 获取 Tree 中 value
 * @param data 树形数据结构
 * @param key 树形中 key 字段
 * @param keys
 */
export function getTreeValues<T = any>(data: T[], key = 'key', keys: T[] = []): T[] {
  data.forEach((item: any) => {
    !keys.includes(item[key]) && keys.push(item[key])
    if (item.children && item.children.length) {
      const subValue = getTreeValues(item.children, key)
      subValue.length && keys.push(...subValue)
    }
  })
  return keys
}
