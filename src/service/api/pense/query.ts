import { request } from '@/service/http'

const url = 'pense/query'

export default {
  /**
   * 获取中队长审批选项
   * @param data 请求数据
   */
  getRequire: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/getrequire`, data || {})
  },
  /**
   * 获取申请列表
   * @param data 请求数据
   */
  getApply: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/getapply`, data || {})
  },
  /**
   * 获取申请列表
   * @param data 请求数据
   */
  getList: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/getlist`, data || {})
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
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
