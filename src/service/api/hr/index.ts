import { request } from '@/service/http'
import attendance from './attendance'
import dashboard from './dashboard'
import employee from './employee'
import org from './org'
import payroll from './payroll'

/**
 * 兼容旧调用：费用单据的收款人选择器按 id 取员工信息
 * 这类调用只读，等费用模块重做后再评估是否保留
 */
const roster = {
  getInfo: (data: Recordable) => {
    return request.Get<Service.Result<Recordable>>('hr/employee/roster/get', { params: { ...data } })
  },
}

export { attendance, dashboard, employee, org, payroll, roster }
export default {
  attendance,
  dashboard,
  employee,
  org,
  payroll,
  roster,
}
