import type { DetailParams, EnumTransformItem, FieldTransformConfig, TitleConfig } from './types'
import { format } from 'date-fns'
import { useEnumStore } from '@/store/modules/enums'

/**
 * 把接口返回的日期值格式化为展示文本
 *
 * 详情页原先各写一遍 `val ? format(Number(val), 'yyyy-MM-dd') : null`，
 * 接口给出非时间戳（日期字符串、空对象等）时 date-fns 会抛 `Invalid time value`，
 * 弹窗直接打不开。这里统一兜底：时间戳走 format，字符串尝试解析，非法值返回 null。
 */
export function toDateLabel(value: unknown, pattern = 'yyyy-MM-dd'): string | null {
  if (value === null || value === undefined || value === '')
    return null

  const timestamp = Number(value)
  if (Number.isFinite(timestamp) && timestamp > 0)
    return format(timestamp, pattern)

  const parsed = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? null : format(parsed, pattern)
}

/**
 * 规范化枚举转换配置
 */
function normalizeEnumConfig(config: string | EnumTransformItem): EnumTransformItem {
  return typeof config === 'string'
    ? { key: config, matchBy: 'value' }
    : config
}

/**
 * 获取嵌套值
 * @example getNestedValue({ a: { b: 1 } }, 'a.b') // 1
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

/**
 * 设置嵌套值
 * @example setNestedValue({ a: {} }, 'a.b', 1) // { a: { b: 1 } }
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const last = keys.pop()!
  const target = keys.reduce((o, k) => {
    o[k] ??= {}
    return o[k]
  }, obj)
  target[last] = value
}

/**
 * 创建字段转换函数
 * 用于处理 API 响应数据与表单模型之间的类型转换
 * 支持嵌套字段路径（如 'user.gender'）
 */
export function createTransformer(config: FieldTransformConfig) {
  return (data: any) => {
    if (!data)
      return data

    const result = { ...data }
    const transformField = config.transformField ?? 'transform'

    // 初始化 transformField
    if (!result[transformField]) {
      result[transformField] = {}
    }

    if (config.number) {
      for (const path of config.number) {
        const val = getNestedValue(result, path)
        if (val !== undefined) {
          setNestedValue(result, path, (val == null || val === '' || val === '0') ? null : Number(val))
        }
      }
    }

    if (config.string) {
      for (const path of config.string) {
        const val = getNestedValue(result, path)
        if (val != null) {
          setNestedValue(result, path, String(val))
        }
      }
    }

    if (config.nullIfZero) {
      for (const path of config.nullIfZero) {
        const val = getNestedValue(result, path)
        if (val !== undefined) {
          setNestedValue(result, path, (val == null || val === 0 || val === '0' || val === '') ? null : String(val))
        }
      }
    }

    // 枚举转换：将 value/name 转换为 label，存到 transformField
    if (config.enum) {
      const enumStore = useEnumStore() // 延迟调用，确保 Pinia 已初始化
      for (const [path, enumConfig] of Object.entries(config.enum)) {
        const val = getNestedValue(result, path)
        if (val != null) {
          const { key, matchBy } = normalizeEnumConfig(enumConfig)
          const label = enumStore.getLabel(key, val, matchBy)
          // enum 转换结果存到 transformField
          result[transformField][path] = label
        }
      }
    }

    if (config.custom) {
      for (const [path, fn] of Object.entries(config.custom)) {
        const val = getNestedValue(result, path)
        if (val !== undefined) {
          const transformed = fn(val, result)
          // custom 转换结果存到 transformField
          result[transformField][path] = transformed
        }
      }
    }

    return result
  }
}

/** 安全调用可能是同步或异步的回调函数 */
export async function safeCall<T extends (...args: any[]) => any>(
  fn: T | undefined,
  ...args: Parameters<T>
): Promise<ReturnType<T> | undefined> {
  if (!fn)
    return undefined
  const result = fn(...args)
  return result instanceof Promise ? await result : result
}

/** 解析后的标题配置 */
interface ResolvedTitleConfig {
  base: string
  view: string | ((data: any, params: DetailParams) => string)
  add: string
  edit: string | ((data: any, params: DetailParams) => string)
  _raw: string | TitleConfig
}

/**
 * 解析标题配置
 * @param title 用户配置的标题（字符串或 TitleConfig）
 * @param fallbackBase 当 base 为空时的备用标题（通常是 Tab 的 title）
 */
export function resolveTitle(title: string | TitleConfig | undefined, fallbackBase = ''): ResolvedTitleConfig {
  // 如果是字符串，直接作为 base
  if (typeof title === 'string') {
    return {
      base: title,
      view: `查看${title}`,
      add: `新增${title}`,
      edit: `编辑${title}`,
      _raw: title,
    }
  }

  // 对象形式：base 为空时使用 fallbackBase
  const base = title?.base ?? fallbackBase
  return {
    base,
    view: title?.view ?? `查看${base}`,
    add: title?.add ?? `新增${base}`,
    edit: title?.edit ?? `编辑${base}`,
    _raw: title ?? base,
  }
}

/** 运行时解析标题（支持函数形式） */
export function resolveDynamicTitle(
  titleConfig: ResolvedTitleConfig,
  type: 'view' | 'add' | 'edit',
  data: any,
  params: DetailParams,
): string {
  const value = titleConfig[type]
  if (typeof value === 'function') {
    return value(data, params)
  }
  return value
}

/** 应用数据到响应式模型 */
export function applyData(
  model: any,
  defaultFn: () => any,
  data: any,
  transformer?: (data: any) => any,
) {
  const transformed = transformer ? transformer(data) : data
  Object.assign(model, defaultFn(), transformed)
}
