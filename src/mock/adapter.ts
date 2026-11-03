/**
 * 本地 mock 适配器
 *
 * 替代 axios / 远程接口，作为 alova 的 requestAdapter：
 * - 不发起任何网络请求
 * - 按请求地址与参数，从本地 mock 引擎取数据
 * - 返回与后端一致的 { code, message, data } 结构
 */
import type { AlovaRequestAdapter, Method, RequestElements } from 'alova'
import type { MockRequestInput } from './engine'
import { handleMockRequest } from './engine'

/**
 * 请求配置类型
 *
 * 与 axios 适配器的配置保持兼容（withCredentials / timeout 等字段可继续书写），
 * 但本地适配器不会真正使用它们。
 */
export interface MockRequestConfig {
  params?: Record<string, any> | string
  headers?: Record<string, any>
  timeout?: number
  withCredentials?: boolean
  meta?: Record<string, any>
  [key: string]: any
}

/** 响应类型：结构与 axios 响应保持一致，便于上层逻辑复用 */
export interface MockResponse {
  status: number
  statusText: string
  headers: Record<string, any>
  config: Record<string, any>
  data: any
}

/** 本地 mock 适配器类型 */
export type MockAdapter = AlovaRequestAdapter<MockRequestConfig, MockResponse, Record<string, any>>

/** 模拟的响应延迟（毫秒），让交互更接近真实网络 */
const BASE_DELAY = 90
const JITTER = 120

/** 是否打印 mock 请求日志 */
const LOGGER_ENABLED = String(import.meta.env.VITE_LOGGER_MOCK) === 'true'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(): number {
  return BASE_DELAY + Math.floor(Math.random() * JITTER)
}

/** 从 method 中收集 GET 查询参数（alova 允许 string 或对象两种写法） */
function readParams(method: Method<any>): Record<string, any> {
  const raw = method?.config?.params
  if (!raw)
    return {}
  if (typeof raw === 'string') {
    const result: Record<string, any> = {}
    for (const pair of raw.replace(/^\?/, '').split('&')) {
      if (!pair)
        continue
      const [key, value = ''] = pair.split('=')
      if (key)
        result[decodeURIComponent(key)] = decodeURIComponent(value)
    }
    return result
  }
  return raw as Record<string, any>
}

/** 从请求元素中提取请求体 */
function readData(elements: RequestElements): Record<string, any> {
  const { data } = elements
  if (data && typeof data === 'object' && !(data instanceof FormData) && !(data instanceof Blob) && !(data instanceof ArrayBuffer) && !(data instanceof URLSearchParams) && !(data instanceof ReadableStream)) {
    return data as Record<string, any>
  }
  return {}
}

/**
 * 创建本地 mock 适配器
 * @returns 符合 alova requestAdapter 签名的函数
 */
export function createLocalMockAdapter(): MockAdapter {
  return (elements, method) => {
    const aborted = { value: false }

    const execute = async (): Promise<MockResponse> => {
      const input: MockRequestInput = {
        url: elements?.url ?? method?.url ?? '',
        type: String(elements?.type ?? method?.type ?? 'GET'),
        data: readData(elements),
        params: readParams(method),
      }

      await delay(randomDelay())
      if (aborted.value)
        throw new Error('mock request aborted')

      const payload = handleMockRequest(input)

      if (LOGGER_ENABLED) {
        console.log('[mock]', input.type, input.url, '→', payload.data)
      }

      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: payload,
      }
    }

    return {
      response: execute,
      headers: async () => ({}),
      abort: () => {
        aborted.value = true
      },
      onDownload: () => {},
      onUpload: () => {},
    }
  }
}

export const localMockAdapter = createLocalMockAdapter()
