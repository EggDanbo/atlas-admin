import type { GlobConfig } from '../../../typings/config'
import { getAppEnvConfig } from '@/utils/env'

// 预编译正则表达式：用于验证应用短名称只包含字母和下划线
const SHORT_NAME_REGEX = /^[a-z_]*$/i

// 这里的 useGlobSetting 用于获取全局环境变量
export function useGlobSetting(): Readonly<GlobConfig> {
  const {
    VITE_APP_TITLE,
    VITE_API_URL,
    VITE_APP_SHORT_NAME,
    VITE_API_URL_PREFIX,
    VITE_UPLOAD_URL,
    VITE_FILE_URL,
    VITE_USE_MOCK,
    VITE_LOGGER_MOCK,
    VITE_API_AUTH_PREFIX,
    VITE_API_MESSAGE_KIND,
  } = getAppEnvConfig()

  if (!SHORT_NAME_REGEX.test(VITE_APP_SHORT_NAME)) {
    console.warn(
      `VITE_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    )
  }
  function strToBoolean(val: string): boolean {
    return val === 'true'
  }
  return {
    title: VITE_APP_TITLE,
    apiUrl: VITE_API_URL,
    shortName: VITE_APP_SHORT_NAME,
    urlPrefix: VITE_API_URL_PREFIX,
    uploadUrl: VITE_UPLOAD_URL,
    fileUrl: VITE_FILE_URL,
    useMock: strToBoolean(String(VITE_USE_MOCK)),
    loggerMock: strToBoolean(String(VITE_LOGGER_MOCK)),
    authPrefix: VITE_API_AUTH_PREFIX,
    messageKind: VITE_API_MESSAGE_KIND,
  }
}

/**
 * 获取API网站基础地址
 * @returns string
 */
export function getApiBaseUrl(): string {
  const globSetting = useGlobSetting()
  let appurl = globSetting.apiUrl
  let urlPrefix = globSetting.urlPrefix || ''
  if (urlPrefix) {
    if (urlPrefix.startsWith('/')) {
      urlPrefix = urlPrefix.slice(1)
    }
    if (urlPrefix.endsWith('/')) {
      urlPrefix = urlPrefix.slice(0, Math.max(0, urlPrefix.length - 1))
    }
    if (appurl.endsWith('/')) {
      appurl += urlPrefix
    }
    else {
      appurl = `${appurl}/${urlPrefix}`
    }
  }
  return appurl
}
