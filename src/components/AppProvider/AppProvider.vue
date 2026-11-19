<script lang="ts" setup>
import type { ConfigProviderProps } from 'naive-ui'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import { useLocalesStore } from '@/store/modules/locales-setting'
import { useThemeStore } from '@/store/modules/theme'
import 'vue-prism-editor/dist/prismeditor.min.css'
import 'highlight.js/styles/atom-one-dark-reasonable.css'

const { locale } = storeToRefs(useLocalesStore())
const { themeProps } = storeToRefs(useThemeStore())

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)

const configProviderProps = computed<ConfigProviderProps>(() => {
  return {
    abstract: true,
    ...themeProps.value,
    locale: locale.value === 'zh_CN' ? zhCN : enUS,
    dateLocale: locale.value === 'zh_CN' ? dateZhCN : dateEnUS,
  }
})
</script>

<template>
  <n-config-provider v-bind="configProviderProps">
    <n-loading-bar-provider>
      <n-message-provider :duration="5000">
        <n-notification-provider :max="1">
          <n-modal-provider>
            <n-dialog-provider>
              <slot />
            </n-dialog-provider>
          </n-modal-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
