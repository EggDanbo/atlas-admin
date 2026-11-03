export type ThemeType = 'pure' | 'skin'

export type ThemeSkin
  = | 'blue-sky'
    | 'blue-christmas'
    | 'blue-lattice'
    | 'pink-romantic'
    | 'green-mountain'
    | 'paint-splashing'
    | 'orange-bubble'
    | 'star-jellyfish'
    | 'star-neon'

export interface ViteEnv {
  VITE_PORT: number
  VITE_PUBLIC_PATH: string
  VITE_USE_MOCK: boolean
  VITE_LOGGER_MOCK: boolean
  VITE_DROP_CONSOLE: boolean
  VITE_API_URL: string
  VITE_UPLOAD_URL: string
  VITE_FILE_URL: string
  VITE_API_URL_PREFIX: string
  VITE_APP_TITLE: string
  VITE_APP_SHORT_NAME: string
  VITE_PROXY: [string, string][]
  VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
  VITE_API_AUITH_PREFIX: string
  VITE_API_MESSAGE_KIND: string
}
export interface GlobEnvConfig {
  // 标题
  VITE_APP_TITLE: string
  // 接口地址
  VITE_API_URL: string
  // 接口前缀
  VITE_API_URL_PREFIX?: string
  // 项目简称
  VITE_APP_SHORT_NAME: string
  // 上传地址
  VITE_UPLOAD_URL?: string
  // 文件前缀地址
  VITE_FILE_URL?: string
  // 生产环境开启mock
  VITE_USE_MOCK: string
  // 开启 mock 请求打印日志
  VITE_LOGGER_MOCK: string
  // api授权认证前缀
  VITE_API_AUTH_PREFIX: string
  // 消息分类
  VITE_API_MESSAGE_KIND: string
}

export interface GlobConfig {
  // 标题
  title: string
  // 接口地址
  apiUrl: string
  // 文件上传地址
  uploadUrl?: string
  // api 接口前缀
  urlPrefix?: string
  // 项目简称
  shortName: string
  // 文件访问地址
  fileUrl: string | undefined
  // 是否开启 mock
  useMock: boolean
  // 打印 mock 请求信息
  loggerMock: boolean
  // api授权认证前缀
  authPrefix: string
  // 消息分类
  messageKind: string
}

// 多语言
export type LocaleType = 'zh_CN' | 'en'

export interface LocaleSetting {
  showPicker: boolean
  // 当前语言
  locale: LocaleType
  // 默认语言
  fallback: LocaleType
  // 可用的 语言
  availableLocales: LocaleType[]
}
