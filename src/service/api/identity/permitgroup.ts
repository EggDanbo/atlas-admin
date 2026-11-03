import { request } from '@/service/http'

/** 用户分组权限 */
export default {
  /**
   * 根据分组权限获取数据
   */
  getGroupUser: (data: Recordable) => {
    return request.Post<Service.Result<DropDownItem[]>>(`identity/permitgroup/getgroupuser`, data)
  },
  /**
   * 获取分组权限枚举
   */
  getGroupEnum: () => {
    return request.Get<Service.Result<DropDownItem[]>>(`identity/permitgroup/getgroupenum`)
  },
  /**
   * 根据用户ID获取权限列表
   */
  getGroupList: (user_id: number | string) => {
    return request.Get<Service.Result<Recordable[]>>(`identity/permitgroup/getgrouplist`, {
      params: {
        user_id,
      },
    })
  },
  /**
   * 查询用户权限分页数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`identity/permitgroup/search`, data)
  },
  /**
   * 获取详细信息
   */
  get: (id: number | string) => {
    return request.Get<Service.Result>(`identity/permitgroup/get`, {
      params: {
        id,
      },
    })
  },
  /**
   * 分组权限新增
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`identity/permitgroup/create`, data)
  },
  /**
   * 分组权限修改
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/permitgroup/update`, data)
  },
  /**
   * 分组权限删除
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/permitgroup/delete`, data)
  },
  /**
   * 分组权限清空
   */
  clear: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/permitgroup/clear`, data)
  },
  /**
   * 设为工作中
   */
  openWorking: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/permitgroup/openworking`, data)
  },
  /**
   * 关闭工作中
   */
  closeWorking: (data: Recordable) => {
    return request.Post<Service.Response>(`identity/permitgroup/closeworking`, data)
  },
}
