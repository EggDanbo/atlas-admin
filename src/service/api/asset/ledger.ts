import { request } from '@/service/http'

export default {
  /** ledger 列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('asset/ledger/list/search', data)
  },
}
