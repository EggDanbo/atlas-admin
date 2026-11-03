import type { CopyConfig } from './types'

export const basicProps = {
  /**
   * 开启复制
   */
  copyable: {
    type: Boolean,
    default: false,
  },
  /**
   * 复制配置
   */
  copyConfig: {
    type: Object as PropType<CopyConfig>,
    default: () => ({
      showTip: false,
      tooltips: ['复制', '复制成功'],
    }),
  },
}
