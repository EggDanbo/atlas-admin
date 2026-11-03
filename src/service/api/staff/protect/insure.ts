import { request } from '@/service/http'

const url = 'staff/protect/insure'

export default {
  /**
   * 获取详细信息
   * @param id ID
   */
  get: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { id },
    })
  },
  /**
   * 获取保单列表
   * @param data 请求数据
   */
  list: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/list`, data || {})
  },
  /**
   * 获取保单人员列表
   * @param data 请求数据
   */
  searchList: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/searchlist`, data || {})
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/create`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 保单替换
   * @param data 请求数据
   */
  replace: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/replace`, data)
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
  /**
   * 保单人员列表打印
   * @param data 请求数据
   */
  printList: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/printlist`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 导出保单人员列表Excel
   * @param data 请求数据
   */
  exportList: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/exportlist`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 保单增人
   * @param data 请求数据
   */
  batchUserAdd: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/batchuseradd`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 参保替换
   * @param data 请求数据
   */
  batchUserFor: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/batchuserfor`, data, { timeout: 1000 * 60 * 2 })
  },
}
