import type { AccessToken } from './types'

import { createStorage } from '@/utils/storage'

const local = createStorage({ storage: localStorage })
const session = createStorage({ storage: sessionStorage })

const TOKEN_KEY = 'ACCESS-TOKEN'

/**
 * 用户访问令牌
 */
let accessToken: AccessToken | null = null

/**
 * 保存访问令牌
 * @param {*} token
 * @param persistent 是否持久化
 */
function set(token: AccessToken, persistent?: boolean) {
  if (token && token.access_token) {
    const timestamp = Date.now()
    // 设置过期时间
    token.expires_time = timestamp + 1000 * token.expires_in
    // 更新时间
    token.update_time = timestamp
    token.persistent = persistent

    accessToken = token

    if (persistent) {
      local.set(TOKEN_KEY, token, null)
    }
    else {
      session.set(TOKEN_KEY, token, null)
    }
  }
}

/**
 * 获取访问令牌
 */
function get(): AccessToken | null {
  if (accessToken) {
    return accessToken
  }

  let data = session.get(TOKEN_KEY)
  if (!data) {
    // 尝试从本地获取
    data = local.get(TOKEN_KEY)
  }
  if (data) {
    accessToken = data as AccessToken
    return accessToken
  }
  else {
    return null
  }
}

/**
 *  删除访问令牌
 */
function remove() {
  session.remove(TOKEN_KEY)
  local.remove(TOKEN_KEY)
  accessToken = null
}

/**
 * 验证访问令牌是否过期
 */
function isExpired(token: AccessToken | null) {
  if (token && token.expires_time) {
    const timestamp = Date.now()
    // 提早3分钟刷新令牌
    return token.expires_time - timestamp < 180 * 1000
  }
  return false
}

export default {
  set,
  get,
  remove,
  isExpired,
}
