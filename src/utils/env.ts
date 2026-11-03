import type { GlobEnvConfig } from '../../typings/config'

/**
 * 获取应用环境配置
 */
export function getAppEnvConfig() {
  const ENV = import.meta.env as unknown as GlobEnvConfig
  return {
    ...ENV,
  }
}

/**
 * 开发模式
 */
export const devMode = 'development'

/**
 * 生产模式
 */
export const prodMode = 'production'

/**
 * 获取环境变量
 * @returns {string} 当前环境
 */
export function getEnv(): string {
  return import.meta.env.MODE
}

/**
 * 判断是否为开发模式
 * @returns {boolean} 是否为开发模式
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV
}

/**
 * 判断是否为生产模式
 * @returns {boolean} 是否为生产模式
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD
}
