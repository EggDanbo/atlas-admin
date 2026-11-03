import { request } from '@/service/http'

/** 用户权限管理 */
export default {

  /**
   * 查询用户权限分页数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('identity/permituser/search', data)
  },
  /**
   * 获取角色类型列表
   */
  getKind: () => {
    return request.Get<Service.Result<DropDownItem[]>>('identity/permituser/getkind')
  },
  /**
   * 获取角色设置列表（用于角色设置弹窗）
   */
  roleList: () => {
    return request.Post<Service.Result<Recordable[]>>('identity/permituser/role')
  },
  /**
   * 获取用户角色列表
   */
  userPerm: (userId: string) => {
    return request.Get<Service.Result<Recordable[]>>('identity/permituser/get', { params: { userId } })
  },
  /**
   * 用户角色更新
   */
  updateRole: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/updaterole', data)
  },
  /**
   * 用户角色清空
   */
  clearRole: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/clearrole', data)
  },
  /**
   * 用户密码登录设置（加密）
   */
  setPwdSafety: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/setpwdsafety', data)
  },
  /**
   * 用户密码登录设置
   */
  setPwd: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/setpwd', data)
  },
  /**
   * 用户密码登录删除
   */
  clearPwd: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/clearpwd', data)
  },
  /**
   * 用户登录清空(包括微信相关登录)
   */
  clearLogin: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/clearlogin', data)
  },
  /**
   * 解除登录锁定
   */
  releaseLock: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/releaselock', data)
  },
  /**
   * 登录账号修改（加密）
   */
  updateCodeSafety: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/updatecodesafety', data)
  },
  /**
   * 登录账号修改
   */
  updateCode: (data: Recordable) => {
    return request.Post<Service.Response>('identity/permituser/updatecode', data)
  },
}
