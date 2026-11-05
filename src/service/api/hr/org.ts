import { request } from '@/service/http'

const url = 'hr/org'

export default {
  /** 团队编制 */
  teamSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/team/search`, data)
  },
}
