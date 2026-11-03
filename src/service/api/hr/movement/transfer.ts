import { request } from '@/service/http'

const url = 'hr/movement/transfer'

export default {
  /**
   * 获取详细信息
   * @param data 请求数据
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { ...data },
    })
  },
  /**
   * 审批表打印
   * @param id ID
   */
  card: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/card`, {
      params: { id },
    })
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
   * 核对
   * @param data 请求数据
   */
  accept: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/accept`, data)
  },
  /**
   * 级别调整
   * @param data 请求数据
   */
  updateScale: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatescale`, data)
  },
  /**
   * 完成
   * @param data 请求数据
   */
  confirm: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/confirm`, data)
  },
  /**
   * 取消调动
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/cancel`, data)
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
