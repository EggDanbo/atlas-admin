import { request } from '@/service/http'

/** 访问日志管理 */
export default {
  /**
   * 日志详情
   * @param id 日志ID
   */
  detail: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`logs/access/detail`, {
      params: { id },
    })
  },
  /**
   * 获取列表
   * @param params 查询参数
   */
  getList: (params: Recordable) => {
    return request.Get<Service.ResultPage<Recordable>>(`logs/access/getlist`, {
      params,
    })
  },
  /**
   * 获取分区列表
   */
  getPartitionList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/access/getpartitionlist`)
  },
  /**
   * 归档
   * @param data 请求数据
   */
  archive: (data: Recordable) => {
    return request.Post<Service.Response>(`logs/access/archive`, data)
  },
  /**
   * 归档列表
   */
  archiveList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/access/archivelist`)
  },
  /**
   * 删除分区
   * @param data 请求数据
   */
  removePartition: (data: Recordable) => {
    return request.Post<Service.Response>(`logs/access/removepartition`, data)
  },
  /**
   * 批量导出JSON
   * @param data 请求数据（含 ids）
   */
  export: (data: Recordable) => {
    return request.Post<Service.Result<string>>(`logs/access/export`, data, { timeout: 1000 * 120 })
  },
}
