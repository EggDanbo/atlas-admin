import { request } from '@/service/http'

const url = 'staff/info'

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
   * 信息表打印
   * @param id ID
   */
  card: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/card`, {
      params: { id },
    })
  },
  /**
   * 获取人员信息
   * @param data 请求数据
   */
  getInfo: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/getinfo`, {
      params: data,
    })
  },
  /**
   * 获取人员附件
   * @param id ID
   */
  getPdf: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/getpdf`, {
      params: { id },
    })
  },
  /**
   * 获取工资级别表
   * @param data 请求数据
   */
  getScale: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/getscale`, data || {})
  },
  /**
   * 获取人员列表
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
   * 新增
   * @param data 请求数据
   */
  create: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/create`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 修改
   * @param data 请求数据
   */
  update: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/update`, data)
  },
  /**
   * 改名
   * @param data 请求数据
   */
  updateName: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatename`, data)
  },
  /**
   * 调整退休日期
   * @param data 请求数据
   */
  updateDate: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatedate`, data)
  },
  /**
   * 同步用户
   * @param data 请求数据
   */
  sync: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/sync`, data)
  },
  /**
   * 级别调整
   * @param data 请求数据
   */
  updateScale: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/updatescale`, data)
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
