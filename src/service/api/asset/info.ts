import { request } from '@/service/http'

const url = 'asset/info'

export default {
  /**
   * 获取可操作资产列表
   * @param data 请求数据
   */
  getList: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/getlist`, data || {})
  },
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
   * 获取打印标签的详细信息
   * @param id ID
   */
  card: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/card`, {
      params: { id },
    })
  },
  /**
   * 标签打印
   * @param data 请求数据
   */
  label: (data: Recordable) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/label`, data)
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
   * 责任人变更
   * @param data 请求数据
   */
  updateLeader: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateleader`, data)
  },
  /**
   * 使用变更
   * @param data 请求数据
   */
  updateAlter: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatealter`, data)
  },
  /**
   * 折旧调整
   * @param data 请求数据
   */
  updateRenew: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updaterenew`, data)
  },
  /**
   * 附件更新
   * @param data 请求数据
   */
  updateAttach: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateattach`, data)
  },
  /**
   * 停用/启用
   * @param data 请求数据
   */
  updateStoped: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatestoped`, data)
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
