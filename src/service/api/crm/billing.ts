import { request } from '@/service/http'

const url = 'crm/billing'

export default {
  /** 开票记录 */
  invoiceSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/invoice/search`, data)
  },
  /** 回款登记 */
  receiptSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/receipt/search`, data)
  },
  /** 客户收入：月度开票/回款与客户排行 */
  revenue: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/revenue/get`)
  },
}
