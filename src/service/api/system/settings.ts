import { request } from '@/service/http'

/** 系统设置 */
export default {
  /**
   * 获取设置
   */
  get: () => {
    return request.Get<Service.Result<Recordable>>('system/settings/getsettings')
  },
  /**
   * 保存设置
   * @param data 请求数据
   */
  save: (data: Recordable) => {
    return request.Post<Service.Response>(`system/settings/savesettings`, data)
  },
}
