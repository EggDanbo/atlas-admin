import { createAlova } from 'alova'
import { createServerTokenAuthentication } from 'alova/client'
import VueHook from 'alova/vue'
import { projectConfig } from '@/config'
import { useMessage } from '@/hooks/naiveui/useMessage'
import { getApiBaseUrl } from '@/hooks/setting'
import { localMockAdapter } from '@/mock'
import { defaultConfig } from './config'
import {
  handleBusinessError,
  handleRefreshToken,
  handleResponseError,
  handlerJoinTime,
  handlerToken,
  handleServiceResult,
  normalizeUrlToLowerCase,
} from './helper'

function isTokenExpired(response: any, method: any): boolean {
  const isExpired = method.meta?.isExpired
  const jsonResult = response.data || {}
  return (response.status === 401 || jsonResult[defaultConfig.codeField] === 42001) && !isExpired
}

function markMethodAsExpired(method: any): void {
  if (!method.meta) {
    method.meta = { isExpired: true }
  }
  else {
    method.meta.isExpired = true
  }
}

const { onAuthRequired, onResponseRefreshToken }
  = createServerTokenAuthentication<typeof VueHook, typeof localMockAdapter>({
    assignToken: (method) => {
      handlerToken(defaultConfig, method)
    },
    refreshTokenOnSuccess: {
      isExpired: async (response, method) => isTokenExpired(response, method),
      handler: async (_response, method) => {
        markMethodAsExpired(method)
        await handleRefreshToken()
      },
    },
    refreshTokenOnError: {
      isExpired: async (response, method) => isTokenExpired(response, method),
      handler: async (_response, method) => {
        markMethodAsExpired(method)
        await handleRefreshToken()
      },
    },
  })

const { httpStatus } = projectConfig

export function createInstance(config: AlovaService.Config) {
  return createAlova({
    ...defaultConfig.alovaConfig,
    baseURL: config.baseURL,
    statesHook: VueHook,
    requestAdapter: localMockAdapter,
    beforeRequest: onAuthRequired((method) => {
      normalizeUrlToLowerCase(method)
      handlerJoinTime(method, defaultConfig.joinTime)
    }),
    responded: onResponseRefreshToken({
      onSuccess: async (response, method) => {
        const { status } = response

        if (status !== 200) {
          const errorResult = handleResponseError(response)
          return handleServiceResult(response, errorResult, false)
        }

        if (method.meta?.isReturnNativeResponse) {
          return response
        }

        if (method.meta?.isTransformResponse === false) {
          return response?.data
        }

        const jsonResult = response.data
        const code = jsonResult[config.codeField]
        const dataSource = jsonResult[config.dataField]

        if (code === httpStatus.success) {
          return handleServiceResult(response, { data: dataSource })
        }

        const errorResult = handleBusinessError(jsonResult, config, method.meta?.showErr)
        return handleServiceResult(response, errorResult, false)
      },
      onError(error) {
        try {
          const response = error.response
          let code = error.code
          let message = error.message

          if (response) {
            const jsonResult = response.data || {}
            code = jsonResult[config.codeField] || error.code
            message = jsonResult[config.messageField] || error.message
          }
          console.error('Error occurred:', { code, message })

          if (code === 500) {
            const $message = useMessage()
            $message.error(message)
          }
          if (response && response.status === 403) {
            const $message = useMessage()
            $message.error('没有权限访问')
          }
          return Promise.reject(message || 'Unknown error')
        }
        catch {
          return Promise.reject(new Error(`Error handling failed`))
        }
      },
    }),
  })
}

// 创建 Alova 实例， 如果多服务，可以创建多个实例，区分不同配置信息
export const request = createInstance({
  ...defaultConfig,
  baseURL: getApiBaseUrl(),
})
