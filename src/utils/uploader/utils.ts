/**
 * 上传器工具函数库
 */

const oproto = Object.prototype
const aproto = Array.prototype
const serialize = oproto.toString

/** 检查是否为函数 */
export function isFunction<T extends (...args: unknown[]) => unknown>(fn: unknown): fn is T {
  return serialize.call(fn) === '[object Function]'
}

/** 检查是否为数组 */
export const isArray: (ary: unknown) => ary is unknown[]
  = Array.isArray
    || function (ary: unknown): ary is unknown[] {
      return serialize.call(ary) === '[object Array]'
    }

/** 检查是否为纯对象 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return serialize.call(obj) === '[object Object]' && Object.getPrototypeOf(obj) === oproto
}

/** 检查是否为对象 */
export function isObject(obj: unknown): obj is object {
  return Object(obj) === obj
}

/** 检查是否为字符串 */
export function isString(s: unknown): s is string {
  return typeof s === 'string'
}

/** 检查是否为 undefined */
export function isUndefined(a: unknown): a is undefined {
  return a === undefined
}

/** 检查是否已定义 */
export function isDefined<T>(a: T | undefined): a is T {
  return a !== undefined
}

let uidCounter = 0

/** 生成唯一 ID */
export function uid(): number {
  return ++uidCounter
}

/** 空操作函数 */
export function noop(): void {
  // 空操作
}

/** 绑定函数上下文 */
export function bind<T extends (...args: never[]) => unknown>(fn: T, context: unknown): T {
  return function (this: unknown, ...args: Parameters<T>) {
    return fn.apply(context, args) as ReturnType<T>
  } as T
}

/** 阻止默认事件 */
export function preventEvent(evt: Event): void {
  evt.preventDefault()
}

/** 阻止事件传播 */
export function stop(evt: Event): void {
  evt.preventDefault()
  evt.stopPropagation()
}

/** 下一_tick 执行 */
export function nextTick(fn: () => void, context?: unknown): void {
  setTimeout(context ? bind(fn, context) : fn, 0)
}

/** 类数组转数组 */
export function toArray<T>(ary: ArrayLike<T>, start?: number, end?: number): T[] {
  const startIndex = start ?? 0
  const endIndex = end ?? ary.length
  return aproto.slice.call(ary, startIndex, endIndex) as T[]
}

/** 迭代器 - 数组或对象 */
export function each<T>(
  ary: T[] | ArrayLike<T> | Record<string, T>,
  func: (value: T, index: number | string, collection: typeof ary) => boolean | void,
  context?: unknown,
): void {
  if (isDefined((ary as T[]).length)) {
    const arr = ary as T[]
    for (let i = 0, len = arr.length; i < len; i++) {
      if (func.call(context, arr[i]!, i, ary) === false) {
        break
      }
    }
  }
  else {
    const obj = ary as Record<string, T>
    for (const k in obj) {
      if (Object.hasOwn(obj, k)) {
        if (func.call(context, obj[k]!, k, ary) === false) {
          break
        }
      }
    }
  }
}

/**
 * 如果选项是函数，则用给定参数求值
 * @param data - 数据或函数
 * @param args - 回调参数
 * @returns 求值后的数据
 */
export function evalOpts<T>(data: T | ((...args: any[]) => T), ...args: any[]): T {
  if (isFunction(data)) {
    return (data as (...args: any[]) => T)(...args)
  }
  return data
}

type ExtendOptions = Record<string, unknown>

/**
 * 扩展对象
 * @param force - 是否深拷贝
 * @param target - 目标对象
 * @param sources - 源对象
 * @returns 合并后的对象
 */
export function extend<T extends ExtendOptions>(force: boolean, target: T, ...sources: ExtendOptions[]): T
export function extend<T extends ExtendOptions>(target: T, ...sources: ExtendOptions[]): T
export function extend<T extends ExtendOptions>(this: any, ...args: unknown[]): T {
  let options: ExtendOptions
  let name: string
  let src: unknown
  let copy: unknown
  let copyIsArray: boolean
  let clone: unknown
  let target: ExtendOptions = (args[0] as ExtendOptions) || {}
  let i = 1
  const length = args.length
  let force = false

  // 如果第一个参数为布尔，判定是否深拷贝
  if (typeof target === 'boolean') {
    force = target
    target = (args[1] as ExtendOptions) || {}
    i++
  }

  // 确保接受方为一个复杂的数据类型
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {}
  }

  // 如果只有一个参数，那么新成员添加于 extend 所在的对象上
  if (i === length) {
    target = this as ExtendOptions
    i--
  }

  for (; i < length; i++) {
    // 只处理非空参数
    options = args[i] as ExtendOptions
    if (options != null) {
      for (name in options) {
        if (Object.hasOwn(options, name)) {
          src = target[name]
          copy = options[name]

          // 防止环引用
          if (target === copy) {
            continue
          }

          if (force && copy && (isPlainObject(copy) || isArray(copy))) {
            copyIsArray = isArray(copy)
            if (copyIsArray) {
              copyIsArray = false
              clone = src && isArray(src) ? src : []
            }
            else {
              clone = src && isPlainObject(src) ? src : {}
            }
            target[name] = extend(force, clone as ExtendOptions, copy as ExtendOptions)
          }
          else if (copy !== undefined) {
            target[name] = copy
          }
        }
      }
    }
  }
  return target as T
}

/** 格式化文件大小 */
export function formatSize(size: number): string {
  if (size < 1024) {
    return `${size.toFixed(0)} bytes`
  }
  else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`
  }
  else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  else {
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
  }
}

/** 定义不可枚举属性 */
export function defineNonEnumerable<T extends object>(target: T, key: keyof T, value: T[keyof T]): void {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value,
  })
}

/** 默认导出工具对象（保持向后兼容） */
const utils = {
  uid,
  noop,
  bind,
  preventEvent,
  stop,
  nextTick,
  toArray,
  isPlainObject,
  isFunction,
  isArray,
  isObject,
  isString,
  isUndefined,
  isDefined,
  each,
  evalOpts,
  extend,
  formatSize,
  defineNonEnumerable,
}

export default utils
