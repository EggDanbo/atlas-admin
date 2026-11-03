import { propTypes } from '@/utils/propTypes'

export const basicProps = {
  /** 限制文件类型 */
  accept: {
    type: Array as PropType<string[]>,
    default: [],
  },
  /** 文件大小限制 单位:MB */
  maxSize: propTypes.number.def(50),
}
