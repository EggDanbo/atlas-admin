/**
 * 从 src/views 中提取 mock 所需的业务字段结构
 *
 * 提取内容：
 * 1. 每个视图目录声明的数据格式名（format: 'atlas/asset/bill'）
 * 2. 列表列字段（columns.ts 与 index.vue 中 columns 数组里的 field/title）
 * 3. 表单字段（detail.vue 等表单配置中的 field/path/label）
 * 4. 全局字段标题词典（同名取出现最多的中文标题）
 *
 * 产物：src/mock/schema/schema.generated.ts
 *
 * 用法：node scripts/mock/extract-schema.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const VIEWS_DIR = path.join(ROOT, 'src/views')
const OUTPUT = path.join(ROOT, 'src/mock/schema/schema.generated.ts')

const VIEW_EXTS = new Set(['.vue', '.ts'])
const CN_RE = /[\u4E00-\u9FA5]/

/** 非业务字段：操作按钮、查询参数、内部字段 */
const JUNK_FIELDS = new Set([
  'd1',
  'pdf',
  'excel',
  'print',
  'sheet',
  'transform',
  'list',
  'files',
  'processes',
  'filelist',
  'links',
  'attach',
  'format',
  'filter',
  'searchfilter',
  'searchorder',
  'ids',
  'page',
  'pagesize',
  'print_setting',
  'reset',
  'totalenabled',
  'hcolumn',
  'isoperate',
  'istotal',
  'isview',
  'isprint',
  'ismerge',
  'isfilter',
  'sortable',
  'width',
  'align',
  'fixed',
  'type',
  'search',
  'disablefilter',
  'enums',
  'enumstype',
  'mergecompare',
  'title',
  'label',
  'value',
  'key',
  'name2',
  'cuid',
  'rid',
  'seq',
])

/** 非业务字段前缀 */
const JUNK_PREFIX = ['opt_', 'is_', 'has_', 'show_', 'can_', 'set_', '_']

function isBusinessField(field) {
  if (!field || field.length < 2)
    return false
  if (JUNK_FIELDS.has(field.toLowerCase()))
    return false
  return !JUNK_PREFIX.some(p => field.startsWith(p))
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      walk(full, acc)
    else if (VIEW_EXTS.has(path.extname(entry.name)))
      acc.push(full)
  }
  return acc
}

function normalize(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1 ')
}

/** 提取 `columns: [ ... ]` 代码块内容（支持任意起始索引） */
function extractBlock(source, startIndex) {
  let depth = 0
  let i = startIndex
  let started = false
  while (i < source.length) {
    const ch = source[i]
    if (ch === '[') {
      depth++
      started = true
    }
    else if (ch === ']') {
      depth--
      if (started && depth === 0)
        return source.slice(startIndex, i + 1)
    }
    i++
  }
  return source.slice(startIndex)
}

/** 提取以 startIndex 处 `{` 开始的对象字面量 */
function extractObjectBlock(source, startIndex) {
  let depth = 0
  let i = startIndex
  while (i < source.length) {
    const ch = source[i]
    if (ch === '{')
      depth++
    else if (ch === '}') {
      depth--
      if (depth === 0)
        return source.slice(startIndex, i + 1)
    }
    i++
  }
  return source.slice(startIndex)
}

/**
 * 剔除 columns 数组中标记为操作列的对象（isOperate: true）
 *
 * 这类列由页面自身渲染（排序按钮、操作按钮等），服务端 dataformat 不再下发，
 * 否则同一 field 会在表格里出现两次。
 */
function stripOperateColumns(text) {
  const out = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '{') {
      const block = extractObjectBlock(text, i)
      out.push(/isOperate\s*:\s*true/.test(block) ? ' '.repeat(block.length) : block)
      i += block.length
      continue
    }
    out.push(text[i])
    i++
  }
  return out.join('')
}

/** 在给定文本中收集 字段 -> 标题 配对 */
function pairFieldsWithTitles(text, sink) {
  const fieldMatches = []
  const fieldRe = /(?:\bfield|\bpath|\bcolumn)\s*:\s*(['"])([A-Za-z_$][\w$]*)\1/g
  let m
  while ((m = fieldRe.exec(text))) {
    fieldMatches.push({ field: m[2], index: m.index })
  }

  const titleMatches = []
  const titleRe = /(?:\btitle|\blabel)\s*:\s*(['"])([^'"\n]{1,30})\1/g
  while ((m = titleRe.exec(text))) {
    if (CN_RE.test(m[2]) && m[2] !== '操作' && m[2] !== '序号')
      titleMatches.push({ title: m[2], index: m.index })
  }

  for (const f of fieldMatches) {
    let best = null
    for (const t of titleMatches) {
      const [from, to] = f.index < t.index ? [f.index, t.index] : [t.index, f.index]
      if (to - from > 400)
        continue
      // 中间若出现同级字段声明，说明已跨对象
      const between = text.slice(from, to)
      if (/\b(?:field|path|column)\s*:/.test(between.slice(1)) || /\btitle\s*:/.test(between.slice(1)))
        continue
      const gap = to - from
      if (!best || gap < best.gap)
        best = { title: t.title, gap }
    }
    if (best)
      sink.set(f.field, best.title)
  }
}

/** 收集 createFormModel 等模型字段名 */
function collectModelFields(source) {
  const fields = new Set()
  const re = /function\s+create\w*(?:Model|Form|Query)\w*\s*\(\s*\)\s*(?::\s*[^{]+\s*)?\{\s*return\s*\{/g
  let m
  while ((m = re.exec(source))) {
    const start = m.index + m[0].length
    let depth = 1
    let i = start
    while (i < source.length && depth > 0) {
      if (source[i] === '{')
        depth++
      else if (source[i] === '}')
        depth--
      i++
    }
    const body = source.slice(start, i)
    const keyRe = /^\s{4,}([A-Za-z_$][\w$]*)\s*:/gm
    let k
    while ((k = keyRe.exec(body)))
      fields.add(k[1])
  }
  return fields
}

function collectFormats(source) {
  const formats = new Set()
  const re = /\bformat\s*:\s*(['"`])([^'"`\n]{2,80})\1/g
  let m
  while ((m = re.exec(source))) {
    const value = m[2].trim()
    if (/^[\w-]+\/[\w-]+(\/[\w-]+)*$/.test(value))
      formats.add(value)
  }
  return formats
}

// ===== 主流程 =====
const files = walk(VIEWS_DIR)
const dirMap = new Map()
const globalTitles = new Map()

function bucketOf(dir) {
  if (!dirMap.has(dir)) {
    dirMap.set(dir, {
      formats: new Set(),
      columnFields: new Map(),
      formFields: new Map(),
      models: new Set(),
    })
  }
  return dirMap.get(dir)
}

for (const file of files) {
  const rel = path.relative(VIEWS_DIR, file)
  const dir = path.dirname(rel).split(path.sep).join('/')
  if (dir === '.' || dir.includes('components'))
    continue

  const raw = fs.readFileSync(file, 'utf8')
  const source = normalize(raw)
  const bucket = bucketOf(dir)

  for (const f of collectFormats(source))
    bucket.formats.add(f)

  // 全局词典（用原始文本以便识别注释外的标题）
  pairFieldsWithTitles(source, globalTitles)

  // 列表列：columns.ts 全文件；index.vue 中的 columns 数组
  const base = path.basename(file)
  if (base === 'columns.ts' || base === 'columns.js') {
    pairFieldsWithTitles(stripOperateColumns(source), bucket.columnFields)
  }
  else if (base === 'index.vue') {
    const re = /\bcolumns\s*:\s*\[/g
    let m
    while ((m = re.exec(source))) {
      const blockStart = m.index + m[0].length - 1
      const block = extractBlock(source, blockStart)
      if (/['"]default['"]|h\(|slots/.test(block))
        pairFieldsWithTitles(stripOperateColumns(block), bucket.columnFields)
    }
  }

  // 表单字段：其余文件全部纳入
  pairFieldsWithTitles(source, bucket.formFields)
  for (const field of collectModelFields(source))
    bucket.models.add(field)
}

// ===== 收集路由权限码 =====
function collectRoutePermissions() {
  const routerDir = path.join(ROOT, 'src/router/modules')
  const codes = new Set()
  if (!fs.existsSync(routerDir))
    return []

  for (const entry of fs.readdirSync(routerDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts'))
      continue
    const source = normalize(fs.readFileSync(path.join(routerDir, entry.name), 'utf8'))
    const re = /permissions\s*:\s*\[([^\]]*)\]/g
    let m
    while ((m = re.exec(source))) {
      for (const item of m[1].matchAll(/'([A-Z0-9_]+)'|"([A-Z0-9_]+)"/g)) {
        const code = item[1] || item[2]
        if (code)
          codes.add(code)
      }
    }
  }
  return [...codes].sort()
}

const routePermissions = collectRoutePermissions()

// ===== 组织输出 =====
const schema = {}
const formatOwner = {}
const titleDict = {}

for (const [field, title] of globalTitles) {
  if (isBusinessField(field))
    titleDict[field] = title
}

for (const [dir, bucket] of [...dirMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const pick = (map) => [...map.entries()]
    .filter(([field]) => isBusinessField(field))
    .map(([field, title]) => ({ field, title }))

  const columnFields = pick(bucket.columnFields)
  const formFields = pick(bucket.formFields)
  const modelFields = [...bucket.models]
    .filter(isBusinessField)
    .map(field => ({ field, title: globalTitles.get(field) || '' }))

  const fields = [...columnFields, ...formFields, ...modelFields]
  const seen = new Set()
  const merged = []
  for (const item of fields) {
    if (seen.has(item.field))
      continue
    seen.add(item.field)
    merged.push({ field: item.field, title: item.title || titleDict[item.field] || '' })
  }

  const formats = [...bucket.formats]
  schema[dir] = {
    formats,
    columnFields,
    fields: merged,
  }
  for (const fmt of formats) {
    if (!formatOwner[fmt])
      formatOwner[fmt] = dir
  }
}

const banner = `/* eslint-disable */
// 本文件由 scripts/mock/extract-schema.mjs 自动生成，请勿手动修改
// 数据来源：src/views 中的列配置、表单配置与数据格式声明；src/router 中的路由权限声明

export interface MockFieldSchema {
  field: string
  title: string
}

export interface MockDirSchema {
  formats: string[]
  /** 列表页真实列字段（优先用于构建表格列） */
  columnFields: MockFieldSchema[]
  /** 该模块全部业务字段（列表列 + 表单字段） */
  fields: MockFieldSchema[]
}
`

const body = `export const MODULE_SCHEMA: Record<string, MockDirSchema> = ${JSON.stringify(schema, null, 2)}

export const FORMAT_OWNER: Record<string, string> = ${JSON.stringify(formatOwner, null, 2)}

/** 全局字段中文标题词典（跨模块同名取众数） */
export const FIELD_TITLE_DICT: Record<string, string> = ${JSON.stringify(titleDict, null, 2)}

/** 路由中声明过的权限码（用于给演示账号授予完整权限） */
export const ROUTE_PERMISSIONS: string[] = ${JSON.stringify(routePermissions, null, 2)}
`

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, `${banner}\n${body}`, 'utf8')

const dirCount = Object.keys(schema).length
const formatCount = Object.keys(formatOwner).length
const fieldCount = Object.values(schema).reduce((sum, item) => sum + item.fields.length, 0)
const withTitle = Object.values(schema).reduce(
  (sum, item) => sum + item.fields.filter(f => f.title).length,
  0,
)

console.log(`视图目录：${dirCount}`)
console.log(`数据格式：${formatCount}`)
console.log(`字段总数：${fieldCount}，其中有中文标题：${withTitle}`)
console.log(`字段标题词典：${Object.keys(titleDict).length}`)
console.log(`路由权限码：${routePermissions.length}`)
console.log(`输出：${path.relative(ROOT, OUTPUT)}`)
