import { request } from '@/service/http'

const url = 'trade/promise'

export default {
  /**
   * 获取详细信息
   * @param data
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { ...data },
    })
  },
  /**
   * 根据列表选择
   */
  getList: () => {
    return request.Get<Service.Result<Recordable[]>>(`${url}/getlist`)
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 无法回款
   * @param data 请求数据
   */
  updateReason: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatereason`, data)
  },
  /**
   * 导出开票
   * @param data 请求数据
   */
  sheet: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/sheet`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 导出Excel
   * @param data 请求数据
   */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/export`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 打印
   * @param data 请求数据
   */
  print: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/print`, data, { timeout: 1000 * 60 * 2 })
  },
}
