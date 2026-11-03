import { request } from '@/service/http'

const url = 'staff/checkin/festival'

export default {
  /**
   * 获取某年节日登记列表
   * @param data 请求数据
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable[]>>(`${url}/get`, {
      params: { ...data },
    })
  },
  /**
   * 新增节日
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/create`, data)
  },
  /**
   * 编辑节日
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 删除节日
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
}
