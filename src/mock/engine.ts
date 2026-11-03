import type { RowContext } from './data/fieldValue'
/**
 * 本地 mock 引擎
 *
 * 接收被拦截的请求（url / method / 参数），返回与后端一致的响应结构：
 *   { code: 0, message: 'success', data: ... }
 *
 * 不发起任何网络请求，全部数据由本地确定性算法生成。
 */
import type { DataFormatColumn } from '@/components/SpTable'
import { BRANCHES, CITIES, CURRENCIES, DEPARTMENTS, DIGESTS, PAY_TYPES, POSITIONS, STATE_LABELS } from './data/dict'
import { SYSTEM_ENUMS } from './data/enums'
import {
  createRowContext,
  generateValue,
  inferColumnType,
  isSummable,
  resolveTitle,
} from './data/fieldValue'
import { buildPermissionTree, DEMO_PERMISSION_CODES } from './data/permissions'
import { createRng, floatBetween, intBetween, pick, toDateTimeString } from './data/random'
import { buildColumns, resolveAllFields, resolveModuleDir } from './schema/columns'
import { FIELD_TITLE_DICT } from './schema/schema.generated'

export interface MockRequestInput {
  url: string
  type: string
  data: Record<string, any>
  params: Record<string, any>
}

export interface MockPayload {
  code: number
  message: string
  data: any
}

/** 列表类动作 */
const LIST_ACTIONS = new Set([
  'search',
  'list',
  'getlist',
  'page',
  'query',
  'grid',
  'find',
  'select',
  'options',
  'getoptions',
  'loadlist',
  'report',
  'valid',
  'alert',
  'log',
  'logs',
  'record',
  'records',
  'detail',
  'getdetail',
  'items',
  'rows',
])

/** 详情类动作 */
const DETAIL_ACTIONS = new Set(['get', 'info', 'view', 'load', 'read', 'detail', 'getbyid'])

/** 无返回体的写操作 */
const MUTATION_ACTIONS = new Set([
  'create',
  'update',
  'delete',
  'save',
  'remove',
  'cancel',
  'confirm',
  'submit',
  'audit',
  'accept',
  'refuse',
  'back',
  'copy',
  'import',
  'export',
  'print',
  'batch',
  'createbatchimport',
  'uploadbatchpdf',
  'allotbatchimport',
  'imagebatchimport',
  'rebuild',
  'reset',
  'resetcache',
  'savesettings',
  'savesetting',
  'updatestatus',
  'updatesort',
  'updatestoped',
  'updatescale',
  'updatereason',
  'updateno',
  'updateexpire',
  'updaterenew',
  'updateabbr',
  'changepassword',
  'changepasswordsafety',
  'verify',
  'verifyuser',
])

// ==================== URL 解析 ====================

function normalizeUrl(url: string): { path: string, query: Record<string, string> } {
  const [rawPath, rawQuery = ''] = String(url || '').split('?')
  const query: Record<string, string> = {}
  for (const pair of rawQuery.split('&')) {
    if (!pair)
      continue
    const [key, value = ''] = pair.split('=')
    if (key)
      query[decodeURIComponent(key)] = decodeURIComponent(value)
  }

  const segments = rawPath.split('/').filter(Boolean)
  // 去掉统一前缀
  while (segments.length && ['mock-api', 'api', 'atlas', 'demo'].includes(segments[0]!))
    segments.shift()

  return { path: segments.join('/'), query }
}

function splitPath(path: string): { action: string, module: string } {
  const segments = path.split('/').filter(Boolean)
  const action = (segments.pop() || '').toLowerCase()
  return { action, module: segments.join('/') }
}

/** 合并 GET 参数与请求体 */
function collectParams(input: MockRequestInput, query: Record<string, string>): Record<string, any> {
  return {
    ...query,
    ...(input.params || {}),
    ...(input.data && typeof input.data === 'object' ? input.data : {}),
  }
}

// ==================== 数据生成 ====================

/** 已生成的行缓存，保证列表与详情数据一致 */
const rowCache = new Map<string, Record<string, any>>()

/** 每个模块的数据总量 */
function totalOf(module: string): number {
  const rng = createRng(`total#${module}`)
  return intBetween(rng, 86, 460)
}

/** 生成一行完整数据（基于模块全部业务字段，保证详情表单也能回填） */
function buildRow(module: string, index: number): Record<string, any> {
  const ctx: RowContext = createRowContext(module, index)
  const fields = resolveAllFields(module)
  const row: Record<string, any> = {}
  const id = `${Math.abs(hash(module)) % 100000}${String(index + 1).padStart(4, '0')}`

  const columns = buildColumns(module)

  for (const item of fields) {
    if (item.field === 'id')
      continue
    const type = inferColumnType(item.field)
    const title = resolveTitle(item.field, item.title, FIELD_TITLE_DICT)
    row[item.field] = generateValue(item.field, ctx, type, title)
  }

  // 保证表格列都有值
  for (const column of columns) {
    if (row[column.column] === undefined)
      row[column.column] = generateValue(column.column, ctx, undefined, column.title)
  }

  // 统一状态字段为枚举值，便于展示中文状态
  for (const key of ['status', 'states', 'state']) {
    if (key in row)
      row[key] = String(intBetween(ctx.rng, 1, STATE_LABELS.length))
  }

  // id 最后赋值，避免被同名业务字段覆盖
  row.id = id

  rowCache.set(`${module}:${id}`, row)
  return row
}

function hash(text: string): number {
  let value = 0
  for (let i = 0; i < text.length; i++)
    value = (value * 31 + text.charCodeAt(i)) % 1000000
  return value
}

/** 生成列表数据 */
function buildRows(module: string, count: number, offset = 0): Record<string, any>[] {
  const rows: Record<string, any>[] = []
  for (let i = 0; i < count; i++)
    rows.push(buildRow(module, offset + i))
  return rows
}

/** 合计行 */
function buildSum(module: string, rows: Record<string, any>[]): Record<string, number> {
  const sum: Record<string, number> = {}
  for (const column of buildColumns(module)) {
    if (!isSummable(column.column, column.type as any))
      continue
    sum[column.column] = Number(
      rows.reduce((acc, row) => acc + (Number(row[column.column]) || 0), 0).toFixed(2),
    )
  }
  return sum
}

/** 构建分页响应 */
function buildPage(module: string, params: Record<string, any>) {
  const page = Math.max(1, Number(params.page) || 1)
  const pagesize = Math.max(1, Number(params.pagesize) || 30)
  const totalcount = totalOf(module)
  const totalpages = Math.max(1, Math.ceil(totalcount / pagesize))
  const current = Math.min(page, totalpages)
  const offset = (current - 1) * pagesize
  const size = Math.min(pagesize, Math.max(0, totalcount - offset))
  const rows = buildRows(module, size, offset)

  return {
    list: rows,
    totalcount,
    page: current,
    pageindex: current - 1,
    pagesize,
    totalpages,
    isempty: totalcount === 0,
    haspreviouspage: current > 1,
    hasnextpage: current < totalpages,
    sum: buildSum(module, rows),
  }
}

// ==================== 各类响应 ====================

/** 当前登录用户（演示身份，拥有全部菜单与操作权限的普通用户） */
const DEMO_USER = {
  userid: '10001',
  code: 'demo',
  name: '演示用户',
  nickname: '演示用户',
  authrole: ['admin'],
  avatarurl: '',
  mobile_number: '138****0000',
  wkno: 'D0001',
  watermark: false,
  types: 0,
}

function buildAppInfo() {
  return {
    appname: '一体化管理系统',
    companyname: '示例企业',
    longitude: 120.1551,
    latitude: 30.2741,
    pagelimit: 500,
    logincaptcha: false,
    version: '4.4.1-demo',
  }
}

function buildToken() {
  return {
    access_token: `demo-access-token-${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: `demo-refresh-token-${Date.now()}`,
  }
}

function buildTeamTree() {
  const rng = createRng('team-tree')
  return [
    {
      id: 'root',
      pid: null,
      key: 'root',
      name: '示例企业',
      title: '示例企业',
      label: '示例企业',
      value: 'root',
      children: DEPARTMENTS.slice(0, 8).map((name, index) => ({
        id: `T${201 + index}`,
        pid: 'root',
        key: `T${201 + index}`,
        name,
        title: name,
        label: name,
        value: `T${201 + index}`,
        children: [
          {
            id: `T${201 + index}01`,
            pid: `T${201 + index}`,
            key: `T${201 + index}01`,
            name: `${name}-${pick(rng, POSITIONS)}组`,
            title: `${name}-${pick(rng, POSITIONS)}组`,
            label: `${name}-${pick(rng, POSITIONS)}组`,
            value: `T${201 + index}01`,
            children: [],
          },
        ],
      })),
    },
  ]
}

function buildBranchTree() {
  const rng = createRng('branch-tree')
  return BRANCHES.map((name, index) => ({
    id: `B${101 + index}`,
    pid: null,
    key: `B${101 + index}`,
    name,
    title: name,
    label: name,
    value: `B${101 + index}`,
    children: [],
    remark: pick(rng, ['正常', '筹备中']),
  }))
}

/** 各类树节点的示例名称 */
const TREE_NODE_NAMES: Record<string, string[]> = {
  article: ['办公设备', '电子设备', '运输工具', '房屋建筑', '其他资产'],
  asset: ['固定资产', '低值易耗品', '无形资产', '在建工程'],
  store: ['一号仓库', '二号仓库', '备件库', '成品库'],
  room: ['第一会议室', '第二会议室', '多功能厅', '洽谈室'],
  product: ['软件产品', '硬件产品', '咨询服务', '运维服务'],
  expense: ['差旅费', '办公费', '业务招待费', '运输费'],
  salary: ['基本工资', '绩效奖金', '津贴补贴', '社保公积金'],
  team: ['综合管理部', '财务部', '人力资源部', '市场部', '技术部'],
  default: ['日常办公', '项目支出', '专项费用', '其他事项'],
}

/** 通用树：按接口路径推断节点语义，输出 alova/naive-ui 均可识别的节点结构 */
function buildModuleTree(path: string) {
  const key = Object.keys(TREE_NODE_NAMES).find(item => path.includes(item)) || 'default'
  const names = TREE_NODE_NAMES[key]
  return names.map((name, index) => ({
    id: `${key}-${index + 1}`,
    pid: null,
    key: `${key}-${index + 1}`,
    name,
    title: name,
    label: name,
    value: `${key}-${index + 1}`,
    children: [
      {
        id: `${key}-${index + 1}-1`,
        pid: `${key}-${index + 1}`,
        key: `${key}-${index + 1}-1`,
        name: `${name}-A`,
        title: `${name}-A`,
        label: `${name}-A`,
        value: `${key}-${index + 1}-1`,
        children: [],
      },
    ],
  }))
}

/** 字典下拉的候选值：按字典名关键字挑选语义相近的中文选项 */
const DICT_OPTIONS: Array<{ test: RegExp, options: readonly string[] }> = [
  { test: /status|state|状态/i, options: ['草稿', '已提交', '已审核', '已完成', '已作废'] },
  { test: /type|kind|category|分类|类型/i, options: ['办公用品', '电子设备', '低值易耗品', '运输工具', '其他'] },
  { test: /level|grade|rank|等级|级别/i, options: ['一级', '二级', '三级', '四级'] },
  { test: /city|area|region|地区|城市/i, options: CITIES },
  { test: /dept|team|部门|组织/i, options: DEPARTMENTS },
  { test: /pay|支付|结算/i, options: PAY_TYPES },
  { test: /currency|币种/i, options: CURRENCIES },
  { test: /digest|摘要|用途/i, options: DIGESTS },
  { test: /store|warehouse|仓库/i, options: ['一号仓库', '二号仓库', '备件库', '成品库'] },
  { test: /room|会议室/i, options: ['第一会议室', '第二会议室', '多功能厅', '洽谈室'] },
]

/** 生成字典下拉选项 */
function buildDictionaryOptions(name: string) {
  const matched = DICT_OPTIONS.find(item => item.test.test(name))
  const labels = matched ? matched.options : ['示例选项一', '示例选项二', '示例选项三', '示例选项四']
  return labels.map((label, index) => ({
    id: index + 1,
    label,
    value: label,
    sort: index + 1,
  }))
}

/** 选项分类树：一级为分类，二级为具体选项类别 */
const DICT_GROUPS: Array<{ group: string, items: string[] }> = [
  { group: '基础选项', items: ['性别', '学历', '民族', '婚姻状况', '政治面貌'] },
  { group: '人事选项', items: ['假期类型', '职务级别', '用工性质', '考勤状态'] },
  { group: '业务选项', items: ['费用类别', '资产分类', '结算方式', '业务类型'] },
  { group: '财务选项', items: ['币种', '科目类别', '凭证字'] },
]

/** 各选项类别下的具体条目 */
const DICT_ITEMS: Record<string, string[]> = {
  性别: ['男', '女'],
  学历: ['专科', '本科', '硕士', '博士'],
  民族: ['汉族', '回族', '满族', '壮族'],
  婚姻状况: ['未婚', '已婚', '离异'],
  政治面貌: ['群众', '共青团员', '中共党员'],
  假期类型: ['年假', '事假', '病假', '婚假', '产假'],
  职务级别: ['初级', '中级', '高级', '资深'],
  用工性质: ['正式', '试用', '实习', '外包'],
  考勤状态: ['正常', '迟到', '早退', '缺卡', '外勤'],
  费用类别: ['差旅费', '办公费', '业务招待费', '运输费'],
  资产分类: ['电子设备', '办公家具', '运输工具', '房屋建筑'],
  结算方式: ['银行转账', '现金', '票据'],
  业务类型: ['销售', '采购', '租赁', '服务'],
  币种: ['人民币', '美元', '港币'],
  科目类别: ['资产类', '负债类', '损益类'],
  凭证字: ['记', '收', '付', '转'],
}

/** 完整选项树（左侧分类树） */
function buildDictionaryTree() {
  return DICT_GROUPS.map((entry, gi) => ({
    id: entry.group,
    pid: '0',
    key: entry.group,
    name: entry.group,
    label: entry.group,
    title: entry.group,
    kind: 1,
    sort: (gi + 1) * 10,
    depth: 1,
    max_depth: 3,
    child: true,
    children: entry.items.map((item, ii) => ({
      id: item,
      pid: entry.group,
      key: item,
      name: item,
      label: item,
      title: item,
      kind: 0,
      sort: (ii + 1) * 10,
      depth: 2,
      max_depth: 3,
      child: false,
      children: [],
    })),
  }))
}

/** 某个选项类别下的条目列表（右侧表格） */
function buildDictionaryNodes(parentId: string) {
  const items = DICT_ITEMS[parentId] ?? Object.values(DICT_ITEMS).flat().slice(0, 4)
  const rng = createRng(`dict:${parentId}`)
  return items.map((name, index) => ({
    id: `${parentId}-${index + 1}`,
    pid: parentId || '0',
    name,
    kind: 0,
    sort: (index + 1) * 10,
    ctime: toDateTimeString(new Date(Date.now() - intBetween(rng, 30, 400) * 86400000)),
    utime: toDateTimeString(new Date(Date.now() - intBetween(rng, 0, 29) * 86400000)),
  }))
}

/** 角色列表：用于角色下拉与按类型分组，接口约定返回数组而非分页对象 */
function buildRoleList() {
  const groups: Array<[string, string[]]> = [
    ['业务角色', ['业务录入员', '业务审核员', '业务主管']],
    ['财务角色', ['会计', '出纳', '财务主管']],
    ['管理角色', ['系统管理员', '档案管理员', '只读查询员']],
  ]
  const list: Record<string, any>[] = []
  groups.forEach(([kind, names], gi) => {
    names.forEach((name, ni) => {
      list.push({
        id: `R${gi + 1}${String(ni + 1).padStart(2, '0')}`,
        name,
        kind,
        role_desc: kind,
        sort: (gi + 1) * 10 + ni,
      })
    })
  })
  return list
}

/** 导出：生成 CSV data URL，便于演示下载 */
function buildExportUrl(module: string, columns: DataFormatColumn[]): string {
  const rows = buildRows(module, 30)
  const header = columns.map(item => item.title).join(',')
  const body = rows
    .map(row => columns.map(item => `${row[item.column] ?? ''}`.replace(/,/g, '，')).join(','))
    .join('\n')
  const csv = `\uFEFF${header}\n${body}`
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
}

/** 打印：生成可打印的 HTML data URL */
function buildPrintUrl(module: string, columns: DataFormatColumn[]): string {
  const rows = buildRows(module, 20)
  const head = columns.map(item => `<th>${item.title}</th>`).join('')
  const body = rows
    .map(row => `<tr>${columns.map(item => `<td>${row[item.column] ?? ''}</td>`).join('')}</tr>`)
    .join('')
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>打印预览</title>
<style>body{font-family:system-ui,sans-serif;padding:24px}h2{text-align:center;font-weight:600}
table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f5f6f8}</style></head><body><h2>业务单据打印预览（演示数据）</h2>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
}

/** 工作台：我的申请 / 我的审批 使用的业务类型 */
const WORKFLOW_BIZ = [
  { label: '资产调拨', route: 'AssetAllot' },
  { label: '资产领用', route: 'AssetApply' },
  { label: '费用报销', route: 'PenseApply' },
  { label: '借款申请', route: 'PenseBorrow' },
  { label: '收款单', route: 'TradeReceive' },
  { label: '记账凭证', route: 'VouchEntry' },
]

/** 构建工作台待办条目 */
function buildWorkflowItems(kind: string, count = 9) {
  return Array.from({ length: count }, (_, index) => {
    const ctx = createRowContext(`workflow/${kind}`, index)
    const biz = WORKFLOW_BIZ[index % WORKFLOW_BIZ.length]!
    return {
      id: `${kind === 'apply' ? 'A' : 'P'}${index + 1}`,
      biz_name: biz.label,
      biz_route: biz.route,
      biz_id: String(1000 + index),
      team_name: ctx.team.name,
      user_name: ctx.person.name,
      content: `${pick(ctx.rng, DIGESTS)} · 金额 ${floatBetween(ctx.rng, 200, 26000, 2)} 元`,
      ctime: toDateTimeString(new Date(Date.now() - index * 5400 * 1000)),
      status: kind === 'apply' ? 'wait' : 'approve',
    }
  })
}

/** 工作台：最新动态 */
function buildWorkplaceDynamic() {
  const types = ['报', '审', '资', '账', '人']
  const titles = [
    '费用报销单已提交',
    '资产调拨审批通过',
    '工资发放表已生成',
    '记账凭证已过账',
    '人员入职信息已登记',
    '合同收款计划已更新',
  ]
  return Array.from({ length: 6 }, (_, index) => {
    const ctx = createRowContext('workplace/dynamic', index)
    return {
      id: `D${index + 1}`,
      types: types[index % types.length],
      title: titles[index % titles.length],
      content: `${ctx.team.name} · ${ctx.person.name}`,
      ctime: toDateTimeString(new Date(Date.now() - index * 7200 * 1000)),
    }
  })
}

// ==================== 监控台 ====================

interface MonitorModule {
  code: string
  name: string
  children: string[]
}

/** 统计口径：与左侧一级导航一一对应，二级名称取自各模块真实菜单 */
const MONITOR_MODULES: MonitorModule[] = [
  { code: 'staff', name: '人事管理', children: ['人员档案', '人员变动', '考勤记录', '工资管理'] },
  { code: 'trade', name: '业务管理', children: ['客户管理', '项目管理', '应收管理', '发票管理'] },
  { code: 'asset', name: '资产管理', children: ['资产信息', '资产申领', '资产采购', '资产调拨'] },
  { code: 'pense', name: '费用报销', children: ['费用申请', '事前申请', '付款合同', '费用支付'] },
  { code: 'vouch', name: '账务处理', children: ['凭证录入', '凭证分录', '期间处理', '余额查询'] },
  { code: 'paper', name: '档案管理', children: ['档案信息', '档案借阅'] },
]

/** 最近 N 个月的标签，如 2025-12 */
function buildRecentMonths(count = 12): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1)
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
  })
}

/**
 * 监控台总览
 *
 * 一次性返回图表所需的全部数据，避免页面多次请求：
 * 模块指标卡 / 12 个月趋势 / 业务量占比 / 待办与超期 / 健康度雷达 / 二级业务 TOP
 */
function buildMonitorOverview() {
  const months = buildRecentMonths()

  const details = MONITOR_MODULES.map((mod) => {
    const rng = createRng(`monitor:${mod.code}`)
    const base = intBetween(rng, 260, 980)
    // 季节性波动 + 缓慢增长，让趋势线看起来有业务规律而非纯噪声
    const trend = months.map((_, index) => {
      const season = 1 + Math.sin((index / months.length) * Math.PI * 2) * 0.16
      const grow = 1 + index * 0.02
      return Math.round(base * season * grow * floatBetween(rng, 0.92, 1.08))
    })
    const total = trend[trend.length - 1] ?? base
    const prev = trend[trend.length - 2] ?? total
    const pending = intBetween(rng, 9, 48)
    const overdue = intBetween(rng, 0, 6)
    const health = intBetween(rng, 76, 98)
    const hours = floatBetween(rng, 1.6, 14.5, 1)
    const children = mod.children.map(name => ({
      module: mod.name,
      name,
      value: intBetween(rng, 40, total),
    }))
    return { ...mod, trend, total, prev, pending, overdue, health, hours, children }
  })

  const growthOf = (total: number, prev: number) =>
    prev > 0 ? Number((((total - prev) / prev) * 100).toFixed(1)) : 0

  return {
    updated: toDateTimeString(new Date()),
    months,
    cards: details.map(item => ({
      code: item.code,
      name: item.name,
      total: item.total,
      growth: growthOf(item.total, item.prev),
      pending: item.pending,
      overdue: item.overdue,
      health: item.health,
      hours: item.hours,
    })),
    trend: details.map(item => ({ name: item.name, data: item.trend })),
    share: details.map(item => ({ name: item.name, value: item.total })),
    todo: details.map(item => ({ name: item.name, pending: item.pending, overdue: item.overdue })),
    radar: {
      indicators: details.map(item => item.name),
      current: details.map(item => item.health),
      // 上月达标率：以本月为基准上下浮动，形成对比环
      previous: details.map((item) => {
        const rng = createRng(`monitor:prev:${item.code}`)
        return Math.max(62, Math.min(99, item.health - intBetween(rng, -8, 10)))
      }),
    },
    top: details
      .flatMap(item => item.children)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
  }
}

// ==================== 分发 ====================

function pickModule(module: string, params: Record<string, any>): string {
  const fromFormat = typeof params.format === 'string' ? params.format : ''
  const dir = resolveModuleDir(fromFormat) || resolveModuleDir(module)
  return dir || module || 'common'
}

/**
 * 处理一次 mock 请求
 */
export function handleMockRequest(input: MockRequestInput): MockPayload {
  const { path, query } = normalizeUrl(input.url)
  const { action, module: rawModule } = splitPath(path)
  const params = collectParams(input, query)
  const module = pickModule(rawModule, params)
  const ok = (data: any = null): MockPayload => ({ code: 0, message: 'success', data })

  // ---------- 授权 ----------
  if (/(^|\/)authorize\/(token|tokensafety|sms|refreshtoken)$/.test(path))
    return ok(buildToken())
  if (/authorize\/untoken$/.test(path))
    return ok(true)
  if (/authorize\/sendverifycode$/.test(path))
    return ok(true)

  // ---------- 身份与权限 ----------
  if (/identity\/profile\/get$/.test(path))
    return ok(DEMO_USER)
  if (/identity\/profile\/info$/.test(path)) {
    return ok({
      ...DEMO_USER,
      sex: 1,
      birthday: '1990-06-18',
      email: 'demo@example.com',
      address: '示例市示例区示例路 1 号',
      team_name: DEPARTMENTS[1],
      post_name: POSITIONS[1],
    })
  }
  if (/identity\/permit\/list$/.test(path))
    return ok(buildPermissionTree())
  if (/identity\/permit\/currentuser$/.test(path))
    return ok(DEMO_PERMISSION_CODES)
  if (/identity\/profile\/switch$/.test(path) || path.endsWith('getscreentoken'))
    return ok(buildToken())

  // ---------- 公共 ----------
  if (/common\/appinfo$/.test(path))
    return ok(buildAppInfo())
  if (/common\/enums$/.test(path))
    return ok(SYSTEM_ENUMS)
  if (/common\/time$/.test(path))
    return ok(Date.now())
  if (/common\/getip$/.test(path))
    return ok('127.0.0.1')

  // ---------- 字典下拉 ----------
  if (/dictionary\/get(?:list|tree)$/i.test(path) || /dictionary\/root$/i.test(path))
    return ok(buildDictionaryOptions(String(params.name || params.code || '')))
  // 角色列表（下拉 / 分组）返回数组，避免页面 forEach 报错
  if (/(?:identity|external)\/role\/list$/i.test(path))
    return ok(buildRoleList())
  // 选项设置的分类树与条目（结构与管理页面绑定，不能用通用列表兜底）
  if (/dictionary\/getalltree$/i.test(path))
    return ok(buildDictionaryTree())
  if (/dictionary\/(search|getnodelist)$/i.test(path))
    return ok(buildDictionaryNodes(String(params.parent_id ?? '')))

  // ---------- 数据格式 ----------
  if (/dataformat\/get$/.test(path)) {
    const name = params.name || params.value || module
    return ok(buildColumns(name))
  }
  if (/dataformat\/getnames$/.test(path))
    return ok(Object.keys(SYSTEM_ENUMS))
  if (/dataformat\/getusergrid(list)?$/.test(path))
    return ok(null)

  // ---------- 组织机构 ----------
  if (/organ\/team\/tenant\/list$/.test(path)) {
    // 单租户场景：自动选中，页面无需手动选择组织机构
    return ok([{ value: 'T200', label: '示例企业', select: true }])
  }
  if (/organ\/team\/tree$/.test(path) || /organ\/team\/treebyid$/.test(path))
    return ok(buildTeamTree())
  if (/organ\/branch\/tree$/.test(path))
    return ok(buildBranchTree())
  // 其余模块的树接口（仓库、会议室、分类…）统一返回节点数组，
  // 否则页面按数组解析时会抛 "tree is not iterable"
  if (/\/(tree|treebyid|trees)$/i.test(path))
    return ok(buildModuleTree(path))

  // ---------- 文件 ----------
  if (/misc\/file\/upload$/.test(path) || /file\/upload$/.test(path)) {
    return ok({
      name: '演示附件.pdf',
      url: '',
      size: 102400,
      id: `F${Date.now()}`,
    })
  }

  // ---------- 工作台 ----------
  if (/workflow\/apply\/search$/.test(path)) {
    const list = buildWorkflowItems('apply')
    return ok({ list, totalcount: list.length, page: 1, pageindex: 0, pagesize: list.length, totalpages: 1, isempty: false })
  }
  if (/workflow\/approve\/search$/.test(path)) {
    const list = buildWorkflowItems('approve')
    return ok({ list, totalcount: list.length, page: 1, pageindex: 0, pagesize: list.length, totalpages: 1, isempty: false })
  }
  if (/board\/workplace\/getalter$/.test(path))
    return ok(buildWorkplaceDynamic())

  // ---------- 监控台 ----------
  if (/board\/monitor\/(overview|chart|charts|summary)$/.test(path))
    return ok(buildMonitorOverview())

  // ---------- 消息通知 ----------
  if (/message\/.*unread/i.test(path)) {
    return ok({
      count: 3,
      list: [
        {
          id: 'M1',
          title: '待办提醒',
          content: '您有 1 张费用报销单待审批',
          types: 1,
          kind: 'DEMO',
          read: false,
          createdate: toDateTimeString(new Date(Date.now() - 30 * 60 * 1000)),
        },
        {
          id: 'M2',
          title: '系统通知',
          content: '本月工资发放表已生成，请及时核对',
          types: 2,
          kind: 'DEMO',
          read: false,
          createdate: toDateTimeString(new Date(Date.now() - 3 * 3600 * 1000)),
        },
        {
          id: 'M3',
          title: '审批结果',
          content: '您提交的资产调拨申请已通过审批',
          types: 1,
          kind: 'DEMO',
          read: false,
          createdate: toDateTimeString(new Date(Date.now() - 26 * 3600 * 1000)),
        },
      ],
    })
  }

  // ---------- 导出与打印 ----------
  if (/\/export$/.test(path))
    return ok(buildExportUrl(module, buildColumns(module)))
  if (/\/print$/.test(path) || /\/pdf$/.test(path))
    return ok(buildPrintUrl(module, buildColumns(module)))

  // ---------- 导入结果文件下载（批量导入弹窗使用） ----------
  if (/logs\/import\/get$/.test(path)) {
    const csv = `\uFEFF文件名,导入结果\n演示导入结果.csv,成功`
    return ok({
      id: String(params.id ?? ''),
      title: '导入结果',
      ctime: toDateTimeString(new Date()),
      files: [
        { name: '导入结果.csv', url: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}` },
      ],
    })
  }

  // ---------- 通用列表 ----------
  if (LIST_ACTIONS.has(action))
    return ok(buildPage(module, params))

  // ---------- 通用详情 ----------
  if (DETAIL_ACTIONS.has(action)) {
    const id = String(params.id ?? params.key ?? '')
    const cached = id ? rowCache.get(`${module}:${id}`) : undefined
    return ok(cached || buildRow(module, 0))
  }

  // ---------- 树 ----------
  if (action === 'tree' || action === 'treebyid')
    return ok(buildTeamTree())

  // ---------- 写操作 ----------
  if (MUTATION_ACTIONS.has(action) || action.startsWith('update') || action.startsWith('create'))
    return ok(String(Date.now()))

  // ---------- 兜底 ----------
  return ok(null)
}

/** 当前时间文本（用于响应头/日志） */
export function mockTimestamp(): string {
  return toDateTimeString(new Date())
}
