import { request } from '@/service/http'

const url = 'finance/arap'

export default {
  /** 应收账龄 */
  receivableSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/receivable/search`, data)
  },
  /** 应付账款 */
  payableSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/payable/search`, data)
  },
  /** 导出 */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
}
