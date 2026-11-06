/**
 * 采购管理 mock 数据
 *
 * 企业管理系统里「人、事、财、物、档」都齐了，唯独「供」是空的：
 * 费用模块只有一张合同台账，资产模块里「采购」只是一个流转类型，
 * 供应商是谁、比了几家价、到货合不合格、还欠人家多少钱，都没有地方看。
 *
 * 这里按一条真实链路组织：供应商准入 → 采购申请 → 采购订单 → 到货验收 → 对账付款。
 * 五个页面共用一份数据集，因此每一条都能反查：
 * - 供应商累计采购额 = 名下订单金额之和
 * - 订单的到货进度 = 验收单数量 / 订单数量
 * - 应付款未付金额 = 订单金额 - 已付金额
 * - 看板的月度与品类合计 = 订单逐行汇总
 *
 * 单据金额只由「品类基准价 × 数量 × 议价系数」推导，不单独随机，
 * 否则同一张订单在列表和看板里会出现两个数字。
 */
import { CITIES, PARTNERS } from './dict'
import { createRng, dateOffset, floatBetween, intBetween, pick, toDateString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))

/** 采购品类：基准单价区间决定单据金额量级，同类订单不会忽大忽小 */
const CATEGORIES = [
  { name: '电子设备', min: 2400, max: 9800 },
  { name: '原材料', min: 800, max: 4200 },
  { name: '包装耗材', min: 60, max: 460 },
  { name: '办公用品', min: 40, max: 380 },
  { name: '生产辅料', min: 320, max: 1800 },
  { name: '技术服务', min: 4000, max: 18000 },
] as const

const DEPTS = ['技术研发部', '生产制造部', '市场运营部', '综合管理部', '质量管理部', '采购供应部']

const ACCESS_STATES = ['合格供应商', '合格供应商', '合格供应商', '考察中', '已暂停'] as const

const PAY_METHODS = ['银行转账', '电子承兑', '月结']

interface Supplier {
  id: string
  supplier_no: string
  supplier_name: string
  supplier_category: string
  city: string
  contact: string
  credit_days: number
  access_state: string
  rating: string
  ontime_rate: number
  quality_score: number
  purchase_total: number
}

interface PurchaseRequest {
  id: string
  request_no: string
  apply_dept: string
  item_category: string
  item_name: string
  quantity: number
  budget_amount: number
  expect_date: string
  apply_date: string
  applicant: string
  request_state: string
}

interface PurchaseOrder {
  id: string
  order_no: string
  request_id: string
  supplier_id: string
  item_category: string
  quantity: number
  order_amount: number
  order_date: string
  expect_arrival: string
  arrival_qty: number
  receipt_progress: number
  pay_method: string
  order_state: string
}

interface Receipt {
  id: string
  receipt_no: string
  order_id: string
  order_no: string
  supplier_id: string
  arrival_qty: number
  qualified_qty: number
  reject_qty: number
  receipt_date: string
  receipt_result: string
  inspector: string
}

interface Payable {
  id: string
  payable_no: string
  order_id: string
  order_no: string
  supplier_id: string
  payable_amount: number
  paid_amount: number
  unpaid_amount: number
  due_date: string
  settle_state: string
}

interface PurchaseDataset {
  suppliers: Supplier[]
  requests: PurchaseRequest[]
  orders: PurchaseOrder[]
  receipts: Receipt[]
  payables: Payable[]
}

let datasetCache: PurchaseDataset | null = null

const ITEM_NAMES: Record<string, string[]> = {
  电子设备: ['笔记本电脑', '工业平板', '网络交换机', '工作站主机'],
  原材料: ['冷轧钢板', '铝合金型材', '铜排', '工程塑料粒子'],
  包装耗材: ['瓦楞纸箱', '缠绕膜', '珍珠棉', '打包带'],
  办公用品: ['打印纸', '签字笔', '文件夹', '硒鼓'],
  生产辅料: ['切削液', '砂轮片', '焊丝', '润滑油'],
  技术服务: ['设备维保服务', '系统集成服务', '检测认证服务', '驻场技术支持'],
}

/** 供应商基础信息：名称取合作方词库，保证看起来是真实公司 */
function buildSuppliers(): Supplier[] {
  const rows: Supplier[] = []
  for (let index = 0; index < 20; index++) {
    const rng = createRng(`purchase/supplier#${index}`)
    const chosenCategory = pick(rng, CATEGORIES).name
    const ontime = round2(floatBetween(rng, 62, 99, 1))
    const quality = round2(floatBetween(rng, 70, 99, 1))
    // 评级由两个指标合成：准时率与质量分都高的才是 A
    const composite = (ontime + quality) / 2
    const rating = composite >= 92 ? 'A' : composite >= 82 ? 'B' : 'C'

    rows.push({
      id: `SUP${String(index + 1).padStart(3, '0')}`,
      supplier_no: `SUP${String(index + 1).padStart(3, '0')}`,
      supplier_name: `${PARTNERS[index % PARTNERS.length]!.replace('有限公司', '')}${['物资', '科技', '实业', '供应链'][index % 4]}有限公司`,
      supplier_category: chosenCategory,
      city: pick(rng, CITIES),
      contact: pick(rng, ['王磊', '李静', '张伟', '陈曦', '刘洋', '赵敏']),
      credit_days: pick(rng, [30, 45, 60, 90]),
      access_state: pick(rng, ACCESS_STATES),
      rating,
      ontime_rate: ontime,
      quality_score: quality,
      purchase_total: 0,
    })
  }
  return rows
}

/** 采购申请：需求方的原始诉求，一条申请最多转成一张订单 */
function buildRequests(): PurchaseRequest[] {
  const rows: PurchaseRequest[] = []
  for (let index = 0; index < 84; index++) {
    const rng = createRng(`purchase/request#${index}`)
    const chosenCategory = pick(rng, CATEGORIES)
    const quantity = intBetween(rng, 5, 240)
    const unitPrice = floatBetween(rng, chosenCategory.min, chosenCategory.max, 2)
    // 状态按月轮转，保证每个月都有新申请，看板趋势不会断档
    const monthOffset = index % 12
    const base = new Date(new Date().getFullYear(), new Date().getMonth() - monthOffset, 1)
    const maxDay = monthOffset === 0 ? new Date().getDate() : 28
    const applyDate = new Date(base.getFullYear(), base.getMonth(), intBetween(rng, 1, maxDay))
    const stage = index % 5

    rows.push({
      id: `PR${String(index + 1).padStart(4, '0')}`,
      request_no: `PR${String(index + 1).padStart(4, '0')}`,
      apply_dept: pick(rng, DEPTS),
      item_category: chosenCategory.name,
      item_name: pick(rng, ITEM_NAMES[chosenCategory.name]!),
      quantity,
      budget_amount: round2(quantity * unitPrice),
      expect_date: toDateString(dateOffset(intBetween(rng, 6, 40))),
      // 申请日期用于按月的趋势统计，列表不展示但数据要有
      apply_date: toDateString(applyDate),
      applicant: pick(rng, ['周敏', '李承宇', '陈可', '宋佳', '黄涛', '郑楠']),
      request_state: stage === 0 ? '待审批' : stage === 1 ? '审批中' : stage === 2 ? '已通过' : stage === 3 ? '已下单' : '已关闭',
    })
  }
  return rows
}

/** 采购订单：由「已通过 / 已下单」的申请派生，金额与申请预算同源 */
function buildOrders(requests: PurchaseRequest[], suppliers: Supplier[]): PurchaseOrder[] {
  const eligible = requests.filter(item => item.request_state === '已通过' || item.request_state === '已下单')
  const rows: PurchaseOrder[] = []

  eligible.forEach((request, index) => {
    const rng = createRng(`purchase/order#${index}`)
    // 按品类挑供应商：同品类的供应商才有理由接这单
    const candidates = suppliers.filter(item => item.supplier_category === request.item_category && item.access_state !== '已暂停')
    const supplier = candidates.length ? candidates[index % candidates.length]! : suppliers[index % suppliers.length]!
    const quantity = request.quantity
    // 议价系数 0.88~1.06：成交价围绕预算浮动，不会出现「中标价是预算三倍」
    const orderAmount = round2(request.budget_amount * floatBetween(rng, 0.88, 1.06, 3))
    const stage = index % 4
    const arrivalQty = stage === 0 ? 0 : stage === 1 ? Math.round(quantity * 0.5) : quantity

    rows.push({
      id: `PO${String(index + 1).padStart(4, '0')}`,
      order_no: `PO${String(index + 1).padStart(4, '0')}`,
      request_id: request.id,
      supplier_id: supplier.id,
      item_category: request.item_category,
      quantity,
      order_amount: orderAmount,
      // 按月轮转，保证近 12 个月每个月都有订单：纯随机日期会让看板出现空月，
      // 看起来像数据丢了
      order_date: toDateString(new Date(
        new Date().getFullYear(),
        new Date().getMonth() - (index % 12),
        intBetween(rng, 1, 28),
      )),
      expect_arrival: request.expect_date,
      arrival_qty: arrivalQty,
      receipt_progress: quantity > 0 ? round2((arrivalQty / quantity) * 100) : 0,
      pay_method: pick(rng, PAY_METHODS),
      order_state: stage === 0 ? '待发货' : stage === 1 ? '部分到货' : stage === 2 ? '已到货' : '已结算',
    })
  })

  return rows
}

/** 到货验收：只对已到货的订单生成，合格数不超过到货数 */
function buildReceipts(orders: PurchaseOrder[], suppliers: Supplier[]): Receipt[] {
  return orders
    .filter(order => order.arrival_qty > 0)
    .map((order, index) => {
      const rng = createRng(`purchase/receipt#${index}`)
      const qualified = Math.round(order.arrival_qty * floatBetween(rng, 0.9, 1, 3))
      const reject = order.arrival_qty - qualified
      const supplier = suppliers.find(item => item.id === order.supplier_id)

      return {
        id: `RC${String(index + 1).padStart(4, '0')}`,
        receipt_no: `RC${String(index + 1).padStart(4, '0')}`,
        order_id: order.id,
        order_no: order.order_no,
        supplier_id: order.supplier_id,
        arrival_qty: order.arrival_qty,
        qualified_qty: qualified,
        reject_qty: reject,
        receipt_date: toDateString(dateOffset(-intBetween(rng, 1, 280))),
        // 结论跟着不合格数走，不独立随机
        receipt_result: reject > 0 ? '部分合格' : '全部合格',
        inspector: supplier?.contact ?? '质检组',
      }
    })
}

/** 对账付款：已到货的订单才产生应付，未付金额由金额与已付推导 */
function buildPayables(orders: PurchaseOrder[]): Payable[] {
  const arrived = orders.filter(order => order.arrival_qty > 0)
  return arrived.map((order, index) => {
    const rng = createRng(`purchase/payable#${index}`)
    // 已付比例分三档：付清 / 付一半 / 未付
    const stage = index % 3
    const paid = stage === 0 ? order.order_amount : stage === 1 ? round2(order.order_amount * 0.5) : 0
    const unpaid = round2(order.order_amount - paid)
    const overdue = index % 7 === 0 && unpaid > 0

    return {
      id: `AP${String(index + 1).padStart(4, '0')}`,
      payable_no: `AP${String(index + 1).padStart(4, '0')}`,
      order_id: order.id,
      order_no: order.order_no,
      supplier_id: order.supplier_id,
      payable_amount: order.order_amount,
      paid_amount: paid,
      unpaid_amount: unpaid,
      due_date: toDateString(dateOffset(overdue ? -intBetween(rng, 3, 45) : intBetween(rng, 5, 90))),
      settle_state: unpaid === 0 ? '已结清' : overdue ? '已逾期' : '待付款',
    }
  })
}

function dataset(): PurchaseDataset {
  if (datasetCache)
    return datasetCache

  const suppliers = buildSuppliers()
  const requests = buildRequests()
  const orders = buildOrders(requests, suppliers)
  const receipts = buildReceipts(orders, suppliers)
  const payables = buildPayables(orders)

  // 供应商累计采购额由订单汇总回填，保证台账与订单能对上
  for (const supplier of suppliers) {
    const total = orders
      .filter(order => order.supplier_id === supplier.id)
      .reduce((sum, order) => sum + order.order_amount, 0)
    supplier.purchase_total = round2(total)
  }

  datasetCache = { suppliers, requests, orders, receipts, payables }
  return datasetCache
}

/** 列表行需要的展示字段（把关联名称摊平，表格不用再查一次） */
function supplierRows() {
  return dataset().suppliers
}

function requestRows() {
  return dataset().requests
}

function orderRows() {
  const { orders, suppliers } = dataset()
  return orders.map((order) => {
    const supplier = suppliers.find(item => item.id === order.supplier_id)
    const request = dataset().requests.find(item => item.id === order.request_id)
    return {
      ...order,
      supplier_name: supplier?.supplier_name ?? '',
      supplier_rating: supplier?.rating ?? '',
      request_no: request?.request_no ?? '',
      apply_dept: request?.apply_dept ?? '',
    }
  })
}

function receiptRows() {
  const { receipts, suppliers, orders } = dataset()
  return receipts.map((item) => {
    const supplier = suppliers.find(row => row.id === item.supplier_id)
    const order = orders.find(row => row.id === item.order_id)
    return {
      ...item,
      supplier_name: supplier?.supplier_name ?? '',
      item_category: order?.item_category ?? '',
      // 合格率是验收环节最该看的数
      qualified_rate: item.arrival_qty > 0 ? round2((item.qualified_qty / item.arrival_qty) * 100) : 0,
    }
  })
}

function payableRows() {
  const { payables, suppliers, orders } = dataset()
  return payables.map((item) => {
    const supplier = suppliers.find(row => row.id === item.supplier_id)
    const order = orders.find(row => row.id === item.order_id)
    const days = Math.round((new Date(item.due_date).getTime() - Date.now()) / 86400000)
    return {
      ...item,
      supplier_name: supplier?.supplier_name ?? '',
      credit_days: supplier?.credit_days ?? 0,
      item_category: order?.item_category ?? '',
      // 距到期天数：负数就是已经逾期了
      remain_days: days,
    }
  })
}

/** 采购看板：月度采购额、品类结构、供应商集中度、准时交付 */
function buildOverview() {
  const { orders, suppliers, receipts } = dataset()
  const months: string[] = []
  const monthly: number[] = []
  const now = new Date()

  for (let offset = 11; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(label)
    const total = orders
      .filter(order => order.order_date.startsWith(label))
      .reduce((sum, order) => sum + order.order_amount, 0)
    monthly.push(round2(total))
  }

  const item_categoryMap = new Map<string, number>()
  for (const order of orders) {
    item_categoryMap.set(order.item_category, round2((item_categoryMap.get(order.item_category) ?? 0) + order.order_amount))
  }
  const categories = [...item_categoryMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const supplierRank = suppliers
    .map(item => ({ name: item.supplier_name, value: item.purchase_total, rating: item.rating }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const totalAmount = round2(orders.reduce((sum, order) => sum + order.order_amount, 0))
  const top3 = round2(supplierRank.slice(0, 3).reduce((sum, item) => sum + item.value, 0))
  const ontimeAvg = round2(suppliers.reduce((sum, item) => sum + item.ontime_rate, 0) / Math.max(1, suppliers.length))
  const qualifiedAvg = receipts.length
    ? round2(receipts.reduce((sum, item) => sum + (item.arrival_qty ? item.qualified_qty / item.arrival_qty : 0), 0) / receipts.length * 100)
    : 0

  return {
    summary: {
      total_amount: totalAmount,
      order_count: orders.length,
      supplier_count: suppliers.filter(item => item.access_state === '合格供应商').length,
      // 前三家占比超过 60% 就是过度集中，看板上要标出来
      top3_share: totalAmount > 0 ? round2((top3 / totalAmount) * 100) : 0,
      ontime_rate: ontimeAvg,
      qualified_rate: qualifiedAvg,
    },
    months,
    monthly_amount: monthly,
    categories,
    supplier_rank: supplierRank,
  }
}

const PURCHASE_LISTS: Record<string, () => Record<string, any>[]> = {
  'purchase/supplier/list': supplierRows,
  'purchase/order/request': requestRows,
  'purchase/order/list': orderRows,
  'purchase/settlement/receipt': receiptRows,
  'purchase/settlement/payable': payableRows,
}

/** 与财务/客户等模块一致的分页结构 */
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

export function resolvePurchaseMock(
  module: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'purchase/report/dashboard')
    return buildOverview()

  const builder = PURCHASE_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
