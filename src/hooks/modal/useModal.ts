import type { IConsumer } from '@vue-cmd/core'
import type { INaiveModalConfig } from '@vue-cmd/naive'
import { useModal as useCmdModal } from '@vue-cmd/naive'
import { merge } from 'lodash-es'

/**
 * 命令式模态框 自定义默认 属性
 * 可以根据需求，自行添加其他属性
 * @returns 模态框
 */
export function useModal() {
  const modal = useCmdModal()
  return (contentVnode, config: INaiveModalConfig) => {
    return modal(contentVnode, {
      ...merge({
        attrs: {
          title: config?.title,
          style: {
            width: config?.width,
          },
          showIcon: config?.showIcon ?? false,
          /** 默认可拖拽 */
          draggable: config.draggable ?? true,
          /** 默认为 dialog 预设 */
          preset: 'dialog',
          positiveText: config.positiveText ? config.positiveText : '',
          negativeText: config.negativeText ? config.negativeText : '',
          negativeButtonProps: {
            size: 'medium',
            ...(config.negativeButtonProps || {}),
          },
          positiveButtonProps: {
            size: 'medium',
            ...(config.positiveButtonProps || {}),
          },
        },
      }, config),
    })
  }
}

export type { IConsumer }
