import { request } from '@/service/http'

const url = 'workflow/approve'

export default {
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data?: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data || {})
  },
  /**
   * 审批/退回
   * @param data 请求数据
   */
  process: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/process`, data)
  },
  /**
   * 一键审批
   * @param data 请求数据
   */
  confirm: (data?: Recordable) => {
    return request.Post<Service.Response>(`${url}/confirm`, data || {})
  },
  /**
   * 取消审批
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/cancel`, data)
  },
  /**
   * 撤回
   * @param data 请求数据
   */
  revoke: (data?: Recordable) => {
    return request.Post<Service.Response>(`${url}/revoke`, data || {})
  },
  /**
   * 作废
   * @param data 请求数据
   */
  invalid: (data?: Recordable) => {
    return request.Post<Service.Response>(`${url}/invalid`, data || {})
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
