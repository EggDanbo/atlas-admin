import { request } from '@/service/http'

const url = 'hr/dashboard'

export default {
  /** 人力看板：人数、结构、薪酬成本 */
  overview: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`)
  },
}
