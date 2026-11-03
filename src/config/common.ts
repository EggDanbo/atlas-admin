import type { LocaleSetting } from '../../typings/config'

export const ACCESS_TOKEN = 'ACCESS-TOKEN' // 用户token
export const CURRENT_USER = 'CURRENT-USER' // 当前用户信息
export const IS_LOCKSCREEN = 'IS-LOCKSCREEN' // 是否锁屏
export const TABS_ROUTES = 'TABS-ROUTES' // 标签页

// 主题色 默认可选颜色
export const appTheme = [
  '#F97316',
  '#0960bd',
  '#0084f4',
  '#009688',
  '#536dfe',
  '#ff5c93',
  '#ee4f12',
  '#0096c7',
  '#9c27b0',
  '#ff9800',
  '#FF3D68',
  '#00C1D4',
  '#71EFA3',
  '#171010',
  '#78DEC7',
  '#1768AC',
  '#FB9300',
  '#FC5404',
  '#FF4848',
  '#2C2E43',
  '#66DE93',
  '#0A1D37',
  '#39A6A3',
  '#FF8474',
]

export const animateOptions = [
  { value: 'zoom-fade', label: '渐变' },
  { value: 'zoom-out', label: '闪现' },
  { value: 'fade-slide', label: '滑动' },
  { value: 'fade', label: '消退' },
  { value: 'fade-bottom', label: '底部消退' },
  { value: 'fade-scale', label: '缩放消退' },
]

export const componentSizeOptions = [
  { label: '紧凑', value: 'small' },
  { label: '中等', value: 'middle' },
  { label: '加大', value: 'large' },
]

export interface PermissionsEnum {
  value: string
  label: string
}

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
  },
  {
    label: 'English',
    key: LOCALE.EN_US,
  },
]
