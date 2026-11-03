import { request } from '@/service/http'

/** 用户设置 */
export default {
  /**
   * 获取人员列表
   * @param data 请求数据
   */
  list: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`organ/user/list`, data)
  },
  /**
   * 获取详细信息
   * @param userId 用户ID
   */
  get: (userId: string) => {
    return request.Get<Service.Result<Recordable>>(`organ/user/get`, {
      params: { user_id: userId },
    })
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`organ/user/search`, data)
  },
  /**
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`organ/user/create`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`organ/user/update`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`organ/user/delete`, data)
  },
  /**
   * 更新缩写码
   */
  updateAbbr: () => {
    return request.Post<Service.Response>(`organ/user/updateabbr`, {})
  },
  /**
   * 人员排序
   * @param data 请求数据
   */
  updateSort: (data: Recordable) => {
    return request.Post<Service.Response>(`organ/user/updatesort`, data)
  },
  /**
   * 更新人员停用状态
   * @param data 请求数据
   */
  updateStoped: (data: Recordable) => {
    return request.Post<Service.Response>(`organ/user/updatestoped`, data)
  },
  /**
   * 导出Excel
   * @param data 请求数据
   */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`organ/user/export`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 打印
   * @param data 请求数据
   */
  print: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`organ/user/print`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 批量导入
   * @param data 请求数据
   */
  batchImport: (data: Recordable) => {
    const method = request.Post<Service.Response>(`organ/user/createbatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
  /**
   * 照片批量导入
   * @param data 请求数据
   */
  batchImportImage: (data: Recordable) => {
    const method = request.Post<Service.Response>(`organ/user/imagebatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
}
