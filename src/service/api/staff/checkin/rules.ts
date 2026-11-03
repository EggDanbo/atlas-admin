import { request } from '@/service/http'

const url = 'staff/checkin/rules'

export default {
  /**
   * 获取详细信息
   * @param data 请求数据
   */
  get: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>(`${url}/get`, {
      params: { ...data },
    })
  },
  /**
   * 获取排班信息
   * @param id ID
   */
  getSchedule: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`${url}/schedule/get`, {
      params: { id },
    })
  },
  /**
   * 获取打卡二维码
   * @param data 请求数据
   */
  qrcode: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/qrcode`, data || {})
  },
  /**
   * 获取排班人员信息
   * @param data 请求数据
   */
  getScheduleUser: (data?: Recordable) => {
    return request.Get<Service.Result<Recordable[]>>(`${url}/schedule/user`, {
      params: { ...data },
    })
  },
  /**
   * 获取考勤人员列表
   * @param data 请求数据
   */
  getUserGroupList: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/usergroup/list`, data || {})
  },
  /**
   * 批量获取考勤人员姓名
   * @param data 规则ID集合
   */
  getUserGroupNames: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/usergroup/names`, data || {})
  },
  /**
   * 获取月度打卡统计矩阵
   * @param data 请求数据
   */
  statistics: (data: Recordable) => {
    return request.Post<Service.Result<Recordable>>(`${url}/statistics`, data)
  },
  /**
   * 查询人员
   * @param data 请求数据
   */
  searchUserGroup: (data?: Recordable) => {
    return request.Post<Service.Result<Recordable[]>>(`${url}/usergroup/search`, data || {})
  },
  /**
   * 获取分页列表
   * @param data 请求数据
   */
  search: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>(`${url}/search`, data)
  },
  /**
   * 新增固定上下班
   * @param data 请求数据
   */
  createFixed: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/fixed/create`, data)
  },
  /**
   * 新增自由上下班
   * @param data 请求数据
   */
  createFlexible: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/flexible/create`, data)
  },
  /**
   * 新增班次上下班
   * @param data 请求数据
   */
  createSchedule: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`${url}/schedule/create`, data)
  },
  /**
   * 编辑固定上下班
   * @param data 请求数据
   */
  updateFixed: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/fixed/update`, data)
  },
  /**
   * 编辑自由上下班
   * @param data 请求数据
   */
  updateFlexible: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/flexible/update`, data)
  },
  /**
   * 编辑班次上下班
   * @param data 请求数据
   */
  updateSchedule: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/schedule/update`, data)
  },
  /**
   * 设置排班
   * @param data 请求数据
   */
  setSchedule: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/schedule/set`, data)
  },
  /**
   * 顶班人员新增
   * @param data 请求数据
   */
  addUserGroup: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/usergroup/add`, data)
  },
  /**
   * 顶班人员更新
   * @param data 请求数据
   */
  setUserGroup: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/usergroup/set`, data)
  },
  /**
   * 顶班人员删除
   * @param data 请求数据
   */
  removeUserGroup: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/usergroup/delete`, data)
  },
  /**
   * 删除
   * @param data 请求数据
   */
  delete: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/delete`, data)
  },
  /**
   * 状态设置
   * @param data 请求数据
   */
  statusSet: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/status/set`, data)
  },
  /**
   * 发送统计消息
   */
  sendStat: (data: Recordable) => {
    return request.Post<Service.Response>(`${url}/sendstat`, data)
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
