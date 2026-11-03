import type { AccessToken } from '@/utils/token/types'
import { useGlobSetting } from '@/hooks/setting'
import { request } from '@/service/http'

const globSetting = useGlobSetting()
const authprefix = globSetting.authPrefix

/** 登录授权 */
export default {
  /**
   * 获取API授权令牌
   * @param data 请求数据
   * @returns 请求方法对象
   */
  token: (data: Auth.PasswordTokenCommand) => {
    const method = request.Post<Service.Result<AccessToken>>(`/${authprefix}/authorize/token`, data, {
      withCredentials: true,
    })
    method.meta = {
      withToken: false,
      authRole: null,
      showErr: false,
    }
    return method
  },
  /**
   * 获取API授权令牌
   * @param data
   */
  tokenSafety: (data: Auth.PasswordTokenCommand) => {
    const method = request.Post<Service.Result<AccessToken>>(`/${authprefix}/authorize/tokensafety`, data, {
      withCredentials: true,
    })
    method.meta = {
      withToken: false,
      authRole: null,
      showErr: false,
    }
    return method
  },
  /**
   * 注销令牌
   * @param refresh_token
   */
  unToken: (refresh_token: string | undefined) => {
    const method = request.Get(`/identity/authorize/untoken`, {
      params: { refresh_token },
      withCredentials: true,
    })
    method.meta = {
      authRole: 'refreshToken',
      isReturnNativeResponse: true,
      isTransformResponse: false,
    }
    return method
  },
  /**
   * 刷新令牌
   * @param refresh_token
   */
  refreshToken: (refresh_token: string) => {
    const method = request.Get<Service.Result<AccessToken>>(
      `/${authprefix}/authorize/refreshtoken`,
      {
        params: { key: refresh_token },
        withCredentials: true,
      },
    )
    method.meta = {
      withToken: false,
      authRole: 'refreshToken',
    }
    return method
  },
  /**
   * 发送登录验证码
   * @param data
   */
  sendVerifyCode: (data: Auth.SendVerifyCodeCommand) => {
    const method = request.Post<Service.Response>(`/${authprefix}/authorize/sendverifycode`, data)
    method.meta = {
      withToken: false,
      authRole: null,
      showErr: false,
    }
    return method
  },
  /**
   * 基于短信验证码获取API授权令牌
   * @param data 请求数据
   */
  sms: (data: Auth.VerifyCodeTokenCommand) => {
    const method = request.Post<Service.Result<AccessToken>>(`/${authprefix}/authorize/sms`, data)
    method.meta = {
      withToken: false,
      authRole: null,
      showErr: false,
    }
    return method
  },
}
