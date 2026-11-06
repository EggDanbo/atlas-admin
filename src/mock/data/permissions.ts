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
  PUR: '采购管理',
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
  EMPLOYEE_ROSTER: '员工花名册',
  EMPLOYEE_MOVEMENT: '异动流水',
  ORG_TEAM: '团队编制',
  ATTENDANCE_RECORD: '考勤明细',
  ATTENDANCE_SUMMARY: '月度汇总',
  PAYROLL_SHEET: '工资表',
  HR_REPORT_DASHBOARD: '人力看板',
  // 费用管理
  BUDGET_QUOTA: '预算额度',
  CLAIM_LIST: '费用申请',
  CONTRACT_LIST: '合同台账',
  PAYMENT_LIST: '支付记录',
  EXP_REPORT_DASHBOARD: '费用看板',
  // 资产管理
  LEDGER_LIST: '资产台账',
  FLOW_LIST: '流转记录',
  VALUE_DEPRECIATION: '折旧明细',
  CHECK_LIST: '盘点任务',
  MAINTAIN_LIST: '维保计划',
  AST_REPORT_DASHBOARD: '资产看板',
  // 采购管理
  SUPPLIER_LIST: '供应商台账',
  ORDER_REQUEST: '采购申请',
  ORDER_LIST: '采购订单',
  SETTLEMENT_RECEIPT: '到货验收',
  SETTLEMENT_PAYABLE: '对账付款',
  PUR_REPORT_OVERVIEW: '采购看板',
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
      // 先按完整权限码查：不同模块都有「看板」这类资源，
      // 只按资源名查会让人力看板、费用看板全显示成同一个名字
      title: RESOURCE_LABELS[code] || RESOURCE_LABELS[resource] || resource,
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
