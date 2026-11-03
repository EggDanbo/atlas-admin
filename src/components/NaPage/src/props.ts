import type { HeightMode, StyleMode } from './types'
import type { LoadingOptions } from '@/directives/loading/types'

export const containerProps = {
  /**
   * v-loading 配置
   */
  loading: [Boolean, Object] as PropType<LoadingOptions>,
  /**
   * 底部区域高度 TOOD : 待完善
   */
  footerHeight: Number,
  /**
   * 样式模式
   */
  styleMode: {
    type: String as PropType<StyleMode>,
    default: 'auto',
  },
  /**
   * 高度模式
   */
  heightMode: {
    type: String as PropType<HeightMode>,
    default: 'auto',
  },
  /**
   * 是否显示固定底部
   */
  showFooter: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
} as const

export type ContainerProps = ExtractPublicPropTypes<typeof containerProps>
