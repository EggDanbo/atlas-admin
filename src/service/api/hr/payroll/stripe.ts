import { request } from '@/service/http'

const url = 'hr/payroll/stripe'

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
   * 确认
   * @param data 请求数据
   */
  confirm: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/confirm`, data)
  },
  /**
   * 取消
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/cancel`, data)
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
}
