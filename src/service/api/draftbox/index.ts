import { request } from '@/service/http'

/** 草稿箱 */
export default {
  /**
   * 获取草稿信息
   * @param id ID
   */
  get: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`draftbox/get`, {
      params: { id },
    })
  },
  /**
   * 查询草稿
   * @param types 类型
   */
  list: (types: string) => {
    return request.Post<Service.Result<Recordable>>(`draftbox/list`, { types })
  },
  /**
   * 查询草稿
   * @param data 请求数据
   */
  search: (data: any) => {
    return request.Post<Service.Result<Recordable>>(`draftbox/search`, data)
  },
  /**
   * 保存草稿
   * @param data 请求数据
   */
  save: (data: Recordable) => {
    return request.Post<Service.Response>(`draftbox/save`, data)
  },
  /**
   * 删除草稿
   * @param { id } id
   */
  remove: (id: Recordable) => {
    return request.Post<Service.Response>(`draftbox/remove`, { id })
  },
}
