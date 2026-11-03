import { projectConfig } from '@/config'
import { useCookie } from '@/hooks/cookies'

// 使用自定义hook获取cookie操作方法
const { setCookie, getCookie, clearCookie } = useCookie()

const tokenField = projectConfig.app.tokenField
/**
 * 检查用户是否登录
 * @returns {boolean} 用户登录状态，true表示已登录，false表示未登录
 */
function isLogin() {
  return !!getCookie(tokenField)
}

/**
 * 设置用户token
 * @param {string} value - 要设置的token值
 * @param {any} options - 可选配置项，用于设置cookie的额外参数
 */
function setToken(value: string, options?: any) {
  setCookie(tokenField, value, options)
}

/**
 * 获取用户token
 * @returns {string} 用户的token值，如果未设置则返回空字符串
 */
function getToken() {
  return getCookie(tokenField)
}

/**
 * 清除用户token
 */
function clearToken() {
  clearCookie(tokenField)
}
export { clearToken, getToken, isLogin, setToken }
