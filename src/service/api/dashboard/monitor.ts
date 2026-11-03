import { request } from '@/service/http'

const url = 'dashboard/monitor'

export default {
  /**
   * 监控台总览：模块指标 + 图表数据
   */
  getOverview: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/overview`)
  },
}
