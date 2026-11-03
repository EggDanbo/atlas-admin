import { request } from '@/service/http'

/** 业务日志管理 */
export default {
  /**
   * 日志详情（含全部关联记录与字段变更）
   * @param id 日志ID
   */
  detail: (id: string) => {
    return request.Get<Service.Result<Recordable>>(`logs/bizlog/detail`, {
      params: { id },
    })
  },
  /**
   * 获取列表
   * @param params 查询参数
   */
  getList: (params: Recordable) => {
    return request.Get<Service.ResultPage<Recordable>>(`logs/bizlog/getlist`, {
      params,
    })
  },
  /**
   * 获取变更记录
   * @param params 查询参数
   */
  getChanges: (params: Recordable) => {
    return request.Get<Service.ResultPage<Recordable>>(`logs/bizlog/getchanges`, {
      params,
    })
  },
  /**
   * 获取日活跃
   */
  getDauList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/getdaulist`)
  },
  /**
   * 获取月活跃
   */
  getMauList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/getmaulist`)
  },
  /**
   * 获取最活跃用户
   */
  getTopDauList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/gettopdaulist`)
  },
  /**
   * 获取业务操作人数
   */
  getBizOptList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/getbizoptlist`)
  },
  /**
   * 获取业务表操作量
   */
  getActiveTableList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/getactivetablelist`)
  },
  /**
   * 获取操作量趋势（近15天）
   */
  getOptTrendList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/getopttrendlist`)
  },
  /**
   * 获取时段分布（近7天按小时）
   */
  getHourDistList: () => {
    return request.Get<Service.Result<Recordable[]>>(`logs/bizlog/active/gethourdistlist`)
  },
}
