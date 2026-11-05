import { request } from '@/service/http'

export default {
  /** 支付记录 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('expense/payment/list/search', data)
  },
}
