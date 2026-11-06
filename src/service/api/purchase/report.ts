import { request } from '@/service/http'

export default {
  /** 采购看板 */
  dashboard: () => {
    return request.Get<Service.Result<Recordable>>('purchase/report/dashboard/get')
  },
}
