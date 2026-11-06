import order from './order'
import payable from './payable'
import receipt from './receipt'
import report from './report'
import requestApi from './request'
import supplier from './supplier'

export { order, payable, receipt, report, requestApi as request, supplier }
export default {
  order,
  payable,
  receipt,
  report,
  request: requestApi,
  supplier,
}
