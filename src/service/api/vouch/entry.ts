import { request } from '@/service/http'

const url = 'vouch/entry'

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
   * 凭证打印
   * @param id ID
   */
  card: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/card`, {
      params: { id },
    })
  },
  /**
   * 凭证批量打印
   * @param data 请求数据
   */
  cards: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/cards`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 获取凭证号修改历史
   * @param data 请求数据
   */
  getHistory: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/gethistory`, data)
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
   * 修改凭证号
   * @param data 请求数据
   */
  updateNo: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateno`, data)
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
   * 批量导入
   * @param data 请求数据
   */
  batchImport: (data: Recordable) => {
    const method = request.Post<Service.Response>(`${url}/createbatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
}
