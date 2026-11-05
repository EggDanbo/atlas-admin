import { request } from '@/service/http'

export default {
  /** 资产看板 */
  dashboard: () => {
    return request.Get<Service.Result<Recordable>>('asset/report/dashboard/get')
  },
}
