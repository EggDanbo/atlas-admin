import { request } from '@/service/http'

const url = 'crm/opportunity'

export default {
  /** 商机列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/list/search`, data)
  },
  /** 漏斗：阶段金额、数量与整体转化 */
  funnel: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/funnel/get`)
  },
}
