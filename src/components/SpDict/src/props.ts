import { cascaderProps, selectProps } from 'naive-ui'
import { propTypes } from '@/utils/propTypes'

export const CascaderProps = {
  ...cascaderProps,
  name: propTypes.string.def(''),
  checkStrategy: propTypes.string.def('child'),
  filterable: propTypes.bool.def(true),
  clearable: propTypes.bool.def(true),
  maxTagCount: propTypes.string.def('responsive'),
  data: [Array] as PropType<[Recordable] | null>,
  text: [String, Array] as PropType<[string, string] | null | string>,
}

export const SelectProps = {
  ...selectProps,
  name: propTypes.string.def(''),
  filterable: propTypes.bool.def(true),
  tag: propTypes.bool.def(true),
  clearable: propTypes.bool.def(false),
  maxTagCount: {
    type: [String, Number] as PropType<'responsive' | number>,
    default: 'responsive',
  },
  /** 下拉展开时是否重新加载字典，默认 true */
  reloadOnOpen: propTypes.bool.def(true),
}
