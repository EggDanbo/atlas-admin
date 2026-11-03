import { request } from '@/service/http'

/**
 * 获取详细信息
 * @param data 请求数据
 */
export function log(data: Recordable) {
  return request.Get<Service.Result<Recordable>>(`/common/log`, {
    params: { ...data },
  })
}

/**
 * 催办提醒
 * @param data 请求数据
 */
export function alert(data: Recordable) {
  return request.Post<Service.ResultPage<Recordable>>(`/common/alert`, data)
}

export default {
  log,
  alert,
}
