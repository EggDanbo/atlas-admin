import { request } from '@/service/http'

/** 外部接口角色管理 */
export const externalRole = {
  /**
   * 获取角色权限列表
   */
  getPermList: (data: Recordable) => {
    return request.Get<Service.Result<Auth.Permission[]>>(`external/role/getpermlist`, {
      params: { ...data },
    })
  },

  /**
   * 获取角色列表
   */
  list: (data: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`external/role/list`, data)
  },
  /**
   * 获取角色类型列表
   */
  getKind: () => {
    return request.Get<Service.Result<DropDownItem[]>>(`external/role/getkind`)
  },
  /**
   * 获取角色信息
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`external/role/get`, {
      params: { ...data },
    })
  },
  /**
   * 获取角色功能权限
   */
  getPerm: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`external/role/getperm`, {
      params: { ...data },
    })
  },

  /**
   * 角色新增
   */
  create: (data: Recordable) => {
    return request.Post<Service.Response>(`external/role/create`, data)
  },
  /**
   * 角色修改
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`external/role/update`, data)
  },
  /**
   * 角色删除
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`external/role/delete`, data)
  },
  /**
   * 角色排序
   */
  updateSort: (data: Recordable) => {
    return request.Post<Service.Response>(`external/role/updatesort`, data)
  },
}

/** 外部接口账号管理 */
export const externalAccount = {
  /**
   * 获取列表
   */
  search: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>('external/account/search', data)
  },
  /**
   * 获取密钥
   */
  getSecret: (id: string) => {
    return request.Get<Service.Result<string>>('external/account/getsecret', { params: { id } })
  },
  /**
   * 新增
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>('external/account/create', data)
  },
  /**
   * 修改
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>('external/account/update', data)
  },
  /**
   * 删除
   */
  delete: (id: string) => {
    return request.Post<Service.Response>('external/account/delete', { value: id })
  },
  /**
   * 获取角色类型列表
   */
  getKind: () => {
    return request.Get<Service.Result<DropDownItem[]>>('external/account/getkind')
  },
  /**
   * 根据账号ID获取角色信息
   */
  getRole: (id: string) => {
    return request.Get<Service.Result<Recordable[]>>('external/account/get', { params: { id } })
  },
  /**
   * 外部接口账号角色更新
   */
  updateRole: (data: { list: string[], role: string[] }) => {
    return request.Post<Service.Response>('external/account/updaterole', data)
  },
  /**
   * 获取角色设置列表
   */
  roleList: () => {
    return request.Post<Service.Result<Recordable[]>>('external/account/role')
  },
}

export default {
  role: externalRole,
  account: externalAccount,
}
