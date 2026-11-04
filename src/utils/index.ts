import type { App, Component, Plugin } from 'vue'
import { intersectionWith, isArray, isEqual, isNumber, isObject, isString, mergeWith, unionWith } from 'lodash-es'
import { NIcon } from 'naive-ui'
import { projectConfig } from '../config'

type Label = string
type Value = string | number | boolean

export const projectName = projectConfig.app.title

/**
 * 渲染图标函数
 * @param icon Component
 * @param props 可选参数，表示传递给图标的属性
 * @returns 返回一个函数，该函数会渲染指定的图标
 */
export function renderIcon(icon: Component, props?: any) {
  return () => h(NIcon, { component: icon, ...props })
}

/**
 * 抛出一个带有项目名称和警告信息的错误。
 * @param message 警告的具体信息。
 * @throws 抛出一个 Error 实例，其中包含项目名称和传入的警告信息。
 */
export function warn(message: string) {
  console.warn(`[${projectName} warn]:${message}`)
}

/**
 * 抛出一个带有项目名称和错误信息的错误。
 * @param message 错误的具体信息。
 * @throws 抛出一个 Error 实例，其中包含项目名称和传入的错误信息。
 */
export function error(message: string) {
  throw new Error(`[${projectName} error]:${message}`)
}

/**
 * 将给定的颜色值与一个数量相加，然后返回调整后的颜色值。
 * @param color 要调整的颜色，应以16进制字符串形式提供。
 * @param amount 要添加的数量，决定了颜色值的变化程度。
 * @returns 返回调整后的颜色值，以16进制字符串形式呈现。确保颜色值在00到FF之间。
 */
function addLight(color: string, amount: number) {
  const cc = Number.parseInt(color, 16) + amount
  const c = cc > 255 ? 255 : cc
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`
}

/**
 * 将给定的颜色字符串变亮
 * @param color 颜色字符串，可以是带井号(#)的十六进制字符串，也可以是不带井号的
 * @param amount 变亮的程度，是一个百分比值，实际值会转换为0到255之间的整数
 * @returns 返回变亮后的颜色的十六进制字符串，带井号
 */
export function lighten(color: string, amount: number) {
  color = color.includes('#') ? color.substring(1, color.length) : color
  amount = Math.trunc((255 * amount) / 100)
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount,
  )}${addLight(color.substring(4, 6), amount)}`
}

/**
 * 获取动态属性
 * 根据提供的属性对象，创建一个新的对象，该对象包含与提供的属性相同键值的部分属性。
 * 这个函数主要用于将一个类型的属性对象转换为另一个类型的属性对象，特别在Vue的组件中使用动态属性时非常有用。
 * @param props - 一个属性对象，其类型为泛型 T。
 * @returns 返回一个部分泛型 U 类型的对象，该对象的属性来源于输入的 props。
 */
export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {}

  props
  && Object.keys(props).forEach((key) => {
    ret[key] = unref((props as Recordable)[key])
  })
  return ret as Partial<U>
}

/**
 * 动态执行传入的字符串函数
 * @param fn 需要执行的函数体字符串
 * @returns 执行函数后的结果
 */
export function Eval(fn: string) {
  // eslint-disable-next-line no-new-func
  return new Function(`return ${fn}`)()
}

/**
 * 将给定的值转换为带有指定单位的字符串。
 * 如果提供的值是一个数字或者是一个不包含指定单位的字符串，则会在其后添加指定的单位。
 * 如果提供的值已经是一个带有单位的字符串，则原样返回该值。
 * @param value 需要转换的值，可以是数字或字符串。
 * @param unit 指定的单位，默认为 'px'。
 * @returns 转换后的字符串值，包含指定的单位。
 */
export function cssUnit(value: string | number, unit = 'px') {
  return isNumber(value) || (isString(value) && !value.includes(unit as string))
    ? `${value}${unit}`
    : value
}

/**
 * 为组件添加 install 方法，使其支持通过 app.use() 安装
 * @param component - 要安装的组件
 * @param alias - 可选的全局挂载名称（需注意命名冲突）
 */
export function withInstall<T extends { name?: string, displayName?: string }>(
  component: T,
  alias?: string,
): T & Plugin {
  const comp = component as T & { install?: (app: App) => void }

  comp.install = (app: App) => {
    const componentName = comp.name || comp.displayName
    if (!componentName) {
      console.warn('Component is missing both "name" and "displayName", cannot register globally.')
      return
    }

    app.component(componentName, component)

    if (alias) {
      // 建议开发者确保 alias 的唯一性
      app.config.globalProperties[alias] = component
    }
  }

  return component as T & Plugin
}

/**
 * 递归地收集树结构中所有节点的key值。
 * @returns {string[]} 所有节点的key值数组
 */
export function getTreeAll(data: any[]): string[] {
  const results: string[] = []
  data.forEach((item) => {
    results?.push(item.key as string)
    if (item.children && item.children.length > 0) {
      getTreeAll(item.children)
    }
  })
  return results
}

/**
 * 从树形结构数据中查找指定键值的项。
 * @param data 树形结构数据数组。
 * @param key 要查找的项的键值。
 * @param keyField 键值所在字段的名称，默认为'key'。
 * @returns 找到的项，如果未找到则返回undefined。
 */
export function getTreeItem(
  data: any[],
  key: string | number,
  keyField: string | number = 'key',
): undefined {
  for (const item of data) {
    if (item[keyField] && item[keyField] === key) {
      return item
    }
    if (item.children && item.children.length) {
      const result = getTreeItem(item.children, key, keyField)
      if (result)
        return result
    }
  }
  return undefined
}

// 预编译正则表达式
const URL_REGEX = /^(?:http|https):\/\//

/**
 * 判断是否 url
 */
export function isUrl(url: string) {
  return URL_REGEX.test(url)
}

export function openWindow(
  url: string,
  opt?: { target?: TargetContext | string, noopener?: boolean, noreferrer?: boolean },
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature: string[] = []

  noopener && feature.push('noopener=yes')
  noreferrer && feature.push('noreferrer=yes')
  window.open(url, target, feature.join(','))
}

export function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
  source: T,
  target: U,
  mergeArrays: 'union' | 'intersection' | 'concat' | 'replace' = 'replace',
): T & U {
  if (!target) {
    return source as T & U
  }
  if (!source) {
    return target as T & U
  }
  return mergeWith({}, source, target, (sourceValue, targetValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      switch (mergeArrays) {
        case 'union':
          return unionWith(sourceValue, targetValue, isEqual)
        case 'intersection':
          return intersectionWith(sourceValue, targetValue, isEqual)
        case 'concat':
          return sourceValue.concat(targetValue)
        case 'replace':
          return targetValue
        default:
          throw new Error(`Unknown merge array strategy: ${mergeArrays as string}`)
      }
    }
    if (isObject(targetValue) && isObject(sourceValue)) {
      return deepMerge(sourceValue, targetValue, mergeArrays)
    }
    return undefined
  })
}

/**
 * 创建选项和映射表，可以只解构你需要的某一个值，内部是惰性计算的
 * @example
 * ```ts
 * const data = [
 *   ['value1', 'label1'],
 *   ['value2', 'label2'],
 * ]
 * const { options, mapping } = createOptionsAndMapping(data)
 * ```
 * 如果需要增加额外的属性，可以在选项中添加第三个参数
 * ```ts
 * const data = [
 *   ['value1', 'label1', { customValue: 'customValue1' }],
 *   ['value2', 'label2', { customValue: 'customValue2' }],
 * ]
 * const { options, mapping, mapping2 } = createOptionsAndMapping(data)
 * ```
 */
export function createOptionsMap<
  const T extends [Value, Label, ...any[]][],
>(data: T) {
  return {
    get options() {
      return data.map(([value, label]) => ({ value, label })) as {
        [K in keyof T]: {
          value: T[K] extends [infer V, Label, ...any[]] ? V : never
          label: T[K] extends [Value, infer L, ...any[]] ? L : never
        }
      }
    },
    get mapping() {
      return Object.fromEntries(data) as {
        [K in T[number]as `${K[0]}`]: K[1]
      }
    },
    get mapping2() {
      return Object.fromEntries(
        data.map(([value, , customValue]) => [value, customValue]),
      ) as {
        [K in T[number]as `${K[0]}`]: K extends [any, any, infer X, ...any[]] ? X : void
      }
    },
  }
}

/**
 * 无符号整数转为IP字符
 * @param num 1
 */
export function intToIp(num: number) {
  const tt = [0, 0, 0, 0]
  tt[0] = (num >>> 24) >>> 0
  tt[1] = ((num << 8) >>> 24) >>> 0
  tt[2] = (num << 16) >>> 24
  tt[3] = (num << 24) >>> 24
  return `${String(tt[0])}.${String(tt[1])}.${String(tt[2])}.${String(tt[3])}`
}

/*
 * 模拟下载一个文件
 * @params res 结果集
 * @params filename 文件名
 */
export function downloadFile(res, filename?) {
  const blob = new Blob([res.data])
  let fileName = filename || res.headers['content-disposition'].split('filename=').pop()
  fileName = decodeURIComponent(fileName)
  if (window.navigator && (navigator as any).msSaveOrOpenBlob) {
    (navigator as any).msSaveOrOpenBlob(blob, fileName)
  }
  else {
    const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob)
    const downFile = document.createElement('a')
    downFile.style.display = 'none'
    downFile.href = objectUrl
    downFile.download = fileName // 下载后文件名
    document.body.append(downFile)
    downFile.click()
    downFile.remove() // 下载完成移除元素
    window.URL.revokeObjectURL(objectUrl) // 释放掉blob对象。
  }
}

/**
 * 数字转为字母
 * @param index
 * @returns
 */

export function excelNumberToName(index: number) {
  if (index < 0) {
    return ''
  }
  const chars: any = []
  do {
    if (chars.length > 0)
      index--
    const c = (index % 26) + 'A'.charCodeAt(0)
    chars.unshift(String.fromCharCode(c))
    index = (index - (index % 26)) / 26
  } while (index > 0)
  return chars.join('')
}

/**
 * 递归查找树形数组中指定ID的节点对象
 * @param {Array} tree - 嵌套树形数组
 * @param {number|string} targetId - 要查找的ID
 * @returns {object | null} 找到返回节点对象，未找到返回null
 */
export function findTreeNodeById(tree, targetId) {
  // 遍历数组每一项
  for (const node of tree) {
    // 1. 当前节点ID匹配，直接返回
    if (node.id === targetId) {
      return node
    }
    // 2. 当前节点有子节点，递归查找子数组
    if (node.children && node.children.length) {
      const result = findTreeNodeById(node.children, targetId)
      // 子节点中找到目标，直接返回结果
      if (result) {
        return result
      }
    }
  }
  // 3. 全部遍历完未找到，返回null
  return null
}
