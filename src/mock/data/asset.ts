/**
 * 资产管理 mock 数据
 *
 * 旧模块把资产的全生命周期拆成了 11 个页面（采购、验收、领用、调拨、借出、
 * 归还、处置、盘点、折旧、维保），每道手续一个菜单，反而看不清一台资产现在在哪。
 *
 * 这里按「台账 → 流转 → 价值 → 盘点/维保 → 分析」组织：
 * 台账是唯一事实来源，流转记录它的移动，折旧记录它的价值变化。
 * 数据口径：净值 = 原值 - 累计折旧，累计折旧不超过原值；
 * 看板合计等于台账逐行汇总；流转与维保的资产名都能在台账里找到。
 */
import { ASSET_BRANDS, ASSET_MODELS, ASSET_NAMES, CITIES } from './dict'
import { createRng, dateOffset, floatBetween, intBetween, pick, toDateString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))
const money = (rng: () => number, min: number, max: number) => round2(floatBetween(rng, min, max, 2))

const CATEGORIES = [
  { name: '电子设备', life: 3 },
  { name: '办公设备', life: 5 },
  { name: '生产设备', life: 8 },
  { name: '运输工具', life: 6 },
  { name: '办公家具', life: 10 },
] as const

const ASSET_STATES = ['在用', '在用', '在用', '闲置', '维修中', '已报废'] as const
const DEPTS = ['综合管理部', '技术研发部', '市场运营部', '生产制造部', '采购供应部', '质量管理部']

interface Asset {
  id: string
  asset_no: string
  asset_name: string
  asset_category: string
  brand_model: string
  dept_name: string
  keeper: string
  asset_state: string
  location: string
  purchase_date: string
  price_amount: number
  net_amount: number
  useful_life: number
}

interface AssetDataset {
  assets: Asset[]
  flows: Record<string, any>[]
  depreciations: Record<string, any>[]
  checks: Record<string, any>[]
  maintains: Record<string, any>[]
}

let cache: AssetDataset | null = null

/** 按购置时间与年限推算净值，台账与折旧表共用同一套算法 */
function depreciationOf(price: number, life: number, monthsUsed: number) {
  const monthly = round2(price / (life * 12))
  // 累计折旧不超过原值的 95%，留残值
  const accumulated = round2(Math.min(price * 0.95, monthly * monthsUsed))
  return { monthly, accumulated, net: round2(price - accumulated) }
}

function buildAssets(): Asset[] {
  return Array.from({ length: 42 }, (_, index) => {
    const rng = createRng(`asset/ledger#${index}`)
    const category = CATEGORIES[index % CATEGORIES.length]!
    const price = money(rng, 3_000, 260_000)
    const purchaseOffset = -intBetween(rng, 45, 1_800)
    const monthsUsed = Math.max(1, Math.floor(-purchaseOffset / 30))
    const { net } = depreciationOf(price, category.life, monthsUsed)
    return {
      id: `AL${String(index + 1).padStart(4, '0')}`,
      asset_no: `ZC${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
      asset_name: `${pick(rng, [...ASSET_NAMES])}`,
      asset_category: category.name,
      brand_model: `${pick(rng, [...ASSET_BRANDS])} ${pick(rng, [...ASSET_MODELS])}`,
      dept_name: DEPTS[index % DEPTS.length]!,
      keeper: ['周敏', '陈可', '宋佳', '郑楠', '黄涛'][index % 5]!,
      asset_state: ASSET_STATES[index % ASSET_STATES.length]!,
      location: `${pick(rng, [...CITIES])}总部 ${intBetween(rng, 1, 12)} 楼`,
      purchase_date: toDateString(dateOffset(purchaseOffset)),
      price_amount: price,
      net_amount: net,
      useful_life: category.life,
    }
  })
}

function buildFlows(assets: Asset[]) {
  const types = ['领用', '调拨', '借出', '归还', '处置'] as const
  return Array.from({ length: 32 }, (_, index) => {
    const rng = createRng(`asset/flow#${index}`)
    const asset = assets[index % assets.length]!
    const type = types[index % types.length]!
    const fromDept = asset.dept_name
    const toDept = type === '调拨' ? DEPTS[(index + 2) % DEPTS.length]! : fromDept
    return {
      id: `AF${String(index + 1).padStart(4, '0')}`,
      flow_no: `LD${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
      flow_type: type,
      asset_no: asset.asset_no,
      asset_name: asset.asset_name,
      handler: ['周敏', '陈可', '宋佳', '郑楠'][index % 4]!,
      from_dept: type === '领用' ? '' : fromDept,
      to_dept: type === '处置' ? '' : toDept,
      flow_date: toDateString(dateOffset(-intBetween(rng, 1, 260))),
      flow_state: ['已完成', '已完成', '进行中'][index % 3]!,
    }
  }).sort((a, b) => (a.flow_date < b.flow_date ? 1 : -1))
}

function buildDepreciations(assets: Asset[]) {
  const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return assets.map((asset, index) => {
    const monthsUsed = Math.max(1, Math.floor((Date.now() - new Date(asset.purchase_date).getTime()) / (30 * 86400_000)))
    const { monthly, accumulated } = depreciationOf(asset.price_amount, asset.useful_life, monthsUsed)
    return {
      id: `AD${String(index + 1).padStart(4, '0')}`,
      dep_month: month,
      asset_no: asset.asset_no,
      asset_name: asset.asset_name,
      dept_name: asset.dept_name,
      original_amount: asset.price_amount,
      monthly_amount: monthly,
      accumulated_amount: accumulated,
      net_amount: round2(asset.price_amount - accumulated),
      dep_method: '年限平均法',
    }
  })
}

function buildChecks() {
  return Array.from({ length: 6 }, (_, index) => {
    const rng = createRng(`asset/check#${index}`)
    const scopeSize = intBetween(rng, 12, 28)
    const actual = index === 0 ? Math.round(scopeSize * 0.6) : scopeSize
    const loss = index === 0 ? actual - scopeSize + 2 : intBetween(rng, 0, 2)
    return {
      id: `AC${String(index + 1).padStart(3, '0')}`,
      check_no: `PD${new Date().getFullYear()}${String(index + 1).padStart(3, '0')}`,
      check_name: `${pick(rng, DEPTS)}${['季度', '年度', '专项'][index % 3]}盘点`,
      scope: `${pick(rng, DEPTS)} · ${scopeSize} 台`,
      checker: ['周敏', '陈可', '宋佳'][index % 3]!,
      plan_date: toDateString(dateOffset(-intBetween(rng, 1, 200))),
      should_count: scopeSize,
      actual_count: actual,
      loss_count: Math.max(0, loss),
      check_state: actual < scopeSize ? '进行中' : '已完成',
    }
  }).sort((a, b) => (a.plan_date < b.plan_date ? 1 : -1))
}

function buildMaintains(assets: Asset[]) {
  return Array.from({ length: 18 }, (_, index) => {
    const rng = createRng(`asset/maintain#${index}`)
    const asset = assets[(index * 3) % assets.length]!
    const planOffset = intBetween(rng, -60, 120)
    return {
      id: `AM${String(index + 1).padStart(3, '0')}`,
      maintain_no: `WB${new Date().getFullYear()}${String(index + 1).padStart(3, '0')}`,
      asset_no: asset.asset_no,
      asset_name: asset.asset_name,
      maintain_type: index % 4 === 3 ? '故障维修' : '定期保养',
      plan_date: toDateString(dateOffset(planOffset)),
      last_date: toDateString(dateOffset(planOffset - intBetween(rng, 80, 200))),
      cost_amount: money(rng, 300, 18_000),
      maintain_state: planOffset < 0 ? '已完成' : planOffset < 15 ? '即将到期' : '待执行',
    }
  }).sort((a, b) => (a.plan_date > b.plan_date ? 1 : -1))
}

function dataset(): AssetDataset {
  if (cache)
    return cache
  const assets = buildAssets()
  cache = {
    assets,
    flows: buildFlows(assets),
    depreciations: buildDepreciations(assets),
    checks: buildChecks(),
    maintains: buildMaintains(assets),
  }
  return cache
}

// ==================== 分析页 ====================

export function buildAssetDashboard() {
  const { assets, depreciations } = dataset()
  const active = assets.filter(item => item.asset_state !== '已报废')
  const original = round2(assets.reduce((sum, item) => sum + item.price_amount, 0))
  const net = round2(assets.reduce((sum, item) => sum + item.net_amount, 0))
  const monthlyDep = round2(depreciations.reduce((sum, item) => sum + item.monthly_amount, 0))

  const categoryShare = CATEGORIES.map(({ name }) => ({
    name,
    value: assets.filter(item => item.asset_category === name).length,
  }))

  const stateShare = ['在用', '闲置', '维修中', '已报废'].map(name => ({
    name,
    value: assets.filter(item => item.asset_state === name).length,
  }))

  // 近 12 个月折旧计提：资产数基本不变，按月计提出平滑曲线
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - index), 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
  const depSeries = months.map((_, index) => {
    const rng = createRng(`asset/dep-trend#${index}`)
    return round2(monthlyDep * floatBetween(rng, 0.94, 1.06))
  })

  return {
    updated: toDateString(new Date()),
    summary: {
      total: assets.length,
      active: active.length,
      original_amount: original,
      net_amount: net,
      monthly_dep: monthlyDep,
      // 净值率比净值更能说明资产新旧
      net_rate: Math.round((net / Math.max(1, original)) * 100),
    },
    months,
    dep_series: depSeries,
    category_share: categoryShare,
    state_share: stateShare,
  }
}

// ==================== 列表与路由 ====================

const ASSET_LISTS: Record<string, () => Record<string, any>[]> = {
  'asset/ledger/list': () => dataset().assets,
  'asset/flow/list': () => dataset().flows,
  'asset/value/depreciation': () => dataset().depreciations,
  'asset/check/list': () => dataset().checks,
  'asset/maintain/list': () => dataset().maintains,
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

/** 资产管理模块的 mock 入口 */
export function resolveAssetMock(
  module: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'asset/report/dashboard')
    return buildAssetDashboard()

  const builder = ASSET_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
