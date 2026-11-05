/**
 * 费用管理 mock 数据
 *
 * 旧模块把费用类型拆成了菜单：报销、借款、保证金、税费、采购、出差、招待各一页，
 * 其实都是「一张申请单 + 一个类型」，查一笔费用要挨个菜单翻。
 * 这里合成一张申请单，类型做成列与筛选项；支付与合同分别独立成台账。
 *
 * 口径约束：
 * - 预算的已用与执行率由金额推导，剩余 = 预算 - 已用
 * - 合同付款进度 = 已付 / 合同额，不单独随机
 * - 支付记录挂在申请单上，金额不超过申请金额
 * - 看板的月度与类别合计，等于对应申请单的汇总
 */
import { GIVEN_NAMES, PARTNERS, SURNAMES } from './dict'
import { createRng, dateOffset, floatBetween, intBetween, pick, toDateString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))
const money = (rng: () => number, min: number, max: number) => round2(floatBetween(rng, min, max, 2))

const EXPENSE_TYPES = ['差旅费', '业务招待', '办公采购', '交通费', '培训费', '通讯费'] as const
const CLAIM_STATES = ['已支付', '已通过', '审批中', '已驳回'] as const

interface Claim {
  id: string
  claim_no: string
  applicant: string
  dept_name: string
  expense_type: string
  amount: number
  apply_date: string
  claim_state: string
}

interface ExpenseDataset {
  claims: Claim[]
  budgets: Record<string, any>[]
  contracts: Record<string, any>[]
  payments: Record<string, any>[]
}

let cache: ExpenseDataset | null = null

function buildClaims(): Claim[] {
  return Array.from({ length: 42 }, (_, index) => {
    const rng = createRng(`expense/claim#${index}`)
    const type = EXPENSE_TYPES[index % EXPENSE_TYPES.length]!
    const amount = type === '办公采购'
      ? money(rng, 3_000, 96_000)
      : type === '业务招待'
        ? money(rng, 800, 26_000)
        : money(rng, 300, 18_000)
    // 按月轮转，保证每个月都有单据：纯随机日期会出现「本月费用 0 元」，
    // 而且月度柱状图中间断档，看着像数据丢了
    const monthOffset = index % 12
    const base = new Date(new Date().getFullYear(), new Date().getMonth() - monthOffset, 1)
    const maxDay = monthOffset === 0 ? new Date().getDate() : 28
    const applyDate = new Date(base.getFullYear(), base.getMonth(), intBetween(rng, 1, maxDay))
    return {
      id: `EC${String(index + 1).padStart(4, '0')}`,
      claim_no: `${type === '差旅费' ? 'CL' : type === '业务招待' ? 'ZK' : 'BX'}${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
      applicant: `${SURNAMES[index % SURNAMES.length]}${GIVEN_NAMES[(index * 2) % GIVEN_NAMES.length]}`,
      dept_name: ['综合管理部', '市场运营部', '技术研发部', '采购供应部', '财务部'][index % 5]!,
      expense_type: type,
      amount,
      apply_date: toDateString(applyDate),
      claim_state: CLAIM_STATES[index % CLAIM_STATES.length]!,
    }
  }).sort((a, b) => (a.apply_date < b.apply_date ? 1 : -1))
}

function buildBudgets(claims: Claim[]) {
  return EXPENSE_TYPES.map((type, index) => {
    const rng = createRng(`expense/budget#${index}`)
    const annual = claims
      .filter(item => item.expense_type === type && item.claim_state !== '已驳回')
      .reduce((sum, item) => sum + item.amount, 0)
    // 年度预算在已发生额基础上留 10%~45% 余量，个别类别吃紧
    const budget = round2(annual * floatBetween(rng, 1.1, 1.45))
    return {
      id: `EB${String(index + 1).padStart(3, '0')}`,
      expense_type: type,
      year: new Date().getFullYear(),
      budget_amount: budget,
      used_amount: round2(annual),
      remain_amount: round2(budget - annual),
      execution_rate: Math.round((annual / budget) * 100),
    }
  })
}

function buildContracts() {
  return Array.from({ length: 18 }, (_, index) => {
    const rng = createRng(`expense/contract#${index}`)
    const supplier = PARTNERS[index % PARTNERS.length]!
    const amount = money(rng, 120_000, 3_600_000)
    const signOffset = -intBetween(rng, 30, 640)
    const duration = intBetween(rng, 180, 720)
    const expireOffset = signOffset + duration
    const paidRatio = index % 6 === 5 ? floatBetween(rng, 0.2, 0.5) : floatBetween(rng, 0.55, 1)
    const paid = round2(amount * paidRatio)
    return {
      id: `EK${String(index + 1).padStart(4, '0')}`,
      contract_no: `HT${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
      contract_name: `${supplier.replace('有限公司', '')}${pick(rng, ['年度采购', '服务外包', '设备维保', '办公租赁'])}合同`,
      supplier,
      amount,
      sign_date: toDateString(dateOffset(signOffset)),
      expire_date: toDateString(dateOffset(expireOffset)),
      paid_amount: paid,
      payment_rate: Math.round(paidRatio * 100),
      // 90 天内到期标为「即将到期」，已过期且未付完标「已到期」
      contract_state: expireOffset < 0 ? '已到期' : expireOffset < 90 ? '即将到期' : '履行中',
    }
  }).sort((a, b) => (a.expire_date < b.expire_date ? -1 : 1))
}

function buildPayments(claims: Claim[]) {
  const payable = claims.filter(item => item.claim_state === '已支付' || item.claim_state === '已通过')
  return payable.map((claim, index) => {
    const rng = createRng(`expense/payment#${index}`)
    // 支付金额不超过申请金额，部分单子分批支付
    const ratio = index % 7 === 6 ? floatBetween(rng, 0.4, 0.7) : 1
    return {
      id: `EP${String(index + 1).padStart(4, '0')}`,
      payment_no: `FK${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
      claim_no: claim.claim_no,
      applicant: claim.applicant,
      dept_name: claim.dept_name,
      amount: round2(claim.amount * ratio),
      pay_method: pick(rng, ['对公转账', '银行代发', '内部划转']),
      pay_date: toDateString(dateOffset(-intBetween(rng, 1, 60))),
      pay_state: claim.claim_state === '已通过' ? '处理中' : '已支付',
    }
  })
}

function dataset(): ExpenseDataset {
  if (cache)
    return cache
  const claims = buildClaims()
  cache = {
    claims,
    budgets: buildBudgets(claims),
    contracts: buildContracts(),
    payments: buildPayments(claims),
  }
  return cache
}

// ==================== 分析页 ====================

export function buildExpenseDashboard() {
  const { claims, contracts, payments } = dataset()
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - index), 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  const valid = claims.filter(item => item.claim_state !== '已驳回')
  const monthly = months.map(label =>
    round2(valid.filter(item => item.apply_date.startsWith(label)).reduce((sum, item) => sum + item.amount, 0)),
  )

  const categoryShare = EXPENSE_TYPES.map(type => ({
    name: type,
    value: round2(valid.filter(item => item.expense_type === type).reduce((sum, item) => sum + item.amount, 0)),
  }))

  const deptRng = createRng('expense/dept')
  const deptTop = [...new Set(valid.map(item => item.dept_name))]
    .map(dept => ({
      name: dept,
      value: round2(valid.filter(item => item.dept_name === dept).reduce((sum, item) => sum + item.amount, 0)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const totalBudget = dataset().budgets.reduce((sum, item) => sum + item.budget_amount, 0)
  const totalUsed = dataset().budgets.reduce((sum, item) => sum + item.used_amount, 0)
  const pendingAmount = round2(valid.filter(item => item.claim_state === '审批中').reduce((sum, item) => sum + item.amount, 0))
  const expiring = contracts.filter(item => item.contract_state === '即将到期').length

  return {
    updated: toDateString(new Date()),
    summary: {
      month_amount: monthly.at(-1) ?? 0,
      total_used: round2(totalUsed),
      budget_rate: Math.round((totalUsed / Math.max(1, totalBudget)) * 100),
      pending_amount: pendingAmount,
      expiring_contracts: expiring,
      paid_amount: round2(payments.reduce((sum, item) => sum + item.amount, 0)),
      // 占位，避免模板里出现 undefined
      dept_count: deptRng() > 2 ? deptTop.length : deptTop.length,
    },
    months,
    expense_series: monthly,
    category_share: categoryShare,
    dept_top: deptTop,
    budgets: dataset().budgets,
  }
}

// ==================== 列表与路由 ====================

const EXPENSE_LISTS: Record<string, () => Record<string, any>[]> = {
  'expense/budget/quota': () => dataset().budgets,
  'expense/claim/list': () => dataset().claims,
  'expense/contract/list': () => dataset().contracts,
  'expense/payment/list': () => dataset().payments,
}

function paginate(rows: Record<string, any>[], params: Record<string, any>) {
  const keyword = String(params.filter ?? '').trim()
  const filtered = keyword
    ? rows.filter(row => Object.values(row).some(value => typeof value === 'string' && value.includes(keyword)))
    : rows

  const page = Math.max(1, Number(params.page) || 1)
  const pagesize = Math.max(1, Number(params.pagesize) || 30)
  const totalcount = filtered.length
  const totalpages = Math.max(1, Math.ceil(totalcount / pagesize))
  const current = Math.min(page, totalpages)
  const offset = (current - 1) * pagesize

  return {
    list: filtered.slice(offset, offset + pagesize),
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

/** 费用管理模块的 mock 入口 */
export function resolveExpenseMock(
  module: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'expense/report/dashboard')
    return buildExpenseDashboard()

  const builder = EXPENSE_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
