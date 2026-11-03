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
    const soft = (alpha: number) => tinyColor(colors[5]).setAlpha(alpha).toRgbString()
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
          borderColor: isDark.value ? '#2a2a31' : '#e8eaee',
        },
        Menu: {
          // 跟随主色派生，避免换主题色后菜单悬停底色仍是蓝色
          itemColorHover: soft(0.1),
          itemColorActive: soft(0.1),
          itemColorActiveHover: soft(0.16),
          itemTextColorActive: colors[5],
          itemTextColorActiveHover: colors[5],
          itemTextColorChildActive: colors[5],
          itemIconColorActive: colors[5],
          itemIconColorActiveHover: colors[5],
          itemIconColorChildActive: colors[5],
          borderRadius: radiusStr,
        },
        Button: {
          borderRadiusMedium: radiusStr,
          borderRadiusSmall: radiusStr,
        },
        Input: {
          borderRadius: radiusStr,
        },
        Tabs: {
          tabBorderRadius: radiusStr,
        },
      },
    }
  })

  /**
   * 主色派生设计令牌
   *
   * 皮肤层（styles/skin.less）只读取 --atlas-brand-* 系列变量，
   * 这里把用户选择的品牌色同步成变量，换色时整站色调一起变化，无需改样式文件。
   */
  watchEffect(() => {
    const colors = generate(theme.primaryColor, {
      theme: isDark.value ? 'dark' : 'default',
    })
    const root = document.documentElement
    root.style.setProperty('--atlas-brand', colors[5]!)
    root.style.setProperty('--atlas-brand-soft', tinyColor(colors[5]).setAlpha(0.1).toRgbString())
    root.style.setProperty('--atlas-brand-soft-hover', tinyColor(colors[5]).setAlpha(0.16).toRgbString())
    root.style.setProperty('--atlas-brand-ring', tinyColor(colors[5]).setAlpha(0.22).toRgbString())
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
