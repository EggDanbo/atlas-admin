import { request } from '@/service/http'

export default {
  /** 费用申请单（报销/借款/差旅/招待统一入口） */
  listSearch: (data: Service.SearchCondition) => {
    return request.Post<Service.ResultPage<Recordable>>('expense/claim/list/search', data)
  },
}
