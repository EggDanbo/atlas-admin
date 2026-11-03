import { request } from '@/service/http'

/**
 * 导入结果文件
 *
 * 仅保留「按 ID 取导入结果」这一个方法，供批量导入弹窗下载导入文件使用；
 * 导入日志列表页已移除，故不再提供 search / export / print。
 */
export default {
  /**
   * 获取导入结果（含可下载文件）
   * @param id ID
   */
  get: (id: string) => {
    const method = request.Get<Service.Result<Recordable>>(`logs/import/get`, {
      params: { id },
    })
    method.meta = {
      showErr: false,
    }
    return method
  },
}
