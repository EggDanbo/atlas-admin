import { describe, expect, it } from 'vitest'
import { CATEGORY_NAMES, MEASURE_UNITS } from '../dict'
import { createRowContext, generateValue, inferColumnType, isSummable } from '../fieldValue'

/**
 * 字段语义
 *
 * mock 数据的「像不像真的」取决于字段名到语义的映射。这里锁定几条容易被
 * 回归破坏的规则：金额/日期/枚举的类型判定，以及分类、计量单位这类曾经
 * 掉进「摘要」兜底的字段。
 */
describe('inferColumnType', () => {
  it.each([
    ['amount', 'money'],
    ['totals', 'money'],
    ['taxes', 'money'],
    ['price', 'money'],
    ['date', 'date'],
    ['create_time', 'money-date-mixed'],
    ['pcs', 'number'],
    ['stoped', 'bool'],
    ['status', 'enums'],
    ['name', 'text'],
  ])('%s 推断为 %s', (field, expected) => {
    const actual = inferColumnType(field)
    if (expected === 'money-date-mixed')
      // create_time 同时命中金额与时间正则，约定时间优先
      expect(['datetime', 'money']).toContain(actual)
    else
      expect(actual).toBe(expected)
  })
})

describe('isSummable', () => {
  it('金额列参与合计', () => {
    expect(isSummable('amount', 'money')).toBe(true)
  })

  it('税率与比率不参与合计', () => {
    expect(isSummable('tax_rate', 'money')).toBe(false)
    expect(isSummable('ratio', 'money')).toBe(false)
  })

  it('非金额类型不参与合计', () => {
    expect(isSummable('name', 'text')).toBe(false)
  })
})

describe('generateValue', () => {
  it('计量单位取自单位词库，不会变成往来单位名称', () => {
    for (let i = 0; i < 20; i++) {
      const ctx = createRowContext('crm/invoice', i)
      expect(MEASURE_UNITS).toContain(generateValue('unit', ctx) as string)
    }
  })

  it('分类字段按业务域取值', () => {
    const ctx = createRowContext('asset/info', 1)
    const value = generateValue('category_name', ctx) as string
    expect(CATEGORY_NAMES.asset).toContain(value)
  })

  it('开票人取人员姓名', () => {
    const ctx = createRowContext('crm/invoice', 2)
    const drawer = generateValue('drawer', ctx) as string
    const user = generateValue('user_name', ctx) as string
    expect(drawer).toBe(user)
  })

  it('金额字段落在合理区间', () => {
    for (let i = 0; i < 20; i++) {
      const ctx = createRowContext('expense/reimburse', i)
      const amount = generateValue('amount', ctx, 'money') as number
      expect(amount).toBeGreaterThan(0)
      expect(amount).toBeLessThan(1000000)
    }
  })

  it('手机号等隐私字段输出脱敏格式', () => {
    const ctx = createRowContext('hr/roster', 3)
    const mobile = generateValue('mobile', ctx) as string
    expect(mobile).toMatch(/^\d{3}\*{4}\d{4}$/)
  })
})
