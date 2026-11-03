import type { ColumnType } from '../data/fieldValue'
import type { MockFieldSchema } from './schema.generated'
/**
 * 由视图结构生成表格列定义（模拟服务端下发的 dataformat）
 */
import type { DataFormatColumn } from '@/components/SpTable'
import { inferColumnType, isSummable, resolveModuleTitle, resolveTitle } from '../data/fieldValue'
import {
  FIELD_TITLE_DICT,
  FORMAT_OWNER,
  MODULE_SCHEMA,
} from './schema.generated'

/** 最多展示的列数，避免演示页面出现过于密集的表格 */
const MAX_COLUMNS = 12

/** 各类型的默认列宽 */
const WIDTH_BY_TYPE: Record<ColumnType, number> = {
  text: 160,
  number: 100,
  money: 130,
  date: 120,
  datetime: 165,
  bool: 90,
  enums: 110,
}

/** 各类型对应的显示格式 */
const DISPLAY_FORMAT: Record<ColumnType, string> = {
  text: '',
  number: '',
  money: '#,##0.00',
  date: 'yyyy-MM-dd',
  datetime: 'yyyy-MM-dd HH:mm:ss',
  bool: '是/否',
  enums: '',
}

/**
 * 不应出现在表格中的字段
 *
 * sort / operate 这类字段由页面自身的操作列渲染（isOperate: true），
 * 若 dataformat 再下发一次，同一个 field 会在表格里出现两次。
 */
const HIDDEN_FIELDS = new Set(['id', 'printed', 'stoped', 'types', 'children', 'pid', 'sort', 'operate', 'operation', 'user_pic'])

/**
 * 接口模块前缀 → 视图目录
 *
 * 少数模块的接口路径前缀与页面所在目录不一致（日志类都在 `views/system/log`，
 * 但接口是 `logs/xxx`），不映射就会取不到字段结构，列表只剩通用单据字段。
 */
const MODULE_ALIAS: Record<string, string> = {
  'logs/app': 'system/log',
  'logs/access': 'system/log',
  'logs/bizlog': 'system/log',
  'logs/visits': 'system/log',
  'logs/import': 'system/log',
  'logs/delete': 'system/log',
}

/** 解析格式名对应的模块目录 */
export function resolveModuleDir(name?: string | null): string | null {
  if (!name)
    return null
  if (MODULE_SCHEMA[name])
    return name

  const alias = MODULE_ALIAS[name]
  if (alias && MODULE_SCHEMA[alias])
    return alias

  const owner = FORMAT_OWNER[name]
  if (owner)
    return owner

  // 接口前缀与视图目录前缀不一致时（external/role 对应 permit/external/role），按路径后缀兜底
  const suffix = `/${name}`
  const bySuffix = Object.keys(MODULE_SCHEMA).find(key => key.endsWith(suffix))
  if (bySuffix)
    return bySuffix

  // atlas/asset/bill -> asset/bill，逐级向下尝试
  const segments = name.split('/').filter(Boolean)
  for (let i = 0; i < segments.length; i++) {
    const candidate = segments.slice(i).join('/')
    if (MODULE_SCHEMA[candidate])
      return candidate
  }
  return null
}

/** 取出模块的全部业务字段（用于生成详情数据） */
export function resolveAllFields(name?: string | null): MockFieldSchema[] {
  const dir = resolveModuleDir(name)
  if (!dir)
    return []
  return MODULE_SCHEMA[dir]?.fields ?? []
}

/** 取出模块的候选列字段 */
export function resolveFields(name?: string | null): MockFieldSchema[] {
  const dir = resolveModuleDir(name)
  if (!dir)
    return []

  const schema = MODULE_SCHEMA[dir]
  if (!schema)
    return []

  // 列表页真实列字段优先；列太少时用全量业务字段补足
  const base = schema.columnFields.length >= 3 ? schema.columnFields : schema.fields
  const used = new Set(base.map(item => item.field))
  const extra = schema.fields.filter(item => !used.has(item.field))
  return [...base, ...extra]
}

/** 过滤掉不适合展示的字段 */
function filterDisplayable(fields: MockFieldSchema[]): MockFieldSchema[] {
  const names = new Set(fields.map(item => item.field))
  return fields.filter((item) => {
    const field = item.field
    if (HIDDEN_FIELDS.has(field))
      return false
    // 外键统一走对应的 _name 字段展示
    if (field.endsWith('_id'))
      return false
    // 存在 xxx_name 时，xxx 通常是外键，展示 name 更直观
    if (names.has(`${field}_name`))
      return false
    return true
  })
}

/** 我的申请 / 我的审批：跨业务单据的待办列表，字段由 workflow 接口固定返回 */
const WORKFLOW_FIELDS: MockFieldSchema[] = [
  { field: 'biz_name', title: '业务类型' },
  { field: 'user_name', title: '申请人' },
  { field: 'team_name', title: '所属部门' },
  { field: 'content', title: '摘要' },
  { field: 'ctime', title: '提交时间' },
  { field: 'status', title: '状态' },
]

/**
 * 角色类页面字段
 *
 * 角色页的自动结构取自「角色授权」表单（role / perms / data 三个授权项），
 * 直接当列表列用会渲染出三列无值单元格，这里换成角色台账的字段组合。
 */
const ROLE_FIELDS: MockFieldSchema[] = [
  { field: 'name', title: '角色名称' },
  { field: 'code', title: '角色标识' },
  { field: 'kind', title: '角色类型' },
  { field: 'data', title: '数据范围' },
  { field: 'perms', title: '权限项' },
]

/** 需要覆盖自动结构的格式 */
const FIELD_OVERRIDES: Record<string, MockFieldSchema[]> = {
  'access/role': ROLE_FIELDS,
  'access/partner-role': ROLE_FIELDS,
}

/**
 * 生成某数据格式的列定义
 * @param name 数据格式名（如 atlas/asset/bill）或模块目录（如 asset/allot）
 */
export function buildColumns(name?: string | null): DataFormatColumn[] {
  const override = name ? FIELD_OVERRIDES[name] : undefined
  let fields = override
    ? [...override]
    : (name === 'workflow' ? [...WORKFLOW_FIELDS] : resolveFields(name))

  // 业务域目录：用于修正「名称」这类通用字段的标题
  const moduleDir = resolveModuleDir(name) ?? name ?? ''

  if (!fields.length) {
    // 无结构信息时给出通用列，保证表格不为空
    fields = [
      { field: 'no', title: '单号' },
      { field: 'date', title: '日期' },
      { field: 'team_name', title: '部门' },
      { field: 'user_name', title: '经办人' },
      { field: 'digest', title: '摘要' },
      { field: 'amount', title: '金额' },
      { field: 'status', title: '状态' },
      { field: 'remark', title: '备注' },
    ]
  }

  const displayable = filterDisplayable(fields)

  // 标题去重：同一张表格里不出现同名列
  const usedTitles = new Set<string>()
  const usedFields = new Set<string>()
  const picked: Array<{ field: string, title: string }> = []

  for (const item of displayable) {
    // 显式覆盖的字段集自带贴合语境的标题，不再走词根推断
    const title = override
      ? item.title
      : resolveModuleTitle(item.field, resolveTitle(item.field, item.title, FIELD_TITLE_DICT), moduleDir)
    if (!title || usedTitles.has(title) || usedFields.has(item.field))
      continue
    usedTitles.add(title)
    usedFields.add(item.field)
    picked.push({ field: item.field, title })
    if (picked.length >= MAX_COLUMNS)
      break
  }

  const used = picked.length
    ? picked
    : fields.slice(0, MAX_COLUMNS).map(item => ({
        field: item.field,
        title: resolveModuleTitle(item.field, resolveTitle(item.field, item.title, FIELD_TITLE_DICT), moduleDir),
      }))

  return used.map((item, index) => {
    // 状态类字段使用枚举，表格中直接显示中文状态
    const isStatus = /^(status|states|state)$/i.test(item.field)
    const type: ColumnType = isStatus ? 'enums' : inferColumnType(item.field)
    const column: DataFormatColumn = {
      column: item.field,
      title: item.title,
      hcolumn: '',
      align: type === 'money' || type === 'number' ? 'right' : 'left',
      width: WIDTH_BY_TYPE[type],
      type,
      search: '',
      disablefilter: '',
      fixed: index === 0 ? 'left' : null,
      format: DISPLAY_FORMAT[type],
      enums: isStatus ? 'BillStatus' : null,
      enumstype: null,
      isfilter: type !== 'bool',
      isview: true,
      isprint: true,
      ismerge: false,
      istotal: isSummable(item.field, type) ? '1' : '',
      sortable: true,
      filter_express: null,
      filter_value: null,
    }
    return column
  })
}
