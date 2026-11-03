import * as NaiveUI from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore } from '@/store/modules/theme.ts'

/**
 * 挂载 Naive-ui 脱离上下文的 API
 * 如果你想在 setup 外使用 useDialog、useMessage、useNotification、useLoadingBar，可以通过 createDiscreteApi 来构建对应的 API。
 * https://www.naiveui.com/zh-CN/dark/components/discrete
 */

export function setupNaiveDiscreteApi() {
  const themeStore = useThemeStore()
  const configProviderPropsRef = computed(() => ({
    ...themeStore.themeProps,
  }))
  const { message, dialog, notification, loadingBar } = NaiveUI.createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar'],
    {
      configProviderProps: configProviderPropsRef,
      messageProviderProps: {
        duration: 5000,
      },
      notificationProviderProps: {
        max: 1,
      },
    },
  )

  window.$message = message
  window.$dialog = dialog
  window.$notification = notification
  window.$loadingBar = loadingBar
}
