import type { GridFormat } from '@/components/SpTable'
import { request } from '@/service/http'

/** 数据格式 */
export default {
  /**
   * 获取数据格式
   * @param name 数据格式名称
   * @returns 请求方法对象
   */
  get: (name: string) => {
    return request.Get<Service.Result<GridFormat[]>>(`dataformat/get`, {
      params: { name },
    })
  },
  /**
   * 数据格式保存
   * @param data
   */
  save: (data: Recordable) => {
    return request.Post<Service.Response>(`dataformat/save`, data)
  },
  /**
   * 删除用户自定义格式
   * @param data
   */
  remove: (data: Recordable) => {
    return request.Post<Service.Response>(`dataformat/remove`, data)
  },
  /**
   * 获取所有类型
   */
  getNames: () => {
    return request.Get<Service.Result<string[]>>(`dataformat/getnames`)
  },
  /**
   * 获取用户自定义网格设置
   */
  getUserGrid: (userid: string, name: string) => {
    return request.Get<Service.Result<Recordable>>(`dataformat/getusergrid`, {
      params: { userid, name },
    })
  },
  /**
   * 查询用户定义格式
   */
  getUserGridList: (data: Recordable) => {
    return request.Post<Service.Result<Recordable>>(`dataformat/getusergridlist`, data)
  },
  /**
   * 更新自定义网格设置
   */
  updateUserGrid: (data: Recordable) => {
    return request.Post<Service.Response>(`dataformat/updateusergrid`, data)
  },
  /**
   * 删除自定义网格设置
   */
  deleteUserGrid: (data: Recordable) => {
    return request.Post<Service.Response>(`dataformat/deleteusergrid`, data)
  },
}
