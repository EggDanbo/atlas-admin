import { request } from '@/service/http'

/** 用户设置 */
export default {
  /**
   * 获取人员列表
   * @param data 请求数据
   */
  list: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`access/member/list`, data)
  },
  /**
   * 获取详细信息
   * @param userId 用户ID
   */
  get: (userId: string) => {
    return request.Get<Service.Result<Recordable>>(`access/member/get`, {
      params: { user_id: userId },
    })
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`access/member/search`, data)
  },
  /**
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`access/member/create`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`access/member/update`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`access/member/delete`, data)
  },
  /**
   * 更新缩写码
   */
  updateAbbr: () => {
    return request.Post<Service.Response>(`access/member/updateabbr`, {})
  },
  /**
   * 人员排序
   * @param data 请求数据
   */
  updateSort: (data: Recordable) => {
    return request.Post<Service.Response>(`access/member/updatesort`, data)
  },
  /**
   * 更新人员停用状态
   * @param data 请求数据
   */
  updateStoped: (data: Recordable) => {
    return request.Post<Service.Response>(`access/member/updatestoped`, data)
  },
  /**
   * 导出Excel
   * @param data 请求数据
   */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`access/member/export`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 打印
   * @param data 请求数据
   */
  print: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`access/member/print`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 批量导入
   * @param data 请求数据
   */
  batchImport: (data: Recordable) => {
    const method = request.Post<Service.Response>(`access/member/createbatchimport`, data, { timeout: 1000 * 60 * 2 })
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
    const method = request.Post<Service.Response>(`access/member/imagebatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
}
