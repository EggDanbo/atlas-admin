import { request } from '@/service/http'

export default {
  /** 合同台账 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('expense/contract/list/search', data)
  },
}
