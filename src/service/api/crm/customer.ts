import { request } from '@/service/http'

const url = 'crm/customer'

export default {
  /** 客户档案 */
  archiveSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/archive/search`, data)
  },
  /** 联系人 */
  contactSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/contact/search`, data)
  },
  /** 导出 */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
}
