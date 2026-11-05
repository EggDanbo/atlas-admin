import { request } from '@/service/http'

const url = 'hr/attendance'

export default {
  /** 考勤明细 */
  recordSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/record/search`, data)
  },
  /** 月度汇总 */
  summarySearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/summary/search`, data)
  },
}
