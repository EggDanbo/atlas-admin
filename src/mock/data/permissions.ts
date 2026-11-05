/**
 * 演示账号的权限数据
 *
 * 思路：从路由声明中提取全部权限码，再补齐列表页操作按钮使用的动作后缀，
 * 使演示账号成为「拥有全部权限的普通用户」——
 * 这样既能看全菜单与操作按钮，又能呈现普通员工的工作台视图。
 *
 * 权限码约定：`{域}_{资源}` 或 `{域}_{分组}_{资源}`，域名见 MODULE_LABELS。
 */
import { ROUTE_PERMISSIONS } from '../schema/schema.generated'

/** 列表页/详情页使用的动作权限后缀 */
const ACTION_SUFFIXES = ['ADD', 'EDIT', 'DELE', 'EXPORT', 'PRINT', 'AUDIT']

/** 权限码域前缀 → 中文分组名 */
const MODULE_LABELS: Record<string, string> = {
  DASH: '工作台',
  CRM: '客户与项目',
  HR: '人力资源',
  EXP: '费用管理',
  AST: '资产管理',
  FIN: '财务管理',
  DOC: '文档中心',
  MDM: '主数据',
  IAM: '组织与权限',
  SYS: '系统管理',
  ME: '个人中心',
}

/** 资源名 → 中文显示名 */
const RESOURCE_LABELS: Record<string, string> = {
  // 工作台
  MONITOR: '运营监控',
  // 客户与项目
  CUSTOMER_ARCHIVE: '客户档案',
  CUSTOMER_CONTACT: '联系人',
  OPPORTUNITY_LIST: '商机列表',
  OPPORTUNITY_FUNNEL: '销售漏斗',
  DELIVERY_PROJECT: '项目台账',
  DELIVERY_MILESTONE: '里程碑',
  BILLING_INVOICE: '开票记录',
  BILLING_RECEIPT: '回款登记',
  BILLING_REVENUE: '客户收入',
  // 人力资源
  ROSTER: '员工名册',
  RESUME: '简历库',
  TEAM: '团队',
  MOVEMENT_ONBOARD: '入职',
  MOVEMENT_TRANSFER: '调入',
  MOVEMENT_ADJUST: '调岗',
  MOVEMENT_PROMOTION: '晋升',
  EXIT_RESIGN: '主动离职',
  EXIT_DISMISS: '解聘',
  EXIT_ABSENT: '自动离职',
  RELATION_CONTRACT: '劳动合同',
  RELATION_LEVEL: '职级',
  RELATION_REWARD: '奖惩',
  RELATION_TRAINING: '培训',
  ATTENDANCE_RULE: '考勤规则',
  ATTENDANCE_HOLIDAY: '假期设置',
  ATTENDANCE_LEAVE: '请假规则',
  ATTENDANCE_PUNCH: '打卡记录',
  ATTENDANCE_DAILY: '每日明细',
  ATTENDANCE_SUMMARY: '日汇总',
  ATTENDANCE_MONTHLY: '月汇总',
  APPLY_MAKEUP: '补卡',
  APPLY_FIELD: '外出',
  APPLY_OVERTIME: '加班',
  APPLY_SHIFT: '调班',
  APPLY_LEAVE: '请假',
  INSURANCE_HOUSING: '公积金',
  INSURANCE_SOCIAL: '社会保险',
  INSURANCE_COMMERCIAL: '商业保险',
  DEDUCTION_HOUSING: '公积金扣款',
  DEDUCTION_SOCIAL: '社保扣款',
  PAYROLL_GROUP: '薪酬组',
  PAYROLL_GENERATE: '薪酬生成',
  PAYROLL_PAYMENT: '薪酬发放',
  REPORT_STRUCTURE: '人员结构',
  REPORT_SUMMARY: '薪酬汇总',
  // 费用管理
  BUDGET: '预算额度',
  CONTRACT: '合同',
  REQUEST_PURCHASE: '采购申请',
  REQUEST_TRAVEL: '出差申请',
  REQUEST_ENTERTAIN: '招待申请',
  CLAIM_REIMBURSE: '报销申请',
  CLAIM_ADVANCE: '备用金申请',
  CLAIM_DEPOSIT: '保证金申请',
  CLAIM_TAX: '税费支付申请',
  PAYMENT: '费用支付',
  QUERY: '申请查询',
  // 资产管理
  INFO: '资产台账',
  APPLY: '领用申请',
  ORDER: '采购申请',
  BATCH: '验收入库',
  ALLOT: '调拨',
  LEASE: '借出',
  DISUSE: '处置',
  CHECK: '盘点',
  VALUE: '折旧',
  REPAIR: '维保',
  // 财务管理
  TREASURY_OVERVIEW: '资金总览',
  TREASURY_ACCOUNT: '银行账户',
  TREASURY_PLAN: '资金计划',
  ARAP_RECEIVABLE: '应收账龄',
  ARAP_PAYABLE: '应付账款',
  BUDGET_EXECUTION: '预算执行',
  BUDGET_PROJECT: '项目成本',
  ANALYSIS_DASHBOARD: '经营看板',
  ANALYSIS_INDICATOR: '财务指标',
  // 文档中心
  DOCUMENT: '文档库',
  BORROW: '借阅',
  // 主数据
  HOLIDAY: '假期类型',
  PAYROLL_ITEM: '薪酬项目',
  BIZ_TYPE: '业务类型',
  ASSET_CATEGORY: '资产分类',
  BANK_ACCOUNT: '银行账户',
  DIMENSION: '核算维度',
  SUBJECT: '会计科目',
  CASHFLOW_ITEM: '现金流项目',
  CARRYOVER: '结转模板',
  // 组织与权限
  UNIT: '组织单元',
  MEMBER: '成员',
  PARTNER: '外部协作',
  ROLE: '角色',
  GRANT: '授权',
  GROUP: '权限组',
  PARTNER_ROLE: '合作方角色',
  PARTNER_ACCOUNT: '合作方账号',
  // 系统管理
  PARAMETER: '系统参数',
  DICTIONARY: '数据字典',
  GRID: '表格格式',
  LOG: '操作审计',
}

/** 把权限码拆成 [域名, 资源名] */
function splitCode(code: string): [string, string] {
  const idx = code.indexOf('_')
  if (idx < 0)
    return ['OTHER', code]
  return [code.slice(0, idx), code.slice(idx + 1)]
}

/** 演示账号拥有的全部权限码 */
export const MOCK_PERMISSION_CODES: string[] = [
  ...ROUTE_PERMISSIONS,
  ...ROUTE_PERMISSIONS.flatMap(code => ACTION_SUFFIXES.map(suffix => `${code}_${suffix}`)),
]

/**
 * 构建权限树（供用户权限分配弹窗展示）
 */
export function buildPermissionTree(): Auth.Permission[] {
  const groups = new Map<string, Auth.Permission[]>()

  for (const code of ROUTE_PERMISSIONS) {
    const [domain, resource] = splitCode(code)
    if (!groups.has(domain))
      groups.set(domain, [])
    groups.get(domain)!.push({
      id: code,
      title: RESOURCE_LABELS[resource] || resource,
      children: ACTION_SUFFIXES.map(suffix => ({
        id: `${code}_${suffix}`,
        title: suffix,
        children: [],
      })),
    })
  }

  return [...groups.entries()].map(([key, children]) => ({
    id: key,
    title: MODULE_LABELS[key] || key,
    children,
  }))
}
