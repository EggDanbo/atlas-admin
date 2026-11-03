import { isObject, isString, merge } from 'lodash-es'
import { useMessage } from '@/hooks/naiveui/useMessage'
import authorize from '@/service/api/identity/authorize'
import { useUserStore } from '@/store/modules/user'
import { tenantStorage } from '@/utils/tenant'
import token from '@/utils/token'
import { setObjToUrlParams } from '@/utils/urlUtils'
import { noErrorTipCodes, responseStatus } from './config'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm'

export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T,
): T extends true ? string : object

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {}
  }
  const now = Date.now()
  if (restful) {
    return `?_t=${now}`
  }
  return { _t: now }
}

// 合并配置
export function mergeConfig(config: any, neConfig: any) {
  return merge(config, neConfig)
}

// 处理 Token 凭证
export function handlerToken(config, method) {
  if (method.meta?.withToken !== false) {
    const accessToken = token.get()
    if (accessToken) {
      method.config.headers[config.tokenField]
        = `${accessToken.token_type} ${accessToken.access_token}`
    }
  }
  // 多租户 header
  const tenantId = tenantStorage.get()
  if (tenantId) {
    method.config.headers['Filter-Tenant'] = tenantId
  }
}

// 处理请求参数
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return
  }

  for (const key in params) {
    if (params[key] && params[key]._isAMomentObject) {
      params[key] = params[key].format(DATE_TIME_FORMAT)
    }
    if (isString(key)) {
      const value = params[key]
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value
        }
        catch (error) {
          throw new Error(error as any)
        }
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key])
    }
  }
}

// 处理 URL 小写转换（仅转换路径部分，不转换查询参数）
export function normalizeUrlToLowerCase(method) {
  const url = method.url as string
  if (!url)
    return

  // 分离路径和查询参数
  const [path, query] = url.split('?')
  if (path) {
    method.url = query ? `${path.toLowerCase()}?${query}` : path.toLowerCase()
  }
}

// 处理时间戳参数
export function handlerJoinTime(method, joinTime) {
  if (joinTime === true) {
    const config = method.config
    const params = config.params || {}
    const data = method.data || {}
    const formatDate = config.meta?.formatDate || false
    const joinParamsToUrl = config.meta?.joinParamsToUrl || false
    if (method.type === 'GET') {
      if (!isString(params)) {
        method.config.params = Object.assign(
          params || {},
          joinTimestamp(joinTime, false),
        )
      }
      else {
        method.url = `${method.url + params}${joinTimestamp(joinTime, true)}`
      }
    }
    else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (
          Reflect.has(method, 'data')
          && method.data
          && (Object.keys(method.data).length > 0
            || method.data instanceof FormData)
        ) {
          method.data = data
          config.params = params
        }
        else {
          method.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          method.url = setObjToUrlParams(
            method.url as string,
            Object.assign({}, config.params, method.data),
          )
        }
      }
      else {
        // 兼容restful风格
        method.url = config.url + params
        config.params = undefined
      }
    }
  }
}

// open 一个错误提示
export function openErrorMessage(message: string) {
  const $message = useMessage()
  $message.info(message)
}

/**
 * @description: 统一成功和失败返回类型
 * @param response 适配器响应（原样打包，不读取属性）
 * @param {any} data
 * @param {boolean} isSuccess
 * @return {*} result
 */
export function handleServiceResult<T>(response: T, data: any, isSuccess: boolean = true) {
  const result = {
    response,
    isSuccess,
    errorType: null,
    ...data,
  }
  return result
}

/**
 * @description:
 * @param {Record} data 接口返回的后台数据
 * @param {Service} config
 * @param {boolean} showErr
 * @return {*}
 */
export function handleBusinessError(
  data: Record<string, any>,
  config: AlovaService.Config,
  showErr?: boolean,
) {
  const error: Service.BaseResponse = {
    errorType: 'Business Error',
    code: data[config.codeField],
    message: data[config.messageField] || 'Unknown error',
    data: data[config.dataField],
  }

  if (showErr === undefined || showErr === true)
    showError(error)

  return error
}

type ErrorStatus = keyof typeof responseStatus

/**
 * @description: 处理请求成功，但返回后端服务器报错
 * @param response 适配器响应
 * @param response.status 响应状态码
 * @return {*}
 */
export function handleResponseError(response: { status: number }) {
  const error: Service.BaseResponse = {
    errorType: 'Response Error',
    code: 0,
    message: responseStatus.default,
    data: null,
  }
  const errorCode: ErrorStatus = response.status as ErrorStatus
  const message = responseStatus[errorCode] || responseStatus.default
  Object.assign(error, { code: errorCode, message })

  showError(error)

  return error
}

// 刷新token的Promise缓存，防止并发刷新
let refreshTokenPromise: Promise<void> | null = null

/**
 * @description: 处理接口token刷新
 * @return {*}
 */
export async function handleRefreshToken() {
  // 如果已经有正在进行的刷新，直接返回该Promise
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  const authStore = useUserStore()
  const accessToken = token.get()

  if (!accessToken || !accessToken.refresh_token) {
    await authStore.logout()
    authStore.logoutRedirect()
    return
  }

  // 创建新的刷新Promise
  refreshTokenPromise = (async () => {
    try {
      const { data } = await authorize.refreshToken(accessToken.refresh_token!)
      if (data) {
        token.set(data, false)
      }
      else {
        // 刷新失败，退出
        await authStore.logout()
        authStore.logoutRedirect()
      }
    }
    catch {
      // 刷新失败，退出
      await authStore.logout()
      authStore.logoutRedirect()
    }
    finally {
      // 刷新完成后清除缓存，允许下次刷新
      refreshTokenPromise = null
    }
  })()

  return refreshTokenPromise
}

export function showError(error: Service.BaseResponse) {
  // 如果error不需要提示,则跳过
  const code = Number(error.code)
  if (noErrorTipCodes.includes(code))
    return

  openErrorMessage(error.message)
}
