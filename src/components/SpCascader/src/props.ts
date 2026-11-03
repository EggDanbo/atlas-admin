import type { TreeSelectOption } from 'naive-ui'

export const TablePickerProps = {
  value: {
    type: [String, Number, Array] as PropType<string | number | (string | number)[] | null>,
    default: null,
  },
  /** 文本组件宽度 */
  width: {
    type: String,
    default: null,
  },
  // 占位信息
  placeholder: {
    type: String,
    default: '请选择',
  },
  // 列表
  options: {
    type: Array as PropType<TreeSelectOption[]>,
    default: () => [],
  },
  // 替代 options 中的 value 字段名
  valueField: {
    type: String,
    default: 'value',
  },
  // 替代 options 中的 label 字段名
  labelField: {
    type: String,
    default: 'label',
  },
  // 指定显示勾选节点
  checkStrategy: {
    type: String as PropType<'all' | 'child' | 'parent'>,
    default: 'child',
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 多选
  multiple: {
    type: Boolean,
    default: false,
  },
  // 清除
  clearable: {
    type: Boolean,
    default: true,
  },
  // 是否覆盖默认的节点点击行为
  openOverride: {
    type: Boolean,
    default: true,
  },
}
