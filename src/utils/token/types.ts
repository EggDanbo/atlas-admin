export interface AccessToken {
  /**
   * 访问令牌
   */
  access_token: string
  /**
   * Bearer
   */
  token_type: string
  /**
   * 有效期，以秒为单位
   */
  expires_in: 0
  /**
   * 令牌刷新标识
   */
  refresh_token?: string
  /**
   * 本地持久化有效期
   */
  expires_time?: number
  /**
   * 本地持久化更新时间
   */
  update_time?: number
  /**
   * 是否持久化
   */
  persistent?: boolean
}
