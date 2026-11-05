import { request } from '@/service/http'

export default {
  /** value 列表 */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('asset/value/depreciation/search', data)
  },
}
