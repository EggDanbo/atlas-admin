/**
 * 可复现的伪随机数工具
 *
 * 使用固定种子 + mulberry32，保证：
 * - 同一模块、同一页、同一行每次刷新看到的数据一致（体验更接近真实系统）
 * - 不同模块之间数据不雷同（种子由模块名派生）
 */

/** 32 位字符串哈希 */
export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export type Rng = () => number

/** mulberry32：小巧且分布均匀的 PRNG */
export function createRng(seed: string | number): Rng {
  let state = typeof seed === 'number' ? seed >>> 0 : hashString(seed)
  return function next() {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 从数组中确定性地取一项 */
export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length]!
}

/** 区间整数 */
export function intBetween(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** 区间小数（保留 digits 位） */
export function floatBetween(rng: Rng, min: number, max: number, digits = 2): number {
  const value = rng() * (max - min) + min
  return Number(value.toFixed(digits))
}

/** 日期：以今天为基准偏移 days 天 */
export function dateOffset(days: number): Date {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() + days)
  return base
}

/** 格式化为 YYYY-MM-DD */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 格式化为 YYYY-MM-DD HH:mm:ss */
export function toDateTimeString(date: Date): string {
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mm = `${date.getMinutes()}`.padStart(2, '0')
  const ss = `${date.getSeconds()}`.padStart(2, '0')
  return `${toDateString(date)} ${hh}:${mm}:${ss}`
}

/** 生成连续单号，如 2026040001 */
export function serialNo(prefix: string, index: number, width = 4): string {
  return `${prefix}${`${index + 1}`.padStart(width, '0')}`
}
