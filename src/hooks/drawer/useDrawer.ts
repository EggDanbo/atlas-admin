import type { IConsumer } from '@vue-cmd/core'
import type { INaiveDrawerConfig } from '@vue-cmd/naive'
import { useDrawer as useCmdDrawer } from '@vue-cmd/naive'
import { merge } from 'lodash-es'

/**
 * 命令式抽屉 自定义默认 属性
 * 可以根据需求，自行添加其他属性
 * @returns 抽屉
 */
export function useDrawer() {
  const drawer = useCmdDrawer()
  return (contentVnode, config: INaiveDrawerConfig) => {
    const drawerProps = merge({
      attrs: {
        drawerAttrs: {
          width: config?.width ?? 350,
          defaultWidth: config?.width ?? 350,
          placement: config?.placement ?? 'right',
          autoFocus: config?.autoFocus ?? false,
          resizable: config?.resizable ?? false,
        },
        contentAttrs: {
          title: config?.title,
          nativeScrollbar: config?.nativeScrollbar ?? false,
        },
      },
    }, config)
    console.log('drawerProps', drawerProps)
    return drawer(contentVnode, {
      ...drawerProps,
    })
  }
}

export type { IConsumer }
