import { request } from '@/service/http'

const url = 'map/geocode'

export default {
  /**
   * geo
   * @param data 请求数据
   */
  geo: (data: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/geo`, data)
  },
  /**
   * regeo
   * @param data 请求数据
   */
  regeo: (data: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/regeo`, data)
  },
}
