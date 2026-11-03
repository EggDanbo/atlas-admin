import { request } from '@/service/http'

const url = 'staff/resume'

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
   * 获取编辑的录用信息
   * @param data 请求数据
   */
  entry: (data?: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/entry`, {
      params: { ...data },
    })
  },
  /**
   * 获取待录用列表
   * @param data 请求数据
   */
  list: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/list`, data || {})
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
   * 合规校验
   * @param data 请求数据
   */
  updateStates: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatestates`, data)
  },
  /**
   * 录用信息
   * @param data 请求数据
   */
  updateEntry: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updateentry`, data)
  },
  /**
   * 更新黑名单原因
   * @param data 请求数据
   */
  updateReason: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatereason`, data)
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
