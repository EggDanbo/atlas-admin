import type { ProConfigProviderProps } from 'pro-naive-ui'
import { generate } from '@ant-design/colors'
import { useColorMode, usePreferredDark } from '@vueuse/core'
import { darkTheme } from 'naive-ui'
import { defineStore } from 'pinia'
import tinyColor from 'tinycolor2'
import { computed, reactive, toRefs, watchEffect } from 'vue'
import { VxeUI } from 'vxe-pc-ui'
import { projectConfig } from '@/config'
import { useGlobSetting } from '@/hooks/setting'
import { formatSizeValue } from '@/utils/style.ts'
import { useConfigStore } from './config'

export const useThemeStore = defineStore('theme-store', () => {
  const systemThemeIsDark = usePreferredDark()

  const globSetting = useGlobSetting()

  const colorMode = useColorMode({
    selector: 'html',
    storageKey: `${globSetting.shortName}:vueuse-color-scheme`,
    emitAuto: true,
    initialValue: projectConfig.theme.mode,
  })

  const { borderRadius } = storeToRefs(useConfigStore())
  const theme = reactive({ ...projectConfig.theme })

  watchEffect(() => {
    if (colorMode.value === 'dark')
      theme.mode = 'dark'
    else if (colorMode.value === 'light')
      theme.mode = 'light'
    else theme.mode = 'auto'
  })
  watchEffect(() => {
    if (theme.mode === 'dark')
      colorMode.value = 'dark'
    else if (theme.mode === 'light')
      colorMode.value = 'light'
    else colorMode.value = 'auto'
  })

  const isDark = computed(() => {
    const mode = theme.mode === 'dark' || (theme.mode === 'auto' && systemThemeIsDark.value)
    VxeUI.setTheme(mode ? 'dark' : 'light')
    return mode
  })

  const themeProps = computed<ProConfigProviderProps>(() => {
    const colors = generate(theme.primaryColor, {
      theme: isDark.value ? 'dark' : 'default',
    })
    const radiusStr = formatSizeValue(borderRadius.value, 'rem')
    return {
      theme: isDark.value ? darkTheme : undefined,
      themeOverrides: {
        common: {
          primaryColor: colors[5],
          primaryColorHover: colors[6],
          primaryColorSuppl: colors[4],
          primaryColorPressed: colors[7],
          borderRadius: radiusStr,
        },
        Layout: {
          // 嵌入型布局底色需要跟随明暗，否则暗色下会露出浅灰色块
          colorEmbedded: isDark.value ? '#18181c' : '#f5f7f9',
        },
        Card: {
          borderRadius: radiusStr,
        },
        Menu: {
          // 跟随主色派生，避免换主题色后菜单悬停底色仍是蓝色
          itemColorHover: tinyColor(colors[5]).setAlpha(0.1).toRgbString(),
        },
      },
    }
  })

  function toggleThemeMode(value?: string) {
    if (value) {
      theme.mode = value
      return
    }
    theme.mode = isDark.value ? 'light' : 'dark'
  }

  watchEffect(() => {
    const grayscaleStyle = theme.grayscale ? 'grayscale(100%)' : 'grayscale(0%)'
    const colorWeaknessStyle = theme.colorWeakness ? 'invert(80%)' : 'invert(0%)'
    document.documentElement.style.filter = `${grayscaleStyle} ${colorWeaknessStyle}`
  })

  function resetStore() {
    Object.assign(theme, { ...projectConfig.theme })
  }

  return {
    isDark,
    themeProps,
    resetStore,
    ...toRefs(theme),
    toggleThemeMode,
  }
}, {
  persist: {
    key: 'theme-store',
    storage: localStorage,
  },
})
