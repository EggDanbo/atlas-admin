import { request } from '@/service/http'

const url = 'trade/project'

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
   * 审批表打印
   * @param id ID
   */
  card: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/card`, {
      params: { id },
    })
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
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 修改状态
   * @param data 请求数据
   */
  updateStatus: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatestatus`, data)
  },
  /**
   * 修改不收费月份
   * @param data 请求数据
   */
  updateMonths: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatemonths`, data)
  },
  /**
   * 盖章生效
   * @param data 请求数据
   */
  updateStart: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatestart`, data)
  },
  /**
   * 终止
   * @param data 请求数据
   */
  updateExpire: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateexpire`, data)
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
}
