import { request } from '@/service/http'

export default {
  /** 费用看板 */
  dashboard: () => {
    return request.Get<Service.Result<Recordable>>('expense/report/dashboard/get')
  },
}
