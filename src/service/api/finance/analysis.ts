import { request } from '@/service/http'

const url = 'finance/analysis'

export default {
  /** 经营看板：收入/成本/费用序列、费用结构、部门 TOP */
  dashboard: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/dashboard/get`)
  },
  /** 财务指标 */
  indicatorSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/indicator/search`, data)
  },
  /** 导出 */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
}
