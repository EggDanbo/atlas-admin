import { request } from '@/service/http'

const url = 'dashboard/overview'

export default {
  /**
   * 工作台：近 7 天提交与审批节奏
   *
   * 待办条数不在这里返回，页面按「我的申请 / 我的审批」两个列表的实际长度算，
   * 否则顶部数字和下面的列表经常对不上。
   */
  getWorkbench: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/summary`)
  },
  /**
   * 最新动态
   */
  getAlter: () => {
    return request.Get<Service.Result<Recordable>>(`${url}/getalter`)
  },
}
