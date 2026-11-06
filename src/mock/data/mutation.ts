/**
 * mock 写操作落地层
 *
 * engine 原本对 create / update / delete 一律返回一个时间戳，列表刷新后毫无变化。
 * 表单能填、能保存、提示也成功，但保存完什么也没发生 —— 这比没有表单更糟，
 * 因为看的人会以为功能是好的。
 *
 * 这里维护一份内存覆盖层，按模块记录三类改动：
 * - 新增：追加到列表头部，字段原样保留
 * - 编辑：按 id 覆盖对应字段，未提交的字段保持原值
 * - 删除：按 id 从列表里过滤掉
 *
 * 覆盖层挂在模块作用域的内存里，整页刷新会丢（mock 没有后端），
 * 但 SPA 内的新增 → 回列表 → 编辑 → 删除整条链路是自洽的，足够演示。
 */
type Row = Record<string, any>

interface ModuleOverlay {
  /** 新增的行，最新的在前 */
  created: Row[]
  /** 编辑过的行：id -> 变更字段 */
  updated: Map<string, Row>
  /** 已删除的行 id */
  removed: Set<string>
}

const overlays = new Map<string, ModuleOverlay>()
let seed = 0

function overlayOf(module: string): ModuleOverlay {
  let item = overlays.get(module)
  if (!item) {
    item = { created: [], updated: new Map(), removed: new Set() }
    overlays.set(module, item)
  }
  return item
}

/** 生成一个不会与既有数据冲突的 id */
function nextId(module: string): string {
  seed += 1
  return `${module.replace(/\//g, '-')}-n${Date.now().toString(36)}${seed}`
}

/**
 * 给新增行补齐展示所需的派生字段
 *
 * 列表里常有一列是「创建人」「状态」这类默认值，表单不会让人填，
 * 缺了这些字段新增行会显示空白格，看起来像数据没存进去。
 */
function fillDefaults(row: Row): Row {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  for (const key of ['create_time', 'created_at', 'ctime', 'update_time', 'updated_at', 'utime']) {
    if (key in row && !row[key])
      row[key] = key.includes('date') || key === 'ctime' || key === 'utime' ? time : time
  }
  if ('create_date' in row && !row.create_date)
    row.create_date = date

  return row
}

/** 记录一次新增，返回新行 id */
export function recordCreate(module: string, data: Row): string {
  const id = String(data.id || nextId(module))
  const row = fillDefaults({ ...data, id })
  overlayOf(module).created.unshift(row)
  return id
}

/** 记录一次编辑，返回行 id */
export function recordUpdate(module: string, id: string, data: Row): string {
  const item = overlayOf(module)
  // 编辑的可能是刚新增还没提交过的行，直接改原对象即可
  const created = item.created.find(row => String(row.id) === String(id))
  if (created) {
    Object.assign(created, data)
    return id
  }
  item.updated.set(String(id), { ...(item.updated.get(String(id)) ?? {}), ...data })
  return id
}

/** 记录一次删除 */
export function recordDelete(module: string, id: string): void {
  const item = overlayOf(module)
  const index = item.created.findIndex(row => String(row.id) === String(id))
  if (index >= 0)
    item.created.splice(index, 1)
  else
    item.removed.add(String(id))
}

/**
 * 把写操作的参数翻译成「新增 / 编辑 / 删除」
 *
 * 页面保存时传的是整份表单，action 只说明是 save 还是 update，
 * 真正是新增还是编辑要看有没有带 id。
 */
export function applyMutation(module: string, action: string, params: Row): string {
  const data = { ...params }
  const id = String(data.id ?? data.key ?? '')

  if (action === 'delete' || action === 'remove') {
    if (id)
      recordDelete(module, id)
    return id
  }

  if (action === 'create' || (action === 'save' && !id))
    return recordCreate(module, data)

  if (id)
    return recordUpdate(module, id, data)
  return recordCreate(module, data)
}

/** 单行叠加：编辑覆盖 + 删除过滤 */
function mergeRow(module: string, row: Row, overlay: ModuleOverlay): Row | null {
  const id = String(row.id ?? '')
  if (id && overlay.removed.has(id))
    return null
  const patch = id ? overlay.updated.get(id) : undefined
  return patch ? { ...row, ...patch } : row
}

/** 关键字与年份筛选，与各模块 paginate 的口径保持一致 */
function matches(row: Row, params: Row): boolean {
  const keyword = String(params.filter ?? '').trim()
  if (keyword && !Object.values(row).some(value => typeof value === 'string' && value.includes(keyword)))
    return false

  const year = Number(params.year)
  if (Number.isFinite(year) && year > 1900 && 'year' in row && Number(row.year) !== year)
    return false

  return true
}

/**
 * 给模块返回的分页对象叠加写操作结果
 *
 * 只处理带 list 的分页对象，总览/看板这类聚合结果原样返回。
 * 新增行只插在第一页：翻到第 3 页还看到刚建的单据会显得分页是假的。
 */
export function withMutation(module: string, payload: any, params: Row): any {
  if (!payload || !Array.isArray(payload.list))
    return payload

  const overlay = overlayOf(module)
  if (!overlay.created.length && !overlay.updated.size && !overlay.removed.size)
    return payload

  const list = payload.list
    .map((row: Row) => mergeRow(module, row, overlay))
    .filter((row: Row | null): row is Row => !!row)

  const page = Number(payload.page) || 1
  const pagesize = Number(payload.pagesize) || list.length || 30
  // 新增行只挂第一页；它们仍要过一遍关键字筛选，否则搜「恒通」也冒出别的新客户
  const visible = page === 1 ? overlay.created.filter(row => matches(row, params)) : []
  const merged = page === 1 ? [...visible, ...list] : list
  // 删掉的行要从总数里扣：只在当前页扣得准，但总比「删了还显示原数量」可信。
  // 不扣的话分页会一直停在最后一页一个空列表上，看起来像删出了 bug
  const removedInPage = payload.list.length - list.length
  const totalcount = Math.max(
    merged.length,
    Number(payload.totalcount ?? list.length) - removedInPage + (page === 1 ? visible.length : 0),
  )

  return {
    ...payload,
    list: merged.slice(0, pagesize),
    totalcount,
    totalpages: Math.max(1, Math.ceil(totalcount / pagesize)),
  }
}

/** 供测试或重置使用 */
export function resetMutation(): void {
  overlays.clear()
  seed = 0
}
