import type { PropType } from 'vue'

/**
 * 选择选项类型
 */
export interface SelectOption {
  value: string
  label: string
}

export const SelectProps = {
  /** 选中值：单选为字符串，多选为字符串数组 */
  value: {
    type: [String, Array] as PropType<null | string | string[]>,
    validator: (value: null | string | string[] | undefined) => {
      if (value === null || value === undefined)
        return true
      if (typeof value === 'string')
        return true
      return Array.isArray(value) && value.every(v => typeof v === 'string')
    },
  },
  /** 文本组件宽度 */
  width: {
    type: String,
    default: null,
  },
  /** 下内容宽度 */
  contentWidth: {
    type: String,
    default: '100%',
  },
  /** 下内容最大宽度 */
  maxContentWidth: {
    type: String,
    default: 'calc(75vw)',
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  /** 是否排除单位权限过滤 */
  all: {
    type: [Boolean] as PropType<boolean | null>,
    default: null,
  },
  /** 是否多选 */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** 默认类型 */
  types: {
    type: String,
    default: null,
  },
  /** 工资月份 */
  month: {
    type: [Number, null],
    default: null,
  },
  /** 单位ID */
  team_id: {
    type: [String, null],
    default: null,
  },
  /** 权限名称 */
  permission: {
    type: String,
    default: '',
  },
  /** 是否查看停用 */
  stoped: {
    type: [Boolean] as PropType<boolean | null>,
    default: null,
  },
  // 禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 回显
  options: {
    type: [String, Array] as PropType<string | null | SelectOption[]>,
    default: null,
  },
  // 样式
  style: {
    type: Object,
    default: () => ({}),
  },
  // 是否弹窗
  openModal: {
    type: Boolean,
    default: false,
  },
  /** 已选列表 */
  selectList: {
    type: Array,
    default: [],
  },
}
