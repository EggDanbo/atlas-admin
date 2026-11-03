import { request } from '@/service/http'

const url = 'board/workplace'

export default {
  /**
   * 获取人员变动
   */
  getAlter: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/getalter`)
  },
  /**
   * 数据校验
   * @param data 请求数据
   */
  valid: (data?: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/valid`, data || {}, { timeout: 1000 * 60 * 2 })
  },
}
