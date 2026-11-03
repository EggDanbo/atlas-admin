import { request } from '@/service/http'

const url = 'vouch/period'

export default {
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 修改凭证号
   * @param data 请求数据
   */
  updateNo: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateno`, data)
  },
  /**
   * 结转
   * @param data 请求数据
   */
  turnConfirm: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/turnconfirm`, data)
  },
  /**
   * 取消结转
   * @param data 请求数据
   */
  turnCancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/turncancel`, data)
  },
  /**
   * 审核
   * @param data 请求数据
   */
  lookConfirm: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/lookconfirm`, data)
  },
  /**
   * 取消审核
   * @param data 请求数据
   */
  lookCancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/lookcancel`, data)
  },
  /**
   * 结账
   * @param data 请求数据
   */
  bookConfirm: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/bookconfirm`, data)
  },
  /**
   * 取消结账
   * @param data 请求数据
   */
  bookCancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/bookcancel`, data)
  },
  /**
   * 复制余额
   * @param data 请求数据
   */
  copyBalance: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/copybalance`, data)
  },
  /**
   * 审计数据导出
   * @param data 请求数据
   */
  auditExport: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/auditexport`, data, { timeout: 1000 * 60 * 10 })
  },
}
