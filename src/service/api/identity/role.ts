import { request } from '@/service/http'

/** 用户权限管理 */
export default {

  /**
   * 获取角色权限列表
   */
  getPermList: (data: Recordable) => {
    return request.Get<Service.Result<Auth.Permission[]>>(`identity/role/getpermlist`, {
      params: { ...data },
    })
  },

  /**
   * 获取角色列表
   */
  list: (data: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`identity/role/list`, data)
  },
  /**
   * 获取角色类型列表
   */
  getKind: () => {
    return request.Get<Service.Result<DropDownItem[]>>(`identity/role/getkind`)
  },
  /**
   * 获取角色信息
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`identity/role/get`, {
      params: { ...data },
    })
  },
  /**
   * 获取角色功能权限
   */
  getPerm: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`identity/role/getperm`, {
      params: { ...data },
    })
  },
  /**
   * 获取角色数据权限
   */
  getPermData: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`identity/role/getpermdata`, {
      params: { ...data },
    })
  },

  /**
   * 角色新增
   */
  create: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/role/create`, data)
  },
  /**
   * 角色修改
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/role/update`, data)
  },
  /**
   * 角色删除
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/role/delete`, data)
  },
  /**
   * 角色排序
   */
  updateSort: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/role/updatesort`, data)
  },
}
