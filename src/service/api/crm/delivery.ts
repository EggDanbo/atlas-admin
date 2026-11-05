import { request } from '@/service/http'

const url = 'crm/delivery'

export default {
  /** 项目台账 */
  projectSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/project/search`, data)
  },
  /** 里程碑 */
  milestoneSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/milestone/search`, data)
  },
  /** 导出 */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
}
