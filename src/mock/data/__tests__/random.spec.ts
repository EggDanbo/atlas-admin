import { describe, expect, it } from 'vitest'
import { createRng, floatBetween, hashString, intBetween, pick } from '../random'

/**
 * 可复现随机数
 *
 * mock 数据的可信度依赖「同一种子 → 同一序列」，这里守住三条不变量：
 * 确定性、值域、分布不退化。
 */
describe('createRng', () => {
  it('同一种子产生完全相同的序列', () => {
    const a = createRng('asset/info#1')
    const b = createRng('asset/info#1')
    const seqA = Array.from({ length: 8 }, () => a())
    const seqB = Array.from({ length: 8 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('不同种子产生不同的序列', () => {
    const a = createRng('asset/info#1')
    const b = createRng('asset/info#2')
    expect(a()).not.toBe(b())
  })

  it('返回值为 [0, 1) 区间的小数', () => {
    const rng = createRng('unit')
    for (let i = 0; i < 200; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('数字种子同样稳定', () => {
    const a = createRng(2026)
    const b = createRng(2026)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

describe('hashString', () => {
  it('结果恒为非负整数', () => {
    for (const input of ['', 'a', 'atlas', 'atlas/crm/invoice', '中文模块名']) {
      const hash = hashString(input)
      expect(Number.isInteger(hash)).toBe(true)
      expect(hash).toBeGreaterThanOrEqual(0)
    }
  })

  it('相同输入得到相同哈希', () => {
    expect(hashString('atlas/hr/roster')).toBe(hashString('atlas/hr/roster'))
  })
})

describe('intBetween / floatBetween', () => {
  it('整数落在闭区间内', () => {
    const rng = createRng('int')
    for (let i = 0; i < 300; i++) {
      const value = intBetween(rng, 3, 9)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThanOrEqual(9)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('金额保留指定小数位', () => {
    const rng = createRng('float')
    for (let i = 0; i < 100; i++) {
      const value = floatBetween(rng, 100, 98000, 2)
      expect(value).toBeGreaterThanOrEqual(100)
      expect(value).toBeLessThanOrEqual(98000)
      // 两位小数：乘以 100 后应为整数
      expect(Math.round(value * 100)).toBeCloseTo(value * 100, 6)
    }
  })
})

describe('pick', () => {
  it('总是返回数组内的元素', () => {
    const rng = createRng('pick')
    const list = ['甲', '乙', '丙'] as const
    for (let i = 0; i < 100; i++) {
      expect(list).toContain(pick(rng, list))
    }
  })
})
