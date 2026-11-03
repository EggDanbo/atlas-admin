import type { AccessToken } from '@/utils/token/types'
import { useGlobSetting } from '@/hooks/setting'
import { request } from '@/service/http'

const globSetting = useGlobSetting()
const authprefix = globSetting.authPrefix

/** 企业微信 */
export default {
  /**
   * 登录绑定发送验证码,有效期为1分钟
   */
  sendVerifyCode: (data: Auth.SendLoginVerifyCodeCommand) => {
    const method = request.Post<Service.Response>(`/authorize/wechatwork/sendverifycode`, data)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 生成企业号网页授权 URL。
   */
  urlForConnectOAuth2: (data: Auth.UrlForConnectOAuth2Command) => {
    const method = request.Post<Service.Result<string>>(`/${authprefix}/authorize/wechatwork/urlforconnectoauth2`, data)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 生成企业号扫码授权 URL。
   */
  urlForSSOQrcodeConnect: (data: Auth.UrlForSSOQrcodeConnectCommand) => {
    const method = request.Post<Service.Result<string>>(`/${authprefix}/authorize/wechatwork/urlforssoqrcodeconnect`, data)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },

  /**
   * JSSDK签名
   */
  signJsSdk: (data: Auth.SignJsSdkCommand) => {
    const method = request.Post<Service.Result<Recordable<string>>>(`/${authprefix}/authorize/wechatwork/signjssdk`, data)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 获取企业微信应用信息
   */
  getApp: () => {
    const method = request.Get<Service.Result<Auth.WechatWorkAppInfo>>(`/${authprefix}/authorize/wechatwork/getapp`)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 获取State
   */
  getState: () => {
    const method = request.Get<Service.Result<string>>(`/authorize/wechatwork/getstate`)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 根据授权码获取访问凭证
   */
  token: (data: Auth.LoginTokenCommand) => {
    const method = request.Post<Service.Result<AccessToken>>(`/${authprefix}/authorize/wechatwork/token`, data)
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
}
