import { request } from '@/service/http'

/** 单位信息 */
export default {
  /**
   * 获取树状选择
   * @param data 请求数据
   */
  tree: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`access/unit/tree`, data || {})
  },
  /**
   * 获取详细信息
   * @param id ID
   */
  get: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`access/unit/get`, {
      params: { id },
    })
  },
  /**
   * 获取多租户列表
   */
  getTenantList: () => {
    return request.Get<Service.Result<Recordable>>(`access/unit/tenant/list`)
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`access/unit/search`, data)
  },
  /**
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`access/unit/create`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`access/unit/update`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`access/unit/delete`, data)
  },
  /**
   * 设为成本中心
   * @param data 请求数据
   */
  updateAlone: (data: Recordable) => {
    return request.Post<Service.Response>(`access/unit/updatealone`, data)
  },
  /**
   * 停用/启用
   * @param data 请求数据
   */
  updateStoped: (data: Recordable) => {
    return request.Post<Service.Response>(`access/unit/updatestoped`, data)
  },
  /**
   * 结构重算
   * @param data 请求数据
   * @param data.from_code 按编码前缀重新分级（历史数据修复，存在按上级创建的单位时禁用）；false=仅修复路径
   */
  rebuild: (data: { from_code: boolean }) => {
    return request.Post<Service.Response>(`access/unit/rebuild`, data)
  },
  /**
   * 导出Excel
   * @param data 请求数据
   */
  export: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`access/unit/export`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 打印
   * @param data 请求数据
   */
  print: (data: Service.SearchCondition) => {
    return request.Post<Service.Result<string>>(`access/unit/print`, data, { timeout: 1000 * 60 * 2 })
  },
  /**
   * 批量导入
   * @param data 请求数据
   */
  batchImport: (data: Recordable) => {
    const method = request.Post<Service.Response>(`access/unit/createbatchimport`, data, { timeout: 1000 * 60 * 2 })
    method.meta = {
      showErr: false,
    }
    return method
  },
}
