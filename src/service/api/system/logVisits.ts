import { request } from '@/service/http'

/** 访问统计 */
export default {
  /**
   * 获取访问量
   */
  getVisitsList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/visits/getvisitslist`)
  },
  /**
   * 获取状态码统计
   */
  getHttpStatusCode: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/visits/gethttpstatuscode`)
  },
  /**
   * 获取最多请求的地址
   */
  getRequestUrl: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/visits/getrequesturl`)
  },
  /**
   * 获取最耗时的请求
   */
  getElapsedTime: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/visits/getelapsedtime`)
  },
}
