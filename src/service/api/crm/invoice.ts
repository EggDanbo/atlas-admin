import { request } from '@/service/http'

const url = 'crm/invoice'

export default {
  /**
   * 获取详细信息
   * @param data
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { ...data },
    })
  },
  /**
   * 获取分摊记录
   * @param id ID
   */
  allot: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/allot`, {
      params: { id },
    })
  },
  /**
   * 获取分录的生成信息
   * @param data 请求数据
   */
  vouch: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/vouch`, data)
  },
  /**
   * 根据列表选择
   * @param data 请求数据
   */
  getList: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/getlist`, data)
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/create`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 关联合同
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 冲红
   * @param data 请求数据
   */
  updateRed: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatered`, data)
  },
  /**
   * 分摊
   * @param data 请求数据
   */
  updateAllot: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateallot`, data)
  },
  /**
   * 停用/启用
   * @param data 请求数据
   */
  updateStoped: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatestoped`, data)
  },
  /**
   * 导出入账表
   * @param data 请求数据
   */
  sheet: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/sheet`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 导出Excel
   * @param data 请求数据
   */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 打印
   * @param data 请求数据
   */
  print: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/print`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 批量分摊
   * @param data 请求数据
   */
  batchAllot: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/allotbatchimport`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 批量导入
   * @param data 请求数据
   */
  batchImport: (data: Recordable) => {
    const method = request.Post<Service.Response>(`${url}/createbatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
  /**
   * 批量上传
   * @param data 请求数据
   */
  batchUpload: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/uploadbatchpdf`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 分摊批量导入
   * @param data 请求数据
   */
  allotBatchImport: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/allotbatchimport`, data, { timeout: 1000 * 60 * 2 })
  },
}
