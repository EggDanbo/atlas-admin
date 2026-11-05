import { request } from '@/service/http'

export default {
  /** maintain 列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('asset/maintain/list/search', data)
  },
}
