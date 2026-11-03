import type { AccessToken } from '@/utils/token/types'
import { request } from '@/service/http'

/** 用户权限管理 */
export default {

  /**
   * 获取当前登录用户信息
   */
  get: () => {
    return request.Get<Service.Result<Auth.UserCurrent>>(`identity/profile/get`)
  },
  /**
   * 我的信息
   */
  info: () => {
    return request.Get<Service.Result<Auth.UserProfile>>(`identity/profile/info`)
  },
  /**
   * 系统切换
   */
  switch: (data: Auth.ScreenTokenCommand) => {
    return request.Get<Service.Result<AccessToken>>(`identity/profile/switch`, {
      params: { ...data },
    })
  },
  /**
   * 创建展示类令牌
   */
  getScreenToken: (data: Auth.SwitchTokenCommand) => {
    return request.Get<Service.Result<AccessToken>>(`identity/profile/getscreentoken`, {
      params: { ...data },
    })
  },

  /**
   * 我的密码修改
   */
  changePasswordSafety: (data: Auth.ChangePassWordCommand) => {
    return request.Post<Service.Response>(`identity/profile/changepasswordsafety`, data)
  },
  /**
   * 我的密码修改
   */
  changePassword: (data: Auth.ChangePassWordCommand) => {
    return request.Post<Service.Response>(`identity/profile/changepassword`, data)
  },
  /**
   * 我的信息修改
   */
  updateProfile: (data: Auth.UpdateProfileCommand) => {
    return request.Post<Service.Response>(`identity/profile/updateprofile`, data)
  },
  /**
   * 修改工作状态
   */
  updateWorking: (data: Auth.UpdateWorkingCommand) => {
    return request.Post<Service.Response>(`identity/profile/updateworking`, data)
  },
  /**
   * 人员照片更新
   */
  updatePic: (data: Auth.UpdateProfilePictureCommand) => {
    return request.Post<Service.Response>(`identity/profile/updatepic`, data)
  },
  /**
   * 人脸照片更新
   */
  updateFace: (data: Auth.UpdateWorkingCommand) => {
    return request.Post<Service.Response>(`identity/profile/updateface`, data)
  },
  /**
   * 签名图片更新
   */
  updateSign: (data: Auth.UpdateWorkingCommand) => {
    return request.Post<Service.Response>(`identity/profile/updatesign`, data)
  },
}
