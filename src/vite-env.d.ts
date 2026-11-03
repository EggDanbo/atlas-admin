/// <reference types="vite/client" />

interface ViteTypeOptions {
  // 添加这行代码，你就可以将 ImportMetaEnv 的类型设为严格模式，
  // 这样就不允许有未知的键值了。
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_PATH: string
  readonly VITE_DROP_CONSOLE: string
  readonly VITE_PORT: number
  readonly VITE_API_URL: string
  readonly VITE_API_URL_PREFIX: string
  readonly VITE_PROXY: [string, string][]
  readonly VITE_UPLOAD_URL: string
  readonly VITE_FILE_URL: string
  readonly VITE_FILE_PREVIEW_BASE: string
  readonly VITE_USE_MOCK: boolean
  readonly VITE_MOCK_GROUPS: string
  readonly VITE_LOGGER_MOCK: boolean
  readonly VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
  readonly VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_SHORT_NAME: string
  readonly VITE_API_AUTH_PREFIX: string
  readonly VITE_API_MESSAGE_KIND: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
