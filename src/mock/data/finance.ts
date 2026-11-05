/**
 * 财务管理 mock 数据
 *
 * 这套页面看的是「钱」本身：资金头寸、往来账龄、预算执行、项目毛利。
 * 通用随机引擎生成不出一致的数据——预算可能小于已用、应收账款各账龄段
 * 加起来对不上总额、供应商账期随机跳。这里改为按业务口径构造：
 * 先算纵向的总额，再拆横向的分项，保证任意一行都讲得通。
 *
 * 金额单位：元。
 */
import { BANKS, DEPARTMENTS, PARTNERS } from './dict'
import { createRng, floatBetween, intBetween, pick, toDateTimeString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))
const money = (rng: any, min: number, max: number) => round2(floatBetween(rng, min, max, 2))

/** 最近 n 个月（含当月），返回会计期间标签 */
function recentMonths(count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    }
  })
}

/** 往来单位：基础名 + 区域后缀，凑够需要的条数 */
function partnerNames(count: number) {
  const regions = ['华东', '华南', '华北', '西南', '华中', '东北']
  return Array.from({ length: count }, (_, index) => {
    const base = PARTNERS[index % PARTNERS.length]!
    if (index < PARTNERS.length)
      return base
    const region = regions[Math.floor(index / PARTNERS.length) % regions.length]!
    return `${base.replace('有限公司', '')}（${region}）有限公司`
  })
}

// ==================== 银行账户 ====================

const ACCOUNT_TEMPLATES = [
  { name: '基本存款账户', type: '基本户', currency: '人民币' },
  { name: '一般结算账户', type: '一般户', currency: '人民币' },
  { name: '货款归集账户', type: '一般户', currency: '人民币' },
  { name: '工资代发专户', type: '专用户', currency: '人民币' },
  { name: '项目保证金户', type: '保证金户', currency: '人民币' },
  { name: '外币结算账户', type: '外币户', currency: '美元' },
  { name: '境外采购账户', type: '外币户', currency: '港币' },
  { name: '备用金账户', type: '一般户', currency: '人民币' },
] as const

export function buildAccounts() {
  return ACCOUNT_TEMPLATES.map((item, index) => {
    const rng = createRng(`finance/account#${index}`)
    const balance = item.currency === '人民币'
      ? money(rng, 180_000, 8_600_000)
      : money(rng, 12_000, 460_000)
    const inflow = money(rng, 120_000, 3_200_000)
    const outflow = round2(inflow * floatBetween(rng, 0.55, 1.15))
    const bank = BANKS[index % BANKS.length]!
    return {
      id: `FA${String(index + 1).padStart(3, '0')}`,
      account_name: item.name,
      bank_name: `${bank}${item.currency === '人民币' ? '广州分行' : '离岸业务部'}`,
      account_no: `62${intBetween(rng, 10, 99)}${intBetween(rng, 1000, 9999)}${intBetween(rng, 1000, 9999)}${intBetween(rng, 1000, 9999)}`,
      currency: item.currency,
      account_type: item.type,
      balance,
      inflow_amount: inflow,
      outflow_amount: outflow,
      account_state_label: index === 6 ? '冻结' : '正常',
      updated_at: toDateTimeString(new Date(Date.now() - index * 3.5 * 3600 * 1000)),
    }
  })
}

// ==================== 资金计划 ====================

export function buildPlans() {
  // 三个年度 × 12 期，页面按年度筛选；最新一年尚未过完，最后一期只完成约七成
  const currentYear = new Date().getFullYear()
  const periods = [-2, -1, 0].flatMap(offset =>
    Array.from({ length: 12 }, (_, month) => ({
      year: currentYear + offset,
      month: month + 1,
      index: (offset + 2) * 12 + month,
      isCurrentYear: offset === 0,
    })),
  )
  return periods.map((period) => {
    const index = period.index
    const rng = createRng(`finance/plan#${index}`)
    const planIn = money(rng, 2_600_000, 7_800_000)
    const planOut = round2(planIn * floatBetween(rng, 0.72, 1.06))
    // 实际值围绕计划上下浮动 ±12%，最后一个月还没走完，只完成七成
    const ratio = period.isCurrentYear && period.month === new Date().getMonth() + 1 ? 0.7 : floatBetween(rng, 0.88, 1.12)
    const actualIn = round2(planIn * ratio * floatBetween(rng, 0.96, 1.04))
    const actualOut = round2(planOut * ratio * floatBetween(rng, 0.94, 1.06))
    return {
      id: `FP${String(index + 1).padStart(3, '0')}`,
      year: period.year,
      month: period.month,
      plan_in_amount: planIn,
      plan_out_amount: planOut,
      actual_in_amount: actualIn,
      actual_out_amount: actualOut,
      diff_amount: round2((actualIn - actualOut) - (planIn - planOut)),
      execution_rate: Math.round(((actualIn + actualOut) / (planIn + planOut)) * 100),
    }
  })
}

// ==================== 应收账龄 ====================

export function buildReceivables() {
  return partnerNames(18).map((customer, index) => {
    const rng = createRng(`finance/receivable#${index}`)
    const notDue = money(rng, 30_000, 1_800_000)
    const m1 = money(rng, 0, 420_000)
    const m2 = money(rng, 0, 260_000)
    const m3 = money(rng, 0, 150_000)
    const over = money(rng, 0, 90_000)
    // 超 90 天的按 30%~60% 计提坏账，账龄越长风险越高
    const badDebt = round2(over * floatBetween(rng, 0.3, 0.6) + m3 * floatBetween(rng, 0.05, 0.15))
    const total = round2(notDue + m1 + m2 + m3 + over)
    const overdueDays = over > 0 ? intBetween(rng, 91, 420) : m3 > 0 ? intBetween(rng, 61, 90) : m2 > 0 ? intBetween(rng, 31, 60) : m1 > 0 ? intBetween(rng, 1, 30) : 0
    return {
      id: `FR${String(index + 1).padStart(3, '0')}`,
      customer,
      total_amount: total,
      not_due_amount: notDue,
      overdue_m1_amount: m1,
      overdue_m2_amount: m2,
      overdue_m3_amount: m3,
      overdue_over_amount: over,
      bad_debt_amount: badDebt,
      overdue_days: overdueDays,
    }
  }).sort((a, b) => b.total_amount - a.total_amount)
}

// ==================== 应付账款 ====================

export function buildPayables() {
  const levels = ['A', 'A', 'B', 'B', 'C']
  return partnerNames(16).map((supplier, index) => {
    const rng = createRng(`finance/payable#${index}`)
    const total = money(rng, 60_000, 2_400_000)
    const dueMonth = round2(total * floatBetween(rng, 0.2, 0.65))
    const overdue = index % 5 === 3 ? round2(total * floatBetween(rng, 0.08, 0.3)) : 0
    return {
      id: `FAP${String(index + 1).padStart(3, '0')}`,
      supplier,
      total_amount: total,
      due_month_amount: dueMonth,
      overdue_amount: overdue,
      credit_days: pick(rng, [30, 45, 60, 90, 120]),
      credit_level: levels[index % levels.length]!,
    }
  }).sort((a, b) => b.total_amount - a.total_amount)
}

// ==================== 预算执行 ====================

export function buildBudgetExecution() {
  const depts = [...DEPARTMENTS]
  return depts.map((dept, index) => {
    const rng = createRng(`finance/budget#${index}`)
    const year = new Date().getFullYear()
    const budget = money(rng, 800_000, 6_600_000)
    // 大部分部门在 45%~95% 之间，少数超支，用于演示预警
    const rate = index % 7 === 5 ? intBetween(rng, 101, 118) : intBetween(rng, 45, 96)
    const used = round2(budget * (rate / 100))
    const remain = round2(budget - used)
    return {
      id: `FB${String(index + 1).padStart(3, '0')}`,
      dept,
      year,
      budget_amount: budget,
      used_amount: used,
      remain_amount: remain,
      execution_rate: rate,
      warning: rate > 100 ? '超支' : rate > 90 ? '关注' : '正常',
    }
  }).sort((a, b) => b.execution_rate - a.execution_rate)
}

// ==================== 项目成本 ====================

const PROJECT_SUFFIX = ['产线改造', '系统集成', '设备维保', '仓储升级', '数据治理', '园区安防']

export function buildProjectCosts() {
  return Array.from({ length: 15 }, (_, index) => {
    const rng = createRng(`finance/project-cost#${index}`)
    const partner = PARTNERS[index % PARTNERS.length]!.replace('有限公司', '')
    const project = `${partner}${PROJECT_SUFFIX[index % PROJECT_SUFFIX.length]}`
    const contract = money(rng, 480_000, 5_600_000)
    const labor = round2(contract * floatBetween(rng, 0.18, 0.32))
    const purchase = round2(contract * floatBetween(rng, 0.16, 0.34))
    const travel = round2(contract * floatBetween(rng, 0.02, 0.07))
    const other = round2(contract * floatBetween(rng, 0.01, 0.05))
    const profit = round2(contract - labor - purchase - travel - other)
    return {
      id: `FC${String(index + 1).padStart(3, '0')}`,
      project,
      contract_amount: contract,
      labor_cost: labor,
      purchase_cost: purchase,
      travel_cost: travel,
      other_cost: other,
      // 表格把差旅与杂项合成一列展示，这里直接给出合计值：
      // 表格只保留列上声明过的字段，未被列引用的字段在渲染前会被裁掉，
      // 所以在插槽里临时相加拿不到 other_cost
      other_total_amount: round2(travel + other),
      profit_amount: profit,
      gross_rate: Math.round((profit / contract) * 100),
    }
  }).sort((a, b) => b.contract_amount - a.contract_amount)
}

// ==================== 财务指标 ====================

/**
 * 指标值要和看板对得上：
 * 看板里净利 = 收入 - 成本 - 费用（约 21%），费用率约 16%，
 * 这里就不能再写 11% 的净利率，否则两页各说各话
 */
const INDICATORS = [
  { name: '流动比率', unit: '', current: 2.14, previous: 1.98, industry: 1.86, better: 'high' },
  { name: '速动比率', unit: '', current: 1.62, previous: 1.47, industry: 1.41, better: 'high' },
  { name: '现金比率', unit: '', current: 0.86, previous: 0.74, industry: 0.72, better: 'high' },
  { name: '资产负债率(%)', unit: '%', current: 48.3, previous: 52.6, industry: 55.2, better: 'low' },
  { name: '毛利率(%)', unit: '%', current: 38.42, previous: 35.16, industry: 34.1, better: 'high' },
  { name: '净利率(%)', unit: '%', current: 21.06, previous: 18.9, industry: 15.2, better: 'high' },
  { name: '费用率(%)', unit: '%', current: 16.35, previous: 18.92, industry: 15.8, better: 'low' },
  { name: '应收周转天数', unit: '天', current: 82, previous: 71, industry: 78, better: 'low' },
  { name: '净资产收益率(%)', unit: '%', current: 12.48, previous: 10.6, industry: 10.6, better: 'high' },
] as const

export function buildIndicators() {
  return INDICATORS.map((item, index) => {
    const gap = item.current - item.industry
    const good = item.better === 'high' ? gap >= 0 : gap <= 0
    const strong = Math.abs(gap) > Math.abs(item.industry) * 0.12
    return {
      id: `FI${String(index + 1).padStart(3, '0')}`,
      indicator: item.name,
      current_value: item.current,
      previous_value: item.previous,
      industry_value: item.industry,
      rating: good ? (strong ? '优' : '良') : '关注',
    }
  })
}

// ==================== 经营分析：月度序列 ====================

/** 近 12 个月的收入/成本/费用，按同一套增长节奏生成，毛利与费用率都在合理区间 */
function buildMonthlySeries() {
  const periods = recentMonths(12)
  let revenue = 2_450_000
  return periods.map((period, index) => {
    const rng = createRng(`finance/monthly#${index}`)
    revenue = round2(revenue * floatBetween(rng, 1.005, 1.045))
    const cost = round2(revenue * floatBetween(rng, 0.58, 0.66))
    const expense = round2(revenue * floatBetween(rng, 0.14, 0.19))
    return {
      label: period.label,
      revenue,
      cost,
      expense,
      profit: round2(revenue - cost - expense),
      gross_rate: round2(((revenue - cost) / revenue) * 100),
    }
  })
}

const EXPENSE_CATEGORIES = ['人力成本', '采购支出', '差旅交通', '市场推广', '办公及其他']

export function buildAnalysisDashboard() {
  const series = buildMonthlySeries()
  // 头部指标按近 12 个月累计算，和「财务指标」页的比率同一口径；
  // 只取最后一个月的话，同一张表里的毛利率会和指标页差出几个点
  const totalRevenue = round2(series.reduce((sum, item) => sum + item.revenue, 0))
  const totalCost = round2(series.reduce((sum, item) => sum + item.cost, 0))
  const totalProfit = round2(series.reduce((sum, item) => sum + item.profit, 0))
  const totalExpense = round2(series.reduce((sum, item) => sum + item.expense, 0))
  const weights = [0.42, 0.26, 0.12, 0.11, 0.09]
  const deptRng = createRng('finance/dept-expense')
  const deptTop = [...DEPARTMENTS]
    .map(dept => ({ name: dept, value: money(deptRng, 120_000, 1_600_000) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return {
    updated: toDateTimeString(new Date()),
    months: series.map(item => item.label),
    revenue: series.map(item => item.revenue),
    cost: series.map(item => item.cost),
    expense: series.map(item => item.expense),
    profit: series.map(item => item.profit),
    gross_rate: series.map(item => item.gross_rate),
    summary: {
      revenue: totalRevenue,
      profit: totalProfit,
      gross_rate: round2(((totalRevenue - totalCost) / totalRevenue) * 100),
      expense_rate: round2((totalExpense / totalRevenue) * 100),
      expense_total: totalExpense,
    },
    expense_share: EXPENSE_CATEGORIES.map((name, index) => ({
      name,
      value: round2(totalExpense * weights[index]!),
    })),
    dept_top: deptTop,
  }
}

// ==================== 资金总览 ====================

export function buildTreasuryOverview() {
  const accounts = buildAccounts()
  const balance = round2(accounts.reduce((sum, item) => sum + item.balance, 0))
  const inflow = round2(accounts.reduce((sum, item) => sum + item.inflow_amount, 0))
  const outflow = round2(accounts.reduce((sum, item) => sum + item.outflow_amount, 0))
  const series = buildMonthlySeries()
  // 未来 30 天：按近三个月净现金流均值外推，再叠加一笔集中付款
  const netAvg = round2(
    series.slice(-3).reduce((sum, item) => sum + (item.revenue - item.cost - item.expense), 0) / 3,
  )
  const upcoming = round2(netAvg - 620_000)

  return {
    updated: toDateTimeString(new Date()),
    summary: {
      balance,
      inflow,
      outflow,
      net: round2(inflow - outflow),
      upcoming_30: upcoming,
      frozen: round2(accounts.filter(item => item.account_state_label === '冻结').reduce((sum, item) => sum + item.balance, 0)),
    },
    months: series.map(item => item.label),
    inflow_series: series.map(item => item.revenue),
    outflow_series: series.map(item => round2(item.cost + item.expense)),
    accounts: accounts
      .map(item => ({ name: item.account_name, value: item.balance, currency: item.currency }))
      .sort((a, b) => b.value - a.value),
  }
}

// ==================== 列表 / 报表路由表 ====================

const FINANCE_LISTS: Record<string, () => Record<string, any>[]> = {
  'finance/treasury/account': buildAccounts,
  'finance/treasury/plan': buildPlans,
  'finance/arap/receivable': buildReceivables,
  'finance/arap/payable': buildPayables,
  'finance/budget/execution': buildBudgetExecution,
  'finance/budget/project-cost': buildProjectCosts,
  'finance/analysis/indicator': buildIndicators,
}

/** 统一分页结构，与通用列表接口保持一致 */
function paginate(rows: Record<string, any>[], params: Record<string, any>) {
  const keyword = String(params.filter ?? '').trim()
  const year = Number(params.year)
  const filtered = rows.filter((row) => {
    if (Number.isFinite(year) && year > 1900 && 'year' in row && Number(row.year) !== year)
      return false
    if (keyword && !Object.values(row).some(value => typeof value === 'string' && value.includes(keyword)))
      return false
    return true
  })

  const page = Math.max(1, Number(params.page) || 1)
  const pagesize = Math.max(1, Number(params.pagesize) || 30)
  const totalcount = filtered.length
  const totalpages = Math.max(1, Math.ceil(totalcount / pagesize))
  const current = Math.min(page, totalpages)
  const offset = (current - 1) * pagesize
  const list = filtered.slice(offset, offset + pagesize)
  return {
    list,
    totalcount,
    page: current,
    pageindex: current - 1,
    pagesize,
    totalpages,
    isempty: totalcount === 0,
    haspreviouspage: current > 1,
    hasnextpage: current < totalpages,
  }
}

/**
 * 财务模块的 mock 入口
 *
 * @returns 命中返回响应数据，未命中返回 undefined 交给通用逻辑
 */
export function resolveFinanceMock(
  module: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'finance/treasury/overview')
    return buildTreasuryOverview()
  if (module === 'finance/analysis/dashboard')
    return buildAnalysisDashboard()

  const builder = FINANCE_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
