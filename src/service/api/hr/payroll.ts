import { request } from '@/service/http'

const url = 'hr/payroll'

export default {
  /** 工资表 */
  sheetSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/sheet/search`, data)
  },
}
