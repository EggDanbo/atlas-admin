import { request } from '@/service/http'

export default {
  /** flow 列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('asset/flow/list/search', data)
  },
}
