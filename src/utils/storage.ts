import { useGlobSetting } from '@/hooks/setting'

// 默认缓存期限为7天
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

// 预编译正则表达式：用于匹配 cookie 键名
const COOKIE_KEY_REGEX = /[^ =;]+(?==)/g

// 使用应用标识作为本地存储前缀
const globSetting = useGlobSetting()
let preifx = ''
if (globSetting.shortName)
  preifx = `${globSetting.shortName}:`

/**
 * 创建本地缓存对象
 */
export function createStorage({ prefixKey = preifx, storage = sessionStorage } = {}) {
  /**
   * 本地缓存类
   * @class Storage
   */
  const Storage = class {
    private storage = storage
    private prefixKey?: string = prefixKey

    /**
     * @description 设置缓存
     * @param {string} key 缓存键
     * @param {*} value 缓存值
     * @param expire
     */
    set(key: string, value: any, expire: number | null = DEFAULT_CACHE_TIME) {
      const stringData = JSON.stringify({
        value,
        expire: expire !== null ? Date.now() + expire * 1000 : null,
      })
      this.storage.setItem(this.getKey(key), stringData)
    }

    /**
     * 读取缓存
     * @param {string} key 缓存键
     * @param {*=} def 默认值
     */
    get(key: string, def: any = null) {
      const item = this.storage.getItem(this.getKey(key))
      if (item) {
        try {
          const data = JSON.parse(item)
          const { value, expire } = data
          // 在有效期内直接返回
          if (expire === null || expire >= Date.now()) {
            return value
          }
          this.remove(key)
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (_) {
          return def
        }
      }
      return def
    }

    /**
     * 从缓存删除某项
     * @param {string} key
     */
    remove(key: string) {
      this.storage.removeItem(this.getKey(key))
    }

    /**
     * 清空所有缓存
     * @memberOf Cache
     */
    clear(): void {
      this.storage.clear()
    }

    /**
     * 设置cookie
     * @param {string} name cookie 名称
     * @param {*} value cookie 值
     * @param {number=} expire 过期时间
     * 如果过期时间未设置，默认关闭浏览器自动删除
     * @example
     */
    setCookie(name: string, value: any, expire: number | null = DEFAULT_CACHE_TIME) {
      document.cookie = `${this.getKey(name)}=${value}; Max-Age=${expire}`
    }

    /**
     * 根据名字获取cookie值
     * @param name
     */
    getCookie(name: string): string {
      const cookieArr = document.cookie.split('; ')
      for (let i = 0, length = cookieArr.length; i < length; i++) {
        const kv = cookieArr[i]!.split('=')
        if (kv[0] === this.getKey(name)) {
          return kv[1]!
        }
      }
      return ''
    }

    /**
     * 根据名字删除指定的cookie
     * @param {string} key
     */
    removeCookie(key: string) {
      this.setCookie(key, 1, -1)
    }

    /**
     * 清空cookie，使所有cookie失效
     */
    clearCookie(): void {
      const keys = document.cookie.match(COOKIE_KEY_REGEX)
      if (keys) {
        for (let i = keys.length; i--;) {
          document.cookie = `${keys[i]}=0;expire=${new Date(0).toUTCString()}`
        }
      }
    }

    private getKey(key: string) {
      return `${this.prefixKey}${key}`.toUpperCase()
    }
  }
  return new Storage()
}

export const storage = createStorage()

export default Storage
