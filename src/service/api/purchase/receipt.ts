import { request } from '@/service/http'

export default {
  /** 列表查询 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('purchase/settlement/receipt/search', data)
  },
}
