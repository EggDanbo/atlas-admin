import { request } from '@/service/http'

const url = 'hr/payroll/group/item'
const groupUrl = 'hr/payroll/group'

export default {
  /**
   * 获取工资项目字段列表(用于公式编辑器)
   * @param data 请求数据
   */
  searchFields: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/search/fields`, data || {})
  },
  /**
   * 获取可用项目列表
   * @param data 请求数据
   */
  searchItem: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/search/item`, data || {})
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
   * 复制上月项目
   * @param data 请求数据
   */
  copy: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/copy`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 更新排序
   * @param data 请求数据
   */
  updateSort: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatesort`, data)
  },
  /**
   * 更新工资项公式
   * @param data 请求数据
   */
  updateFormula: (data: Recordable) => {
    return request.Post<Service.Response>(`${groupUrl}/updateformula`, data)
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
