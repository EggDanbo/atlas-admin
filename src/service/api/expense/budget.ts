import { request } from '@/service/http'

export default {
  /** 费用预算额度 */
  quotaSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('expense/budget/quota/search', data)
  },
}
