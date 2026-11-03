import { request } from '@/service/http'

/** 应用日志管理 */
export default {
  /**
   * 日志详情
   * @param id 日志ID
   */
  detail: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`logs/app/detail`, {
      params: { id },
    })
  },
  /**
   * 获取列表
   * @param params 查询参数
   */
  getList: (params: Recordable) => {
    return request.Get<Service.ResultPage<Recordable>>(`logs/app/getlist`, {
      params,
    })
  },
  /**
   * 获取分区列表
   */
  getPartitionList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/app/getpartitionlist`)
  },
  /**
   * 归档
   * @param data 请求数据
   */
  archive: (data: Recordable) => {
    return request.Post<Service.Response>(`logs/app/archive`, data)
  },
  /**
   * 归档列表
   */
  archiveList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/app/archivelist`)
  },
  /**
   * 删除分区
   * @param data 请求数据
   */
  removePartition: (data: Recordable) => {
    return request.Post<Service.Response>(`logs/app/removepartition`, data)
  },
}
