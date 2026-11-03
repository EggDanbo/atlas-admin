import { request } from '@/service/http'

const url = 'asset/check'

export default {
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 盘点
   * @param data 请求数据
   */
  confirm: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/confirm`, data)
  },
  /**
   * 取消
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/cancel`, data)
  },
  /**
   * 获取盘点单列表
   * @param data 请求数据
   */
  searchBill: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/searchbill`, data)
  },
  /**
   * 新增盘点单
   * @param data 请求数据
   */
  createBill: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/createbill`, data)
  },
  /**
   * 删除盘点单
   * @param data 请求数据
   */
  deleteBill: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/deletebill`, data)
  },
  /**
   * 处理盘点单
   * @param data 请求数据
   */
  handleBill: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/handlebill`, data)
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
