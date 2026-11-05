import { request } from '@/service/http'

export default {
  /** check 列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('asset/check/list/search', data)
  },
}
