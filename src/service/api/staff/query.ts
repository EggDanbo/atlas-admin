import { request } from '@/service/http'

const url = 'staff/query'

export default {
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
   * 导出调动明细
   * @param data 请求数据
   */
  allotExport: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/allotexport`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 导出调岗明细
   * @param data 请求数据
   */
  adjustExport: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`${url}/adjustexport`, data, { timeout: 1000 * 60 * 2 })
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
