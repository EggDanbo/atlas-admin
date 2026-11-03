/**
 * mock 引擎自检脚本
 *
 * 直接调用引擎，检查各模块的列表、详情、列定义、登录等响应是否符合预期。
 * 用法：npx tsx scripts/mock/verify.ts
 */
import process from 'node:process'
import { handleMockRequest } from '../../src/mock/engine'
import { buildColumns } from '../../src/mock/schema/columns'

interface Case {
  label: string
  url: string
  type?: string
  data?: Record<string, any>
  params?: Record<string, any>
}

const cases: Case[] = [
  { label: '登录授权', url: '/mock-api/demo/authorize/tokensafety', type: 'POST', data: { username: 'x' } },
  { label: '当前用户', url: '/mock-api/identity/profile/get' },
  { label: '应用信息', url: '/mock-api/common/appinfo' },
  { label: '枚举字典', url: '/mock-api/common/enums' },
  { label: '组织机构树', url: '/mock-api/organ/team/tree', type: 'POST', data: {} },
  { label: '租户列表', url: '/mock-api/organ/team/tenant/list' },
  {
    label: '资产列表',
    url: '/mock-api/asset/allot/search',
    type: 'POST',
    data: { format: 'atlas/demo/asset/bill', page: 2, pagesize: 30 },
  },
  {
    label: '凭证分录',
    url: '/mock-api/vouch/entry/search',
    type: 'POST',
    data: { format: 'atlas/demo/vouch/entry', page: 1, pagesize: 5 },
  },
  {
    label: '员工信息',
    url: '/mock-api/staff/info/search',
    type: 'POST',
    data: { format: 'atlas/demo/staff/info', page: 1, pagesize: 5 },
  },
  {
    label: '资产详情',
    url: '/mock-api/asset/allot/get',
    type: 'GET',
    params: { id: '1' },
  },
  { label: '导出', url: '/mock-api/asset/allot/export', type: 'POST', data: { format: 'atlas/demo/asset/bill' } },
  { label: '列定义', url: '/mock-api/dataformat/get', type: 'GET', params: { name: 'demo/asset/bill' } },
]

let failed = 0

for (const item of cases) {
  const payload = handleMockRequest({
    url: item.url,
    type: item.type || 'GET',
    data: item.data || {},
    params: item.params || {},
  })

  const okCode = payload.code === 0
  if (!okCode)
    failed++

  const summary = (() => {
    const data = payload.data
    if (Array.isArray(data))
      return `数组(${data.length})`
    if (data && typeof data === 'object') {
      if ('list' in data)
        return `分页 list=${(data as any).list.length} total=${(data as any).totalcount} page=${(data as any).page}`
      return `对象 keys=${Object.keys(data).slice(0, 8).join(',')}`
    }
    return String(data)
  })()

  console.log(`${okCode ? '✓' : '✗'} ${item.label.padEnd(10, ' ')} ${summary}`)
}

// 抽样检查列表行数据
const page = handleMockRequest({
  url: '/mock-api/asset/allot/search',
  type: 'POST',
  data: { format: 'atlas/demo/asset/bill', page: 1, pagesize: 3 },
  params: {},
}).data as any

console.log('\n资产列表首行：')
console.log(Object.entries(page.list[0]).slice(0, 14).map(([k, v]) => `  ${k} = ${v}`).join('\n'))

const columns = buildColumns('demo/asset/bill')
console.log(`\n资产列定义（${columns.length} 列）：`)
console.log(columns.map(c => `${c.title}(${c.column}:${c.type})`).join(' | '))

console.log(`\n合计行：`, page.sum)

// 抽查几个模块的列，确认标题不为空
const formats = ['demo/vouch/entry', 'demo/staff/info', 'demo/pense/apply', 'demo/trade/project']
console.log('\n其他模块列标题：')
for (const fmt of formats) {
  const cols = buildColumns(fmt)
  console.log(`  ${fmt}: ${cols.map(c => c.title).join(' / ')}`)
}

process.exit(failed ? 1 : 0)
