import Cookies from 'js-cookie'

/**
 * 提供一组用于操作cookie的工具函数
 */
export function useCookie() {
  /**
   * 设置Cookie。
   * @param key Cookie的键名。
   * @param value Cookie的值。
   * @param options 配置选项，例如过期时间、路径等。具体参见相关文档。
   */
  function setCookie(key: string, value: string, options?: any) {
    key && Cookies.set(key, value, options)
  }

  /**
   * 获取指定键名的cookie值。
   * @param key {string} 需要获取的cookie的键名。
   * @returns 返回键名为`key`的cookie的值。如果找不到，则返回`undefined`。
   */
  function getCookie(key: string) {
    return key && Cookies.get(key)
  }

  /**
   * 移除指定的令牌（token）。
   * @param key 令牌的键名，类型为字符串。这是要被移除的令牌在cookie中的标识符。
   */
  function clearCookie(key: string) {
    key && Cookies.remove(key)
  }

  // 返回所有cookie操作函数及Cookies实例
  return {
    Cookies,
    setCookie,
    getCookie,
    clearCookie,
  }
}
