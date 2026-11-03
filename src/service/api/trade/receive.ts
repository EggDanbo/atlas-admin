import { request } from '@/service/http'

const url = 'trade/receive'

export default {
  /**
   * 获取详细信息
   * @param data
   */
  get: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/get`, data)
  },
  /**
   * 获取分录的生成信息
   * @param data 请求数据
   */
  vouch: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/vouch`, data)
  },
  /**
   * 根据列表选择
   * @param data 请求数据
   */
  getList: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/getlist`, data)
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 分摊
   * @param data 请求数据
   */
  confirm: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/confirm`, data)
  },
  /**
   * 取消分摊
   * @param data 请求数据
   */
  cancel: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/cancel`, data)
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
   * 批量分摊
   * @param data 请求数据
   */
  batchAllot: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/allotbatchimport`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 二维码收款导入
   * @param data 请求数据
   */
  qrcodeImport: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/createqrcodeimport`, data, { timeout: 1000 * 60 * 2 })
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
  /**
   * 批量上传
   * @param data 请求数据
   */
  batchUpload: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/uploadbatchpdf`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 分摊批量导入
   * @param data 请求数据
   */
  allotBatchImport: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/allotbatchimport`, data, { timeout: 1000 * 60 * 2 })
  },
}
