/**
 * 条件类型
 */
export const CondType = [
  'text',
  'number',
  'money',
  'date',
  'time',
  'datetime',
  'numberlist',
  'numberlistinvalue',
  'textlist',
  'textlistinvalue',
  'enums',
]

/**
 * 文本类型
 */
export const TextType = ['text', 'datetime', 'date', 'time']
/**
 * 数值类型
 */
export const NumberType = ['number', 'money']

const condList1 = [
  {
    value: 'Equal',
    label: '等于',
  },
  {
    value: 'NotEqual',
    label: '不等于',
  },
  {
    value: 'GreaterThan',
    label: '大于',
  },
  {
    value: 'GreaterThanOrEqual',
    label: '大于或等于',
  },
  {
    value: 'LessThan',
    label: '小于',
  },
  {
    value: 'LessThanOrEqual',
    label: '小于或等于',
  },
]

const condList2 = [
  {
    value: 'Contains',
    label: '包括',
  },
  {
    value: 'NotContains',
    label: '不包括',
  },
]

const condList3 = [
  {
    value: 'Like',
    label: '包含',
  },
  {
    value: 'NotLike',
    label: '不包含',
  },
  {
    value: 'StartsWith',
    label: '以...开头',
  },
  {
    value: 'EndsWith',
    label: '以...结尾',
  },
]

const condList4 = [
  {
    value: 'Between',
    label: '在...-...之间 ',
  },
  {
    value: 'NotBetween',
    label: '在...-...之外',
  },
]

/**
 * 全部条件
 */
export const AllCondList = [...condList1, ...condList2, ...condList3, ...condList4]
/**
 * 数值类型条件
 */
export const NumericCondList = [...condList1, ...condList2, ...condList4]
/**
 * 标准日期格式条件
 */
export const DateTimeCondList = [...condList1, ...condList4]
/**
 * 枚举列表条件
 */
export const EnumsCondList = [...condList2]
