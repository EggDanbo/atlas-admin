import type { Directive } from 'vue'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'vue' {
  interface ComponentCustomProperties {
    vLoading: Directive<HTMLElement, LoadingOptions>
  }
}

declare global {
  const __DEV__: boolean

  // vue
  type PropType<T> = VuePropType<T>
  type VueNode = VNodeChild | JSX.Element

  // 自定义类型
  type Nullable<T> = T | null
  type NonNullable<T> = T extends null | undefined ? never : T
  type Recordable<T = any> = Record<string, T>
  type TimeoutHandle = ReturnType<typeof setTimeout>
  interface Fn<T = any, R = T> {
    (...arg: T[]): R
  }

  type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>

  type DynamicProps<T> = {
    [P in keyof T]: Ref<T[P]> | T[P] | ComputedRef<T[P]>;
  }

  interface ViteEnv {
    VITE_PORT: number
    VITE_PUBLIC_PATH: string
    VITE_USE_MOCK: boolean
    VITE_LOGGER_MOCK: boolean
    VITE_DROP_CONSOLE: boolean
    VITE_GLOB_API_URL: string
    VITE_GLOB_UPLOAD_URL: string
    VITE_GLOB_FILE_URL: string
    VITE_GLOB_API_URL_PREFIX: string
    VITE_GLOB_APP_TITLE: string
    VITE_GLOB_APP_SHORT_NAME: string
    VITE_PROXY: [string, string][]
    VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
  }

  interface ChangeEvent extends Event {
    target: HTMLInputElement
  }

  type TargetContext = '_self' | '_blank'

  type LayoutMode = 'vertical' | 'horizontal' | 'two-column' | 'mixed-two-column' | 'sidebar' | 'full-content' | 'mixed-sidebar' | 'mobile'

  interface Permissions {
    label: string
    value: string
  }

  /** 下拉框数据模型 */
  interface DropDownItem {
    /** 值 */
    value?: string
    /** 显示文本 */
    label?: string
  }

  /** 应用信息 */
  interface AppInfo {
  /** 应用名称 */
    appname: string
    /** 公司名称 */
    companyname: string
    /** 地图定位默认坐标:经度 GCJ02 */
    longitude: number
    /** 地图定位默认坐标:纬度 GCJ02 */
    latitude: number
    /** 分页查询每页显示的最大记录行数 */
    pagelimit: number
    /** 是否开启登录验证码 */
    logincaptcha: boolean
    /** 版本号 */
    version: string
  }

  /** 枚举列表 */
  interface SystemEnums {
  /** 枚举类型的显示名称 */
    name: string
    /** 枚举项集合 */
    items: SystemEnumItem[]
  }

  /** 枚举项 */
  interface SystemEnumItem {
  /** 枚举项名称 */
    name: string
    /** 枚举项标签（描述） */
    label: string
    /** 枚举项字符串值 */
    value: string
  }

  interface Window {
    $message: MessageApi
    $dialog: DialogApi
    $notification: NotificationApi
    $loadingBar: LoadingBarApi
  }

  type ThemeSkin
    = | 'blue-sky'
      | 'blue-christmas'
      | 'blue-lattice'
      | 'pink-romantic'
      | 'green-mountain'
      | 'paint-splashing'
      | 'orange-bubble'
      | 'star-jellyfish'
      | 'star-neon'
}

export {}
