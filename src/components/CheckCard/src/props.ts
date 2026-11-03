import type { OptionsConfig } from './types'

export const basicProps = {
  value: {
    type: Array as PropType<number[] | string[]>,
  },
  width: {
    type: [Number, String],
    default: 320,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Array as PropType<OptionsConfig[]>,
    default: () => [],
  },
}
