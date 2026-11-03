import { isNumber, isString } from 'lodash-es'

// 预编译正则表达式
const PURE_NUMBER_REGEX = /^\d+(?:\.\d+)?$/
const UNIT_SUFFIX_REGEX_CACHE = new Map<string, RegExp>()

/**
 * 获取或创建单位后缀正则表达式（带缓存）
 */
function getUnitSuffixRegex(unit: string): RegExp {
  let regex = UNIT_SUFFIX_REGEX_CACHE.get(unit)
  if (!regex) {
    regex = new RegExp(`${unit}$`, 'i')
    UNIT_SUFFIX_REGEX_CACHE.set(unit, regex)
  }
  return regex
}

/**
 * 格式化尺寸值，自动添加单位
 * @param value - 尺寸值，可以是数字或字符串
 * @param unit
 * @returns 格式化后的带单位的字符串
 */
export function formatSizeValue(value: string | number, unit = 'px'): string {
  // 如果是数字，直接返回带单位的字符串 默认 px
  if (isNumber(value)) {
    return `${value}${unit}`
  }
  if (value && isString(value)) {
    // 常见的CSS单位（包括相对单位和绝对单位）
    const units = [
      'px',
      '%',
      'em',
      'rem',
      'vw',
      'vh',
      'vmin',
      'vmax',
      'pt',
      'pc',
      'in',
      'mm',
      'cm',
      'ex',
      'ch',
      'fr',
    ]
    // 检查是否已经包含单位（忽略大小写）
    for (const unit of units) {
      const regex = getUnitSuffixRegex(unit)
      if (regex.test(value.trim())) {
        return value
      }
    }
    // 如果是纯数字字符串，添加 px
    if (PURE_NUMBER_REGEX.test(value.trim())) {
      return `${value.trim()}${unit}`
    }
  }
  // 其他情况返回原值
  return String(value)
}

/**
 * 格式化宽度值的简化版本
 * @param value - 宽度值
 * @returns 格式化后的宽度字符串
 */
export function formatWidth(value: string | number): string {
  return formatSizeValue(value)
}

/**
 * 格式化高度值的简化版本
 * @param value - 高度值
 * @returns 格式化后的高度字符串
 */
export function formatHeight(value: string | number): string {
  return formatSizeValue(value)
}
