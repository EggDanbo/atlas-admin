import { request } from '@/service/http'

export default {
  /**
   * 获取服务器时间戳
   */
  time: () => {
    const method = request.Get<string>('/common/time')
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 获取IP
   */
  getIp: () => {
    const method = request.Get<string>('/common/getip')
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 获取应用配置信息
   */
  appinfo: () => {
    const method = request.Get<Service.Result<AppInfo>>('/common/appinfo')
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 枚举列表
   */
  enums: () => {
    return request.Get<Service.Result<Recordable<SystemEnums>>>('/common/enums')
  },
}
