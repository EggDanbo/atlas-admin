/**
 * 客户与项目 mock 数据
 *
 * 这一版按「客户经营 → 商机 → 项目交付 → 收入结算」组织，四组页面的数字必须能对上：
 * 客户合同额等于他名下项目的合同之和，应收余额等于开票减回款，
 * 项目回款进度等于该项目回款 / 合同额，漏斗里的在跟金额等于各阶段商机之和。
 *
 * 通用随机引擎给不出这种纵向一致——客户的合同额和项目列表各生成各的，
 * 随便点开一个客户，数字就对不上。所以先建一份共享数据集，各页面从同一份里取。
 */
import { CITIES, PARTNERS, PRODUCTS } from './dict'
import { createRng, dateOffset, floatBetween, intBetween, pick, toDateString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))
const money = (rng: () => number, min: number, max: number) => round2(floatBetween(rng, min, max, 2))

const INDUSTRIES = ['智能制造', '电子元件', '汽车零部件', '医药流通', '建筑工程', '信息技术', '新能源', '商贸零售']
const REGIONS = ['华东', '华南', '华北', '西南', '华中', '东北']
const LEVELS = ['战略客户', '重点客户', '普通客户']
const OWNERS = ['周敏', '李承宇', '陈可', '宋佳', '黄涛', '郑楠']
const SOURCES = ['老客户介绍', '行业展会', '官网咨询', '电话拜访', '合作伙伴推荐']

const STAGES = ['初步接洽', '需求确认', '方案报价', '商务谈判', '赢单'] as const
type Stage = (typeof STAGES)[number]

/** 阶段与赢单率的对应关系固定，不能各随机一个：越往后赢面越大是常识 */
const STAGE_WIN_RATE: Record<Stage | '输单', number> = {
  初步接洽: 10,
  需求确认: 25,
  方案报价: 45,
  商务谈判: 70,
  赢单: 100,
  输单: 0,
}

type ProjectState = '未启动' | '进行中' | '已交付' | '已暂停'

const MILESTONE_NODES = ['需求确认', '方案设计', '开发实施', '验收交付'] as const

interface CrmInvoice {
  id: string
  invoice_no: string
  customer_id: string
  project_id: string
  amount: number
  tax_rate: number
  invoice_type: string
  invoice_date: string
  invoice_state: string
}

interface CrmReceipt {
  id: string
  customer_id: string
  project_id: string
  invoice_id: string
  receipt_amount: number
  pay_method: string
  receipt_date: string
  receipt_state: string
}

interface CrmProject {
  id: string
  project_no: string
  project_name: string
  customer_id: string
  contract_amount: number
  manager: string
  project_state: ProjectState
  progress: number
  start: string
  end: string
  types: string
}

interface CrmDataset {
  customers: Record<string, any>[]
  projects: CrmProject[]
  invoices: CrmInvoice[]
  receipts: CrmReceipt[]
  milestones: Record<string, any>[]
  opportunities: Record<string, any>[]
}

/** 客户名称：基础名 + 区域后缀，保证 18 家不重名 */
function customerNames(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const base = PARTNERS[index % PARTNERS.length]!
    if (index < PARTNERS.length)
      return base
    const region = REGIONS[Math.floor(index / PARTNERS.length) % REGIONS.length]!
    return `${base.replace('有限公司', '')}（${region}）有限公司`
  })
}

let datasetCache: CrmDataset | null = null

function buildDataset(): CrmDataset {
  const names = customerNames(18)
  // 前几家客户多项目，后面的只有 1 个甚至没有（潜在客户），
  // 否则 24 个项目平均分给 18 家，谁都评不上战略客户
  const projectOwner = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 10, 11]
  const projects: CrmProject[] = []
  const invoices: CrmInvoice[] = []
  const receipts: CrmReceipt[] = []
  const milestones: Record<string, any>[] = []

  // ---------- 项目 ----------
  for (let index = 0; index < 24; index++) {
    const rng = createRng(`crm/project#${index}`)
    const customerIndex = projectOwner[index % projectOwner.length]!
    const state: ProjectState = index % 9 === 7 ? '未启动' : index % 11 === 9 ? '已暂停' : index % 3 === 0 ? '已交付' : '进行中'
    const progress = state === '已交付' ? 100 : state === '未启动' ? 0 : state === '已暂停' ? intBetween(rng, 35, 60) : intBetween(rng, 20, 95)
    const duration = intBetween(rng, 60, 240)
    const startOffset = -intBetween(rng, 40, 520)
    const contract = money(rng, 480_000, 6_800_000)
    const start = toDateString(dateOffset(startOffset))
    const end = toDateString(dateOffset(startOffset + duration))
    const project: CrmProject = {
      id: `CP${String(index + 1).padStart(4, '0')}`,
      project_no: `PRJ${new Date(start).getFullYear()}${String(index + 1).padStart(3, '0')}`,
      project_name: `${PARTNERS[customerIndex % PARTNERS.length]!.replace('有限公司', '')}${PRODUCTS[index % PRODUCTS.length]}项目`,
      customer_id: `CC${String(customerIndex + 1).padStart(4, '0')}`,
      contract_amount: contract,
      manager: pick(rng, OWNERS),
      project_state: state,
      progress,
      start,
      end,
      types: pick(rng, ['销售项目', '服务项目', '实施项目', '研发项目']),
    }
    projects.push(project)

    // 未启动的项目还没有开票
    if (state === '未启动')
      continue

    // ---------- 开票：1~3 张，合计不超过合同额 ----------
    const invoiceCount = intBetween(rng, 1, 3)
    const weights = Array.from({ length: invoiceCount }, () => floatBetween(rng, 0.6, 1.4))
    const weightSum = weights.reduce((sum, item) => sum + item, 0)
    // 已交付项目开票接近合同额，进行中项目分批发货
    const invoiceRatio = state === '已交付' ? floatBetween(rng, 0.86, 0.98) : floatBetween(rng, 0.35, 0.72)

    weights.forEach((weight, invoiceIndex) => {
      const irng = createRng(`crm/invoice#${index}#${invoiceIndex}`)
      const amount = round2(contract * invoiceRatio * (weight / weightSum))
      const invoiceDate = dateOffset(startOffset + intBetween(irng, 10, Math.max(12, duration - 5)))
      const invoice: CrmInvoice = {
        id: `CI${index}${invoiceIndex}`,
        invoice_no: `FP${invoiceDate.getFullYear()}${String(intBetween(irng, 100000, 999999))}`,
        customer_id: project.customer_id,
        project_id: project.id,
        amount,
        tax_rate: pick(irng, [6, 9, 13]),
        invoice_type: pick(irng, ['增值税专用发票', '增值税普通发票', '电子发票']),
        invoice_date: toDateString(invoiceDate),
        invoice_state: irng() > 0.25 ? '已认证' : '待认证',
      }
      invoices.push(invoice)

      // ---------- 回款：0~2 笔，合计不超过该发票金额 ----------
      // 已交付项目至少要有一笔回款，否则「交付完了却一分钱没收到」在列表里很扎眼
      const receiptCount = state === '已交付' ? 1 : (irng() > 0.3 ? intBetween(irng, 1, 2) : 0)
      if (!receiptCount)
        return
      const splits = receiptCount === 1 ? [1] : [floatBetween(irng, 0.4, 0.6), 0]
      if (receiptCount === 2)
        splits[1] = 1 - splits[0]!
      splits.forEach((share, receiptIndex) => {
        const rrng = createRng(`crm/receipt#${index}#${invoiceIndex}#${receiptIndex}`)
        const receiptDate = new Date(invoiceDate.getTime() + intBetween(rrng, 5, 70) * 86400_000)
        receipts.push({
          id: `CR${index}${invoiceIndex}${receiptIndex}`,
          customer_id: project.customer_id,
          project_id: project.id,
          invoice_id: invoice.id,
          receipt_amount: round2(amount * share),
          pay_method: pick(rrng, ['银行转账', '电子承兑', '支票']),
          receipt_date: toDateString(receiptDate),
          receipt_state: rrng() > 0.2 ? '已认领' : '待认领',
        })
      })
    })

    // ---------- 里程碑：每个项目四个节点 ----------
    MILESTONE_NODES.forEach((node, nodeIndex) => {
      const mrng = createRng(`crm/milestone#${index}#${nodeIndex}`)
      const planOffset = startOffset + Math.round((duration / MILESTONE_NODES.length) * (nodeIndex + 1))
      const planDate = dateOffset(planOffset)
      // 只有进度覆盖到的节点才有实际完成时间，否则为空（未开始 / 进行中）
      const done = progress >= (nodeIndex + 1) * 25
      // 多数节点按期或提前完成，少数延期：区间偏向负数，
      // 否则整张表全是「延期完成」，预警就失去意义
      const actualOffset = planOffset + intBetween(mrng, -14, 5)
      const actualDate = done ? dateOffset(actualOffset) : null
      const delayDays = actualDate ? Math.round((actualDate.getTime() - planDate.getTime()) / 86400_000) : 0
      milestones.push({
        id: `CM${index}${nodeIndex}`,
        project_id: project.id,
        project_name: project.project_name,
        customer_id: project.customer_id,
        milestone_node: node,
        plan_date: toDateString(planDate),
        actual_date: actualDate ? toDateString(actualDate) : '',
        delay_days: delayDays,
        node_state: actualDate ? (delayDays > 0 ? '延期完成' : '已完成') : progress >= nodeIndex * 25 ? '进行中' : '未开始',
      })
    })
  }

  // ---------- 客户：合同、开票、回款都由项目汇总而来 ----------
  const customers = names.map((name, index) => {
    const rng = createRng(`crm/customer#${index}`)
    const id = `CC${String(index + 1).padStart(4, '0')}`
    const own = projects.filter(item => item.customer_id === id)
    const ownInvoices = invoices.filter(item => item.customer_id === id)
    const ownReceipts = receipts.filter(item => item.customer_id === id)
    const contractTotal = round2(own.reduce((sum, item) => sum + item.contract_amount, 0))
    const invoiceTotal = round2(ownInvoices.reduce((sum, item) => sum + item.amount, 0))
    const receiptTotal = round2(ownReceipts.reduce((sum, item) => sum + item.receipt_amount, 0))
    const lastStart = own.map(item => item.start).sort().at(-1) ?? ''
    return {
      id,
      customer_name: name,
      industry: INDUSTRIES[index % INDUSTRIES.length]!,
      region: REGIONS[index % REGIONS.length]!,
      city: CITIES[index % CITIES.length]!,
      customer_level: own.length >= 3 ? '战略客户' : own.length >= 2 ? '重点客户' : LEVELS[2]!,
      owner: pick(rng, OWNERS),
      coop_state: own.length === 0 ? '潜在客户' : own.some(item => item.project_state === '进行中') ? '合作中' : '已成交',
      project_count: own.length,
      contract_total: contractTotal,
      invoice_total: invoiceTotal,
      receipt_total: receiptTotal,
      receivable_amount: round2(invoiceTotal - receiptTotal),
      last_deal: lastStart,
    }
  })

  // ---------- 商机 ----------
  // 金额区间逐阶段收窄：漏斗图要呈现「越往后盘子越小」，
  // 各阶段独立随机会出现「谈判阶段金额反超报价阶段」，看着不像漏斗
  const stagePlan: Array<{ stage: Stage | '输单', count: number, max: number }> = [
    { stage: '初步接洽', count: 7, max: 3_600_000 },
    { stage: '需求确认', count: 6, max: 3_000_000 },
    { stage: '方案报价', count: 5, max: 2_400_000 },
    { stage: '商务谈判', count: 4, max: 1_800_000 },
    { stage: '赢单', count: 3, max: 1_200_000 },
    { stage: '输单', count: 2, max: 1_000_000 },
  ]
  const opportunities: Record<string, any>[] = []
  let opportunityIndex = 0
  stagePlan.forEach(({ stage, count, max }) => {
    for (let i = 0; i < count; i++) {
      const rng = createRng(`crm/opportunity#${opportunityIndex}`)
      const customer = customers[opportunityIndex % customers.length]!
      opportunities.push({
        id: `CO${String(opportunityIndex + 1).padStart(4, '0')}`,
        opp_name: `${customer.customer_name.replace('有限公司', '')}${pick(rng, PRODUCTS)}采购`,
        customer_name: customer.customer_name,
        customer_id: customer.id,
        expect_amount: money(rng, max * 0.15, max),
        opp_stage: stage,
        win_rate: STAGE_WIN_RATE[stage],
        source: pick(rng, SOURCES),
        owner: pick(rng, OWNERS),
        // 在跟的商机预计在 1~4 个月内成交，已结束的落在过去
        expect_date: toDateString(dateOffset(stage === '赢单' ? -intBetween(rng, 10, 90) : stage === '输单' ? -intBetween(rng, 20, 120) : intBetween(rng, 15, 120))),
      })
      opportunityIndex++
    }
  })

  return { customers, projects, invoices, receipts, milestones, opportunities }
}

function dataset(): CrmDataset {
  if (!datasetCache)
    datasetCache = buildDataset()
  return datasetCache
}

// ==================== 各页面行数据 ====================

/** 客户档案 */
function buildCustomerRows() {
  return dataset().customers.map(row => ({
    ...row,
    // 回款率比裸金额更直观
    receipt_rate: row.invoice_total > 0 ? Math.round((row.receipt_total / row.invoice_total) * 100) : 0,
  }))
}

/** 联系人：每客户 1~2 人，至少一位决策人 */
function buildContactRows() {
  const { customers } = dataset()
  const rows: Record<string, any>[] = []
  const titles = ['总经理', '采购经理', '财务总监', '项目经理', '技术负责人']
  customers.forEach((customer, index) => {
    const count = index % 3 === 0 ? 2 : 1
    for (let i = 0; i < count; i++) {
      const rng = createRng(`crm/contact#${index}#${i}`)
      rows.push({
        id: `CT${index}${i}`,
        customer_name: customer.customer_name,
        contact_name: `${pick(rng, ['王', '李', '张', '陈', '刘', '赵', '周', '吴'])}${pick(rng, ['伟', '芳', '强', '敏', '磊', '静', '洋', '婷'])}`,
        job_title: pick(rng, titles),
        phone: `1${pick(rng, ['3', '5', '7', '8'])}${intBetween(rng, 100000000, 999999999)}`.slice(0, 11),
        email: `contact${index}${i}@example.com`,
        decision_role: i === 0 ? '决策人' : '参与者',
        region: customer.region,
      })
    }
  })
  return rows
}

/** 项目台账：带开票与回款进度 */
function buildProjectRows() {
  const { projects, invoices, receipts, customers } = dataset()
  return projects.map((project) => {
    const customer = customers.find(item => item.id === project.customer_id)
    const invoiceTotal = round2(invoices.filter(item => item.project_id === project.id).reduce((sum, item) => sum + item.amount, 0))
    const receiptTotal = round2(receipts.filter(item => item.project_id === project.id).reduce((sum, item) => sum + item.receipt_amount, 0))
    return {
      ...project,
      customer_name: customer?.customer_name ?? '',
      invoice_total: invoiceTotal,
      receipt_total: receiptTotal,
      // 回款进度以合同额为分母，才能看出这个项目收回了多少
      receipt_rate: Math.round((receiptTotal / project.contract_amount) * 100),
    }
  })
}

/** 里程碑 */
function buildMilestoneRows() {
  const { milestones, customers, projects } = dataset()
  return milestones.map((item) => {
    const project = projects.find(p => p.id === item.project_id)
    const customer = customers.find(c => c.id === item.customer_id)
    return {
      ...item,
      customer_name: customer?.customer_name ?? '',
      manager: project?.manager ?? '',
    }
  })
}

/** 开票记录 */
function buildInvoiceRows() {
  const { invoices, customers, projects } = dataset()
  return invoices.map((invoice) => {
    const customer = customers.find(item => item.id === invoice.customer_id)
    const project = projects.find(item => item.id === invoice.project_id)
    return {
      ...invoice,
      customer_name: customer?.customer_name ?? '',
      project_name: project?.project_name ?? '',
      // 价税合计按含税口径展示，税额单列
      tax_amount: round2((invoice.amount * invoice.tax_rate) / (100 + invoice.tax_rate)),
    }
  })
}

/** 回款登记 */
function buildReceiptRows() {
  const { receipts, invoices, customers, projects } = dataset()
  return receipts.map((receipt) => {
    const invoice = invoices.find(item => item.id === receipt.invoice_id)
    const customer = customers.find(item => item.id === receipt.customer_id)
    const project = projects.find(item => item.id === receipt.project_id)
    return {
      ...receipt,
      invoice_no: invoice?.invoice_no ?? '',
      customer_name: customer?.customer_name ?? '',
      project_name: project?.project_name ?? '',
    }
  })
}

// ==================== 分析页 ====================

/** 销售漏斗：阶段金额、数量与转化 */
export function buildFunnel() {
  const rows = dataset().opportunities
  const active = rows.filter(item => item.opp_stage !== '输单')
  const won = rows.filter(item => item.opp_stage === '赢单')
  const weighed = active.reduce((sum, item) => sum + (item.expect_amount * item.win_rate) / 100, 0)

  const stages = STAGES.map((stage) => {
    const items = rows.filter(item => item.opp_stage === stage)
    return {
      stage,
      count: items.length,
      amount: round2(items.reduce((sum, item) => sum + item.expect_amount, 0)),
      win_rate: STAGE_WIN_RATE[stage],
    }
  })
  const lost = rows.filter(item => item.opp_stage === '输单')
  stages.push({
    stage: '输单' as Stage,
    count: lost.length,
    amount: round2(lost.reduce((sum, item) => sum + item.expect_amount, 0)),
    win_rate: 0,
  })

  return {
    updated: toDateString(new Date()),
    summary: {
      total: rows.length,
      active: active.length,
      amount: round2(active.reduce((sum, item) => sum + item.expect_amount, 0)),
      weighed: round2(weighed),
      // 赢单率按已结束的商机算，把在跟的算进去会失真
      win_rate: Math.round((won.length / Math.max(1, won.length + lost.length)) * 100),
      avg_amount: Math.round(active.reduce((sum, item) => sum + item.expect_amount, 0) / Math.max(1, active.length)),
    },
    stages,
  }
}

/** 客户收入：月度开票/回款 + 客户排行 */
export function buildRevenue() {
  const { invoices, receipts, customers } = dataset()
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - index), 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  const monthly = months.map((label) => {
    const invoiceAmount = invoices
      .filter(item => item.invoice_date.startsWith(label))
      .reduce((sum, item) => sum + item.amount, 0)
    const receiptAmount = receipts
      .filter(item => item.receipt_date.startsWith(label))
      .reduce((sum, item) => sum + item.receipt_amount, 0)
    return { label, invoice: round2(invoiceAmount), receipt: round2(receiptAmount) }
  })

  const ranking = customers
    .map((customer) => {
      const receiptTotal = receipts.filter(item => item.customer_id === customer.id).reduce((sum, item) => sum + item.receipt_amount, 0)
      return { name: customer.customer_name, value: round2(receiptTotal), level: customer.customer_level }
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const totalInvoice = round2(invoices.reduce((sum, item) => sum + item.amount, 0))
  const totalReceipt = round2(receipts.reduce((sum, item) => sum + item.receipt_amount, 0))

  return {
    updated: toDateString(new Date()),
    summary: {
      invoice_total: totalInvoice,
      receipt_total: totalReceipt,
      receivable: round2(totalInvoice - totalReceipt),
      receipt_rate: Math.round((totalReceipt / Math.max(1, totalInvoice)) * 100),
      customer_count: customers.filter(item => item.contract_total > 0).length,
    },
    months: monthly.map(item => item.label),
    invoice_series: monthly.map(item => item.invoice),
    receipt_series: monthly.map(item => item.receipt),
    ranking,
  }
}

// ==================== 路由 ====================

const CRM_LISTS: Record<string, () => Record<string, any>[]> = {
  'crm/customer/archive': buildCustomerRows,
  'crm/customer/contact': buildContactRows,
  'crm/opportunity/list': () => dataset().opportunities,
  'crm/delivery/project': buildProjectRows,
  'crm/delivery/milestone': buildMilestoneRows,
  'crm/billing/invoice': buildInvoiceRows,
  'crm/billing/receipt': buildReceiptRows,
}

/** 分页，与通用列表接口结构一致 */
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

/**
 * 客户与项目模块的 mock 入口
 *
 * @returns 命中返回数据，未命中返回 undefined 交给通用逻辑
 */
export function resolveCrmMock(
  module: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'crm/opportunity/funnel')
    return buildFunnel()
  if (module === 'crm/billing/revenue')
    return buildRevenue()

  const builder = CRM_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
