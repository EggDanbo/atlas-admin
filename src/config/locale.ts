import type { LocaleSetting } from '../../typings/config'
import { createIcon } from '@/utils/iconify.ts'

export const LOCALE = {
  ZH_CN: 'zh_CN',
  EN_US: 'en',
} as const

export const localeSetting: LocaleSetting = {
  showPicker: true,
  // 当前语言
  locale: LOCALE.ZH_CN,
  // 默认语言
  fallback: LOCALE.ZH_CN,
  // 可用的 语言
  availableLocales: [LOCALE.ZH_CN, LOCALE.EN_US],
}

// 语言 切换
export const localeList = [
  {
    label: '简体中文',
    key: LOCALE.ZH_CN,
    icon: createIcon('circle-flags:cn'),
  },
  {
    label: 'English',
    key: LOCALE.EN_US,
    icon: createIcon('circle-flags:lang-en-us'),
  },
]
