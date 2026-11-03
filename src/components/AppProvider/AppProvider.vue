<script lang="ts" setup>
import type { ProConfigProviderProps } from 'pro-naive-ui'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import { dateEnUS, dateZhCN } from 'naive-ui'
import { enUS, ProConfigProvider, zhCN } from 'pro-naive-ui'
import { useLocalesStore } from '@/store/modules/locales-setting'
import { useThemeStore } from '@/store/modules/theme'
import 'vue-prism-editor/dist/prismeditor.min.css'
import 'highlight.js/styles/atom-one-dark-reasonable.css'

const { locale } = storeToRefs(useLocalesStore())
const { themeProps } = storeToRefs(useThemeStore())

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)

const configProviderProps = computed<ProConfigProviderProps>(() => {
  return {
    abstract: true,
    ...themeProps.value,
    propOverrides: {
      ProButton: {
        focusable: false,
      },
      ProModalForm: {
        preset: 'card',
        labelPlacement: 'left',
        labelWidth: '100',
        maskClosable: true,
        submitButtonProps: {
          content: '确定',
        },
      },
      ProDrawerForm: {
        maskClosable: true,
      },
      ProDrawerContent: {
        submitButtonProps: {
          content: '确定',
        },
      },
    },
    locale: locale.value === 'zh_CN' ? zhCN : enUS,
    dateLocale: locale.value === 'zh_CN' ? dateZhCN : dateEnUS,
  }
})
</script>

<template>
  <ProConfigProvider v-bind="configProviderProps" :hljs="hljs">
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
  </ProConfigProvider>
</template>
