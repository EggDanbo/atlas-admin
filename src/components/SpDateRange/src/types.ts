/** 时间戳类型，兼容 number 和 string（C# long JSON 精度问题） */
export type Timestamp = number | string | null

/** 日期范围值类型 */
export type DateRangeValue = [Timestamp, Timestamp] | null | undefined

/** 快捷选项配置 */
export interface ShortcutItem {
  /** 唯一标识 */
  key: string
  /** 显示文本 */
  label: string
  /** 动态计算时间戳范围（相对当前时间） */
  getRange: () => [number, number]
}

/** SpDateRange Props 类型 */
export interface SpDateRangeProps {
  modelValue: DateRangeValue
  type?: 'date' | 'datetime' | 'month' | 'year'
  dateFormat?: string
  timeFormat?: string
  endOfDay?: boolean
  min?: number | string
  max?: number | string
  /** 结束必须大于开始 */
  enforceOrder?: boolean
  /** enforceOrder 下开始超过结束时自动清空结束，默认 true */
  autoClearEnd?: boolean
  timeHours?: number[]
  timeMinutes?: number[]
  timeSeconds?: number[]
  startTimeHours?: number[]
  startTimeMinutes?: number[]
  startTimeSeconds?: number[]
  endTimeHours?: number[]
  endTimeMinutes?: number[]
  endTimeSeconds?: number[]
  fastYearSelect?: boolean
  fastMonthSelect?: boolean
  clearable?: boolean
  disabled?: boolean
  separator?: string
  /** 两端都为空时输出 null 而非 [null, null]，兼容后端 long[]? */
  nullWhenEmpty?: boolean
}

/** SpDateShortcuts Props 类型 */
export interface SpDateShortcutsProps {
  shortcuts: ShortcutItem[]
  modelValue?: string
  size?: 'small' | 'medium' | 'large'
}

/** 时间范围过滤函数类型（Naive UI n-time-picker 要求） */
export type TimeFilterFn = (value: number) => boolean

/**
 * 将数组转为 Naive UI TimePicker 要求的过滤函数
 * 数组为空或 undefined 时不限制
 */
export function toArrayFilter(arr?: number[]): TimeFilterFn | undefined {
  if (!arr || arr.length === 0)
    return undefined
  const set = new Set(arr)
  return (v: number) => set.has(v)
}

/** 将 Timestamp 转为 number（用于内部处理） */
export function toNumberTs(v: Timestamp): number | null {
  if (v == null)
    return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isNaN(n) ? null : n
}
