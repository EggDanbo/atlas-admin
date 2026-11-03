import { request } from '@/service/http'

const url = 'hr/payroll/payment'

export default {
  /**
   * 获取详细信息
   * @param id ID
   */
  get: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { id },
    })
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 计算
   * @param data 请求数据
   */
  counts: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/counts`, data)
  },
  /**
   * 调整发放额
   * @param data 请求数据
   */
  actual: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/actual`, data)
  },
  /**
   * 发放
   * @param data 请求数据
   */
  confirm: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/confirm`, data)
  },
  /**
   * 取消
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/cancel`, data)
  },
  /**
   * 导出发放表
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
