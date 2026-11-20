/**
 * 演示模式
 *
 * 演示时经常需要现场切换「有数据 / 没数据 / 接口挂了」三种状态，
 * 手删数据或改代码都太慢。这里在 mock 层加一个开关，所有请求统一响应。
 */
export type DemoMode = 'normal' | 'empty' | 'error'

const STORAGE_KEY = 'atlas:demo-mode'

let mode: DemoMode = 'normal'

/** 从 localStorage 读一次（刷新后保持上次的选择） */
export function initDemoMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as DemoMode | null
    if (saved === 'empty' || saved === 'error' || saved === 'normal')
      mode = saved
  }
  catch {
    // 隐私模式下忽略
  }
}

export function getDemoMode(): DemoMode {
  return mode
}

export function setDemoMode(next: DemoMode) {
  mode = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  }
  catch {
    // 同上
  }
}

initDemoMode()

/** 把列表类数据清空，模拟「一条数据都没有」 */
export function emptyLike(data: any): any {
  if (Array.isArray(data))
    return []

  if (!data || typeof data !== 'object')
    return data

  const next: Recordable = { ...data }

  for (const key of ['list', 'records', 'rows', 'items', 'data', 'children']) {
    if (Array.isArray(next[key]))
      next[key] = []
  }

  for (const key of ['total', 'totalCount', 'count']) {
    if (typeof next[key] === 'number')
      next[key] = 0
  }

  return next
}
