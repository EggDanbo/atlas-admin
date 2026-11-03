import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { projectConfig } from '@/config'
import { useConfigStore } from '@/store/modules/config'

export function useTitle() {
  const { t, locale } = useI18n()
  const route = useRoute()
  const configStore = useConfigStore()
  const { dynamicTitle } = configStore

  /**
   * 更新页面标题
   */
  const updateTitle = () => {
    // 获取系统标题
    let siteTitle = projectConfig.app.title
    if (dynamicTitle) {
      // 优先使用 route.meta.documentTitle
      let routeTitle = route.meta?.documentTitle || ''
      // 如果没有 documentTitle 但有 title，则根据语言决定是否翻译
      if (!routeTitle && route.meta?.title) {
        if (locale.value === 'en') {
          routeTitle = t(route.meta.title as string)
        }
        else {
          routeTitle = t(route.meta.title as string)
        }
      }
      // 如果 routeTitle 存在，则拼接成 "页面标题 - 系统标题" 格式
      siteTitle = routeTitle ? `${routeTitle} - ${siteTitle}` : siteTitle
    }
    document.title = siteTitle
  }

  watch(locale, () => {
    updateTitle()
  })

  watch(() => route.fullPath, () => {
    updateTitle()
  }, { immediate: true })

  return {
    updateTitle,
  }
}
