import { request } from '@/service/http'

/** 用户权限管理 */
export default {

  /**
   * 获取权限列表
   */
  get: () => {
    return request.Get<Service.Result<Auth.Permission[]>>(`identity/permit/list`)
  },
  /**
   * 获取当前用户权限信息
   */
  currentUser: () => {
    return request.Get<Service.Result<string[]>>(`identity/permit/currentuser`)
  },
  /**
   * 验证当前用户权限
   */
  verifyUser: (data: any) => {
    return request.Post<Service.Response>(`identity/permituser/verifyuser`, data)
  },
  /**
   * 验证用户权限
   */
  verify: () => {
    return request.Post<Service.Response>(`identity/permituser/verify`)
  },
}
