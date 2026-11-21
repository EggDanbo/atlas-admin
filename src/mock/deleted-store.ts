/**
 * 删除记忆
 *
 * mock 的数据是每次请求现生成的，删掉一条刷新就回来了，看不出效果。
 * 这里记住「哪些 id 被删过」，列表返回时过滤掉，删除才算真的生效；
 * 撤销时把 id 放回去，行就回来了。
 */
const deleted = new Map<string, Set<string>>()

function bucket(module: string) {
  let set = deleted.get(module)
  if (!set) {
    set = new Set<string>()
    deleted.set(module, set)
  }
  return set
}

export function markDeleted(module: string, id: unknown) {
  if (id === undefined || id === null || id === '')
    return
  bucket(module).add(String(id))
}

export function unmarkDeleted(module: string, id: unknown) {
  if (id === undefined || id === null || id === '')
    return
  bucket(module).delete(String(id))
}

export function isDeleted(module: string, id: unknown) {
  return bucket(module).has(String(id))
}

/** 列表返回前把删掉的行剔除；顺带修一下总数 */
export function filterDeleted(module: string, data: any): any {
  const set = deleted.get(module)
  if (!set?.size || !data || typeof data !== 'object')
    return data

  const next: Recordable = { ...data }
  let removed = 0

  for (const key of ['list', 'records', 'rows', 'items']) {
    const rows = next[key]
    if (!Array.isArray(rows))
      continue
    const kept = rows.filter(row => !set.has(String(row?.id)))
    removed += rows.length - kept.length
    next[key] = kept
  }

  if (removed && typeof next.total === 'number')
    next.total = Math.max(0, next.total - removed)

  return next
}

export function clearDeleted() {
  deleted.clear()
}
