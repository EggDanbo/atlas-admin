import type { Rng } from './random'
/**
 * 字段语义解析：标题、列类型、示例值
 *
 * 设计原则：
 * - 优先使用视图代码里真实的字段名，从而让 mock 数据与页面绑定一致
 * - 通过字段名猜测语义（金额/日期/人员/部门…），生成符合业务直觉的中文数据
 * - 涉及个人隐私的字段一律输出脱敏格式，不生成可用的真实证件号/手机号
 */
import {
  ACCOUNT_SUBJECTS,
  ASSET_BRANDS,
  ASSET_MODELS,
  ASSET_NAMES,
  BANK_BRANCHES,
  BANKS,
  BRANCHES,
  CATEGORY_NAMES,
  CITIES,
  CURRENCIES,
  DEPARTMENTS,
  DIGESTS,
  EDUCATIONS,
  GIVEN_NAMES,
  MARRIAGES,
  MEASURE_UNITS,
  NATIONS,
  PARENT_CATEGORIES,
  PARTNERS,
  PAY_TYPES,
  POLITICS,
  POSITIONS,
  PRODUCTS,
  REMARKS,
  STREETS,
  SURNAMES,
} from './dict'
import {
  createRng,
  dateOffset,
  floatBetween,
  intBetween,
  pick,

  toDateString,
  toDateTimeString,
} from './random'

export type ColumnType
  = | 'text'
    | 'number'
    | 'money'
    | 'date'
    | 'datetime'
    | 'bool'
    | 'enums'

export interface RowContext {
  rng: Rng
  index: number
  module: string
  person: { name: string, id: string }
  team: { name: string, id: string }
  branch: string
  partner: string
}

/** 模块所属业务域，用于让「名称」这类通用字段落到正确的实体上 */
export type ModuleKind = 'person' | 'team' | 'asset' | 'partner' | 'product' | 'role' | 'document' | 'generic'

/** 按模块路径判断业务域（如 staff/info → person、asset/allot → asset） */
export function classifyModule(module: string): ModuleKind {
  const m = String(module || '').toLowerCase()
  if (!m)
    return 'generic'
  if (/^(staff|personnel|organ\/user)/.test(m) || /(^|\/)user($|\/)/.test(m))
    return 'person'
  if (/^(organ|basic)\/team/.test(m))
    return 'team'
  if (m.startsWith('asset'))
    return 'asset'
  if (m.startsWith('paper'))
    return 'document'
  if (/(partner|outer|customer|client|custom|supplier)/.test(m))
    return 'partner'
  if (/^(trade|pense|vouch)\//.test(m))
    return 'product'
  if (/^(permit|role)/.test(m) || /(^|\/)role($|\/)/.test(m))
    return 'role'
  return 'generic'
}

/** 不同业务域下「名称」字段的列标题 */
const NAME_TITLE_BY_KIND: Record<ModuleKind, string> = {
  person: '姓名',
  team: '部门名称',
  asset: '资产名称',
  partner: '单位名称',
  product: '项目名称',
  role: '角色名称',
  document: '档案名称',
  generic: '名称',
}

/** 角色名称候选值 */
const ROLE_NAMES = ['系统管理员', '财务主管', '会计', '出纳', '审核员', '制单员', '部门主管', '普通用户']

/** 通用「名称」字段候选值（配置类实体） */
const GENERIC_NAMES = ['标准方案', '默认规则', '常用模板', '共享配置', '临时分组', '基础参数']

/** 档案类「名称」字段候选值 */
const DOCUMENT_NAMES = ['会计凭证', '报销单据', '合同文本', '工资表', '验收单', '资产台账', '银行回单', '纳税申报表']

/** 按业务域生成「名称」字段的值 */
function pickNameValue(ctx: RowContext, kind: ModuleKind): string {
  switch (kind) {
    case 'person':
      return ctx.person.name
    case 'team':
      return ctx.team.name
    case 'asset':
      return pick(ctx.rng, ASSET_NAMES)
    case 'partner':
      return ctx.partner
    case 'product':
      return pick(ctx.rng, PRODUCTS)
    case 'role':
      return pick(ctx.rng, ROLE_NAMES)
    case 'document':
      return `${pick(ctx.rng, DOCUMENT_NAMES)}（${pick(ctx.rng, ['2025', '2026'])} 年度）`
    default:
      return pick(ctx.rng, GENERIC_NAMES)
  }
}

/** 按业务域修正「名称」类通用字段的标题（如人事模块显示「姓名」） */
export function resolveModuleTitle(field: string, title: string, module: string): string {
  if (field === 'name')
    return NAME_TITLE_BY_KIND[classifyModule(module)]
  return title
}

/**
 * 兜底：按列标题猜测语义
 *
 * 有些字段名（organ_code / fullname / wechat_work_dept…）无法从命名推断含义，
 * 但页面已经给了中文标题，用标题兜底比统一填摘要更贴近真实数据。
 */
function fallbackByTitle(title: string, ctx: RowContext): string | number {
  const t = title || ''
  if (/编码|编号|代码|单号/.test(t))
    return buildSerial(ctx)
  if (/部门|机构|科室|组织/.test(t))
    return ctx.team.name
  if (/全称|名称|单位|公司/.test(t))
    return ctx.partner
  if (/地址|地点|位置/.test(t))
    return `${pick(ctx.rng, CITIES)}${pick(ctx.rng, STREETS)}${intBetween(ctx.rng, 1, 200)} 号`
  if (/人员|经办|负责|证明人|联系/.test(t))
    return ctx.person.name
  if (/金额|费用|单价|合计/.test(t))
    return floatBetween(ctx.rng, 100, 98000, 2)
  if (/内容|说明|摘要|备注|原因|用途/.test(t))
    return pick(ctx.rng, DIGESTS)
  return pick(ctx.rng, DIGESTS)
}

/** 创建行上下文：同一行内的人员/部门等信息保持一致 */
export function createRowContext(module: string, index: number): RowContext {
  const rng = createRng(`${module}#${index}`)
  const personRng = createRng(`person#${module}#${index}`)
  const teamRng = createRng(`team#${module}#${index}`)
  const name = `${pick(personRng, SURNAMES)}${pick(personRng, GIVEN_NAMES)}`
  return {
    rng,
    index,
    module,
    person: { name, id: `U${10001 + index}` },
    team: {
      name: pick(teamRng, DEPARTMENTS),
      id: `T${201 + (index % DEPARTMENTS.length)}`,
    },
    branch: pick(teamRng, BRANCHES),
    partner: pick(teamRng, PARTNERS),
  }
}

// ==================== 字段标题 ====================

/** 人工校准的字段标题（优先级最高，避免自动提取的歧义） */
export const CURATED_TITLES: Record<string, string> = {
  id: '主键',
  no: '单号',
  code: '编号',
  name: '名称',
  title: '标题',
  digest: '摘要',
  remark: '备注',
  reason: '原因',
  memo: '说明',
  status: '状态',
  states: '状态',
  state: '状态',
  types: '类型',
  type: '类型',
  kind: '类别',
  category: '分类',
  date: '日期',
  month: '月份',
  year: '年度',
  period: '期间',
  start: '开始日期',
  end: '结束日期',
  expire: '到期日期',
  birthday: '出生日期',
  printdate: '打印日期',
  createdate: '创建日期',
  updatedate: '更新日期',
  amount: '金额',
  money: '金额',
  debit: '借方金额',
  credit: '贷方金额',
  balance: '余额',
  price: '单价',
  total: '合计',
  tax: '税额',
  rate: '税率',
  ratio: '比例',
  scale: '系数',
  num: '数量',
  count: '数量',
  qty: '数量',
  quantity: '数量',
  user_id: '经办人',
  user_name: '经办人',
  check_id: '审核人',
  check_name: '审核人',
  create_id: '制单人',
  create_name: '制单人',
  current_name: '当前处理人',
  next_name: '下一处理人',
  team_id: '部门',
  team_name: '部门',
  team_in: '调入部门',
  team_in_name: '调入部门',
  team_out: '调出部门',
  team_out_name: '调出部门',
  branch_id: '所属机构',
  branch_name: '所属机构',
  dept_id: '部门',
  dept_name: '部门',
  post_name: '岗位',
  job_name: '岗位',
  mobile: '手机号',
  phone: '联系电话',
  tel: '联系电话',
  email: '电子邮箱',
  card: '身份证号',
  card_issue: '签发机关',
  card_valid: '有效期至',
  gender: '性别',
  nation: '民族',
  politics: '政治面貌',
  marital: '婚姻状况',
  educate: '学历',
  school: '毕业院校',
  major: '专业',
  address: '地址',
  bank: '开户银行',
  bank_open: '开户支行',
  account: '银行账号',
  payee_name: '收款方',
  payee_bank: '收款银行',
  payee_open: '开户支行',
  payee_link: '收款方联系方式',
  payee_type: '收款方类型',
  content_id: '会计科目',
  content_name: '会计科目',
  subject: '会计科目',
  source: '来源',
  printed: '打印状态',
  stoped: '停用状态',
  brand: '品牌',
  model: '规格型号',
  sn: '序列号',
  location: '存放地点',
  keeper: '保管人',
  original_value: '原值',
  net_value: '净值',
  asset_code: '资产编码',
  asset_name: '资产名称',
  file_name: '文件名称',
  file_size: '文件大小',
}

/** 常见英文词根 → 中文，用于兜底拼装标题 */
const TOKEN_TITLES: Record<string, string> = {
  no: '编号',
  code: '编码',
  name: '名称',
  id: '标识',
  date: '日期',
  time: '时间',
  amount: '金额',
  money: '金额',
  price: '单价',
  num: '数量',
  qty: '数量',
  count: '数量',
  rate: '比率',
  total: '合计',
  sum: '合计',
  type: '类型',
  types: '类型',
  status: '状态',
  state: '状态',
  remark: '备注',
  digest: '摘要',
  title: '标题',
  user: '人员',
  team: '部门',
  dept: '部门',
  branch: '机构',
  post: '岗位',
  job: '岗位',
  phone: '电话',
  mobile: '手机号',
  email: '邮箱',
  address: '地址',
  bank: '银行',
  account: '账号',
  card: '证件',
  gender: '性别',
  nation: '民族',
  politics: '政治面貌',
  marital: '婚姻',
  educate: '学历',
  school: '院校',
  major: '专业',
  start: '开始',
  end: '结束',
  expire: '到期',
  pay: '支付',
  payee: '收款',
  type2: '类型',
  content: '科目',
  subject: '科目',
  asset: '资产',
  brand: '品牌',
  model: '型号',
  sn: '序列号',
  location: '地点',
  keeper: '保管人',
  period: '期间',
  month: '月份',
  year: '年度',
  value: '值',
  original: '原始',
  net: '净',
  in: '入',
  out: '出',
  source: '来源',
  printed: '打印',
  stoped: '停用',
  file: '文件',
  size: '大小',
  link: '联系',
  check: '审核',
  create: '创建',
  update: '更新',
  current: '当前',
  next: '下一',
  scale: '系数',
  ratio: '比例',
  tax: '税',
  reason: '原因',
  memo: '说明',
  kind: '类别',
  category: '分类',
  info: '信息',
}

/**
 * 补充标题：词根拼装无法得出中文时使用
 *
 * 这些字段名多为单词式英文缩写（wkno / perms / fullname …），
 * 词根表无法组合出可读中文，这里给出统一译名，避免表格里出现英文标题。
 */
const EXTRA_TITLES: Record<string, string> = {
  add: '附加',
  age: '年龄',
  assist: '辅助核算',
  batch: '批次',
  cashes: '可用金额',
  census: '户籍性质',
  checkin_back: '返程打卡',
  checkin_spe_offdays: '特殊休息日',
  checkin_spe_workdays: '特殊工作日',
  checkin_wifimac: 'WiFi 打卡',
  child: '下级节点',
  contacts: '联系人',
  data: '数据范围',
  days: '天数',
  deposit: '押金',
  description: '说明',
  direction: '方向',
  disuse: '停用日期',
  durable: '使用年限',
  files_bcxy: '补充协议',
  files_bmxy: '报名表',
  files_ldht: '劳动合同',
  files_zrz: '责任书',
  fix_day: '固定天数',
  fore: '负责人',
  fullname: '全称',
  group_list: '所属分组',
  head: '抬头',
  hotline: '联系电话',
  house_base: '缴存基数',
  house_buy: '购买比例',
  indate: '签约日期',
  leave: '假期',
  leave_max: '最长时长',
  least: '最低库存',
  life: '使用年限',
  methods: '折旧方法',
  nature: '性质',
  pack: '包装单位',
  perms: '权限',
  pwd: '密码',
  quota: '定额',
  realize: '净值',
  red: '红冲',
  remind_off_work: '下班提醒',
  remind_work: '上班提醒',
  require: '需求说明',
  revise: '修订日期',
  role: '角色',
  role_list: '所属角色',
  serial: '序列号',
  use_face_detect: '人脸识别',
  user_pic: '头像',
  vacation: '假期类型',
  var_day: '调休天数',
  wkno: '工号',
}

/** 是否包含中文 */
function hasCJK(text: string): boolean {
  return /[\u4E00-\u9FA5]/.test(text)
}

/**
 * 推导字段中文标题
 * @param field 字段名
 * @param extracted 从视图代码中提取到的真实标题
 * @param dict 全局字段标题词典
 */
export function resolveTitle(
  field: string,
  extracted?: string,
  dict?: Record<string, string>,
): string {
  const curated = CURATED_TITLES[field]
  if (curated)
    return curated

  // 局部提取的标题通常最贴合该模块语境
  if (extracted && extracted.length <= 10 && hasCJK(extracted))
    return extracted

  const fromDict = dict?.[field]
  if (fromDict && hasCJK(fromDict))
    return fromDict

  // 兜底：按词根拼装
  const tokens = field.split(/[_-]/).filter(Boolean)
  const mapped = tokens.map(token => TOKEN_TITLES[token.toLowerCase()] || '')
  const joined = mapped.filter(Boolean).join('')
  if (joined && hasCJK(joined))
    return joined

  // 词根拼不出中文时使用补充译名，避免表格中出现英文标题
  const extra = EXTRA_TITLES[field]
  if (extra)
    return extra

  if (joined)
    return joined

  return field.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ==================== 列类型 ====================

const MONEY_RE = /(amount|money|price|debit|credit|balance|total|tax|value|fee|cost|salary|wage|pay|budget|sum|deposit|margin)$/i
const INT_RE = /(num|count|qty|quantity|scale|ratio|rate|sort|seq|age|days|hours|number|index|page|size)$/i
const DATE_RE = /(^date$|_date$|date_|^day$|birthday|expire|period|^start$|^end$|deadline|checkdate|printdate|createdate|updatedate)/i
const DATETIME_RE = /(^time$|_time$|timestamp|datetime|created_at|updated_at)/i
const BOOL_RE = /^(printed|stoped|enabled|disabled|is\w+|has\w+|checked|finished|locked)$/i
const STATUS_RE = /(status|states|^state$|^types$|^type$|kind|gender|level|grade|nature|category)$/i

/** 根据字段名推断列类型 */
export function inferColumnType(field: string): ColumnType {
  if (MONEY_RE.test(field))
    return 'money'
  if (DATETIME_RE.test(field))
    return 'datetime'
  if (DATE_RE.test(field))
    return 'date'
  if (BOOL_RE.test(field))
    return 'bool'
  if (STATUS_RE.test(field))
    return 'enums'
  if (INT_RE.test(field))
    return 'number'
  return 'text'
}

/** 数值型列是否参与合计 */
export function isSummable(field: string, type: ColumnType): boolean {
  return type === 'money' && !/rate|ratio|scale|tax$/i.test(field)
}

// ==================== 值生成 ====================

function maskedMobile(rng: Rng): string {
  return `1${pick(rng, ['3', '5', '7', '8', '9'])}${intBetween(rng, 0, 9)}****${intBetween(rng, 1000, 9999)}`
}

function maskedCard(rng: Rng): string {
  return `${intBetween(rng, 110000, 659000)}********${intBetween(rng, 1000, 9999)}`
}

function bankAccount(rng: Rng): string {
  let acc = '62'
  for (let i = 0; i < 12; i++)
    acc += intBetween(rng, 0, 9)
  return `${acc.slice(0, 6)} **** **** ${acc.slice(-4)}`
}

const SERIAL_PREFIX: Record<string, string> = {
  asset: 'ZC',
  vouch: 'PZ',
  pense: 'BX',
  staff: 'YG',
  trade: 'HT',
  basic: 'JC',
  organ: 'ZZ',
  paper: 'DA',
}

function buildSerial(ctx: RowContext): string {
  const top = ctx.module.split('/')[0] || 'DJ'
  const prefix = SERIAL_PREFIX[top] || 'DJ'
  const date = dateOffset(-(ctx.index % 90))
  const ym = `${date.getFullYear()}${`${date.getMonth() + 1}`.padStart(2, '0')}`
  return `${prefix}${ym}${`${ctx.index + 1}`.padStart(4, '0')}`
}

/**
 * 依据字段名生成示例值
 */
export function generateValue(field: string, ctx: RowContext, type?: ColumnType, title?: string): unknown {
  const { rng } = ctx
  const t = type || inferColumnType(field)
  const lower = field.toLowerCase()

  // ---------- 日志字段 ----------
  // 日志类模块的字段名（level / message / appname / hostname / ip…）与业务单据差异很大，
  // 按通用语义猜会得到「摘要」「公司名」这类错位数据，这里单独给一组合乎日志直觉的取值。
  if (ctx.module.includes('log')) {
    switch (lower) {
      case 'level':
        // 日志级别：以 Info 为主，少量 Warn / Error
        return pick(rng, [1, 2, 2, 2, 2, 2, 3, 4, 5])
      case 'message':
        return pick(rng, [
          '请求处理完成',
          '定时任务执行成功',
          '接口响应超时，已自动重试',
          '数据库连接池使用率偏高',
          '文件上传完成',
          '消息推送成功',
          '缓存刷新完成',
          '导出任务已生成',
        ])
      case 'appname':
        return pick(rng, ['Atlas.Web', 'Atlas.Api', 'Atlas.Job', 'Atlas.Mobile'])
      case 'hostname':
      case 'host':
        return `app-node-${String(intBetween(rng, 1, 4)).padStart(2, '0')}`
      case 'ip':
        // 接口下发的是整数 IP（页面用 intToIp 转换），取 192.0.2.0/24 文档示例网段
        return ((192 << 24) | (2 << 8) | intBetween(rng, 2, 250)) >>> 0
      case 'username':
        return ctx.person.name
      case 'usersub':
        return ctx.person.id
      case 'httpmethod':
        return pick(rng, ['GET', 'GET', 'GET', 'POST', 'PUT', 'DELETE'])
      case 'httpstatuscode':
        return pick(rng, [200, 200, 200, 200, 200, 201, 204, 304, 400, 404, 500])
      case 'requestpath':
      case 'routeendpoint':
        return pick(rng, [
          '/api/asset/allot/list',
          '/api/pense/reimburse/search',
          '/api/vouch/entry/get',
          '/api/staff/info/search',
          '/api/paper/borrow/audit',
          '/api/identity/profile/get',
        ])
      case 'requestpathbase':
        return '/api'
      case 'elapsedtime':
        return intBetween(rng, 8, 980)
      case 'requestcontentlength':
      case 'responsecontentlength':
        return intBetween(rng, 200, 20000)
      case 'requestcontenttype':
      case 'responsecontenttype':
        return 'application/json; charset=utf-8'
      case 'requesttime':
      case 'time': {
        // 日志时间需要精确到时分秒，直接走 date 类型会退化成 00:00:00
        const d = dateOffset(-intBetween(rng, 0, 7))
        d.setHours(intBetween(rng, 8, 20), intBetween(rng, 0, 59), intBetween(rng, 0, 59))
        return toDateTimeString(d)
      }
      case 'ex':
        return rng() > 0.85 ? 'System.TimeoutException: 请求超时' : ''
      case 'progress':
        return pick(rng, ['完成', '完成', '完成', '完成', '失败'])
      case 'source':
        return pick(rng, ['Web', 'App', 'Api', 'Job'])
      case 'ref_count':
        return intBetween(rng, 0, 5)
    }
  }

  // ---------- 身份与人员 ----------
  const PERSON_FIELDS = new Set([
    'user_name',
    'create_name',
    'check_name',
    'current_name',
    'next_name',
    'keeper',
    'fore',
    'contact',
    'linkman',
    'principal',
    'legal',
  ])
  if (PERSON_FIELDS.has(lower))
    return ctx.person.name
  if (lower === 'user_id' || lower === 'create_id' || lower === 'check_id')
    return ctx.person.id
  if (lower === 'team_name' || lower === 'team_in_name' || lower === 'team_out_name' || lower === 'dept_name' || lower === 'branch_name')
    return ctx.team.name
  if (lower === 'team_id' || lower === 'dept_id' || lower === 'branch_id' || lower === 'team_in' || lower === 'team_out')
    return ctx.team.id
  if (lower === 'post_name' || lower === 'job_name' || lower === 'position' || lower === 'post')
    return pick(rng, POSITIONS)
  if (lower === 'mobile' || lower === 'phone' || lower === 'tel')
    return maskedMobile(rng)
  if (lower === 'card')
    return maskedCard(rng)
  if (lower === 'card_issue')
    return '示例签发机关'
  if (lower === 'card_valid')
    return toDateString(dateOffset(intBetween(rng, 200, 3000)))
  if (lower === 'email')
    return `user${String(ctx.index + 1).padStart(3, '0')}@example.com`
  if (lower === 'gender')
    return intBetween(rng, 10, 12)
  if (lower === 'nation')
    return pick(rng, NATIONS)
  if (lower === 'politics')
    return pick(rng, POLITICS)
  if (lower === 'marital')
    return pick(rng, MARRIAGES)
  if (lower === 'educate')
    return pick(rng, EDUCATIONS)
  if (lower === 'school')
    return `${pick(rng, CITIES).replace('市', '')}大学`
  if (lower === 'major')
    return pick(rng, ['会计学', '财务管理', '工商管理', '计算机科学与技术', '机械工程', '市场营销', '人力资源管理'])

  // ---------- 单据标识 ----------
  if (lower === 'no' || lower === 'billno' || lower === 'voucher_no')
    return buildSerial(ctx)
  if (lower === 'code' || lower === 'asset_code')
    return `${(SERIAL_PREFIX[ctx.module.split('/')[0] || ''] || 'BM')}${`${ctx.index + 1}`.padStart(5, '0')}`
  if (lower === 'sn')
    return `SN${intBetween(rng, 10000000, 99999999)}`

  // ---------- 会计科目 ----------
  if (lower === 'content_name' || lower === 'subject' || lower === 'account_subject')
    return pick(rng, ACCOUNT_SUBJECTS)
  if (lower === 'content_id')
    return `10${intBetween(rng, 1, 26)}`

  // ---------- 资产 ----------
  if (lower === 'asset_name' || lower === 'name_of_asset')
    return pick(rng, ASSET_NAMES)
  if (lower === 'brand')
    return pick(rng, ASSET_BRANDS)
  if (lower === 'model')
    return pick(rng, ASSET_MODELS)
  if (lower === 'location')
    return `${pick(rng, ['A 座', 'B 座', 'C 座'])}${intBetween(rng, 1, 9)}0${intBetween(rng, 1, 9)} 室`

  // ---------- 银行与往来 ----------
  if (lower === 'bank')
    return pick(rng, BANKS)
  if (lower === 'payee_bank' || lower === 'bank_open' || lower === 'payee_open')
    return pick(rng, BANK_BRANCHES)
  if (lower === 'account')
    return bankAccount(rng)
  if (lower === 'payee_name' || lower === 'partner_name' || lower === 'customer_name' || lower === 'supplier_name')
    return ctx.partner
  if (lower === 'payee_link')
    return maskedMobile(rng)
  if (lower === 'payee_type')
    return intBetween(rng, 1, 2)
  if (lower === 'currency')
    return pick(rng, CURRENCIES)
  if (lower === 'deposit' || lower === 'margin')
    return floatBetween(rng, 1000, 50000, 2)
  if (lower === 'pay_type' || lower === 'paytype')
    return pick(rng, PAY_TYPES)

  // ---------- 摘要与说明 ----------
  if (lower === 'digest')
    return pick(rng, DIGESTS)
  if (lower === 'title')
    return `${pick(rng, DIGESTS)}（${intBetween(rng, 1, 12)} 月）`
  if (lower === 'remark' || lower === 'memo' || lower === 'reason')
    return pick(rng, REMARKS)
  if (lower === 'address')
    return `${pick(rng, CITIES)}${pick(rng, STREETS)}${intBetween(rng, 1, 200)} 号`
  if (lower === 'source')
    return pick(rng, ['手工录入', '系统导入', '接口生成', '移动端填报'])
  if (lower === 'file_name')
    return `${pick(rng, ['合同扫描件', '发票影像', '审批附件', '验收单'])}.pdf`
  if (lower === 'name')
    return pickNameValue(ctx, classifyModule(ctx.module))

  // ---------- 分类与计量 ----------
  // 「分类」类字段按业务域取值，否则会掉进摘要兜底，出现「设备折旧计提」这种资产分类
  if (
    lower === 'category_name'
    || lower === 'class_name'
    || lower === 'type_name'
    || lower === 'kind_name'
    || lower === 'types_name'
  ) {
    const list = CATEGORY_NAMES[classifyModule(ctx.module)] ?? CATEGORY_NAMES.generic!
    return pick(rng, list)
  }
  if (lower === 'parent_name' || lower === 'parent' || lower === 'pid_name')
    return pick(rng, PARENT_CATEGORIES)
  // 「计量单位」不能走「单位」关键字兜底，否则会填成往来单位名称
  if (lower === 'unit_name' || lower === 'measure_unit' || lower === 'unit')
    return pick(rng, MEASURE_UNITS)

  // ---------- 单据明细通用字段 ----------
  if (lower === 'pcs' || lower === 'qty' || lower === 'nums' || lower === 'quantity')
    return intBetween(rng, 1, 20)
  if (lower === 'totals' || lower === 'total' || lower === 'taxes' || lower === 'tax')
    return floatBetween(rng, 100, 60000, 2)
  if (lower === 'rates' || lower === 'tax_rate')
    return pick(rng, [0.06, 0.09, 0.13])
  if (lower === 'drawer' || lower === 'biller')
    return ctx.person.name

  // ---------- 按类型兜底 ----------
  switch (t) {
    case 'money':
      return floatBetween(rng, 100, 98000, 2)
    case 'number':
      return intBetween(rng, 1, 500)
    case 'date':
      return toDateString(dateOffset(-intBetween(rng, 0, 120)))
    case 'datetime':
      return toDateTimeString(dateOffset(-intBetween(rng, 0, 30)))
    case 'bool':
      return rng() > 0.75
    case 'enums':
      return intBetween(rng, 1, 5)
    default:
      return fallbackByTitle(title || '', ctx)
  }
}
