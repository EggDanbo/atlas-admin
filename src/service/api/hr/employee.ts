import { request } from '@/service/http'

const url = 'hr/employee'

export default {
  /** 员工花名册 */
  rosterSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/roster/search`, data)
  },
  /** 异动流水 */
  movementSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/movement/search`, data)
  },
}
