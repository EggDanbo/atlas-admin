import { request } from '@/service/http'

const url = 'finance/treasury'

export default {
  /** 资金总览：头寸卡片 + 收支曲线 + 账户结构 */
  overview: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/overview/get`)
  },
  /** 银行账户列表 */
  accountSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/account/search`, data)
  },
  /** 资金计划列表 */
  planSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/plan/search`, data)
  },
  /** 导出 */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
}
