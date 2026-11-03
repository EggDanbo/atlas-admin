import type { ViteEnv } from '../../typings/config'
import process from 'node:process'
import { isString } from 'lodash-es'
import { loadEnv } from 'vite'

type Recordable<T = any> = Record<string, T>

// 用于替换环境变量中的换行符转义序列
const NEWLINE_REGEX = /\\n/g

export function getEnv(mode: string) {
  const root = process.cwd()
  return loadEnv(mode, root)
}

export function isReportMode(): boolean {
  return process.env.REPORT === 'true'
}

// 增加类型检查和限制，优化环境变量处理逻辑
export function wrapperEnv(envConf: Recordable): ViteEnv {
  const ret: Recordable = {}

  for (const envName of Object.keys(envConf)) {
    let realName = isString(envConf[envName])
      ? envConf[envName].replace(NEWLINE_REGEX, '\n')
      : envConf[envName]
    realName = realName === 'true' ? true : realName === 'false' ? false : realName

    if (envName === 'VITE_PORT') {
      realName = Number(realName)
    }
    // 解析 VITE_PROXY JSON 字符串
    if (envName === 'VITE_PROXY' && isString(realName)) {
      try {
        realName = JSON.parse(realName)
      }
      catch {
        // 如果解析失败，设置为空数组
        console.error(`解析 VITE_PROXY JSON 字符串失败: ${realName}`)
        realName = []
      }
    }
    ret[envName] = realName
    if (typeof realName === 'string') {
      process.env[envName] = realName
    }
    else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName)
    }
  }
  return ret as ViteEnv
}
