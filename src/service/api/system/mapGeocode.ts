import { request } from '@/service/http'

/** 地图 */
export default {
  /**
   * 地理编码
   * @param data 请求数据
   */
  geo: (data: Recordable) => {
    return request.Post<Service.Result>(`map/geocode/geo`, data)
  },
  /**
   * 逆地址编码
   * @param data 请求数据
   */
  regeo: (data: Recordable) => {
    return request.Post<Service.Result>(`map/geocode/regeo`, data)
  },
}
