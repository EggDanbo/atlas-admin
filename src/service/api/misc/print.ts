import { request } from '@/service/http'

export default {
  /**
   * 获取打印纸张
   */
  getPages: () => {
    return request.Get<Service.Result<Print.PdfPageSize[]>>('pdfprint/getpages')
  },
  /**
   * 获取打印设置
   */
  getSetting: (name: string) => {
    return request.Get<Service.Result<Print.Setting>>('pdfprint/getsetting', {
      params: {
        name,
      },
    })
  },
  /**
   * 保存打印设置
   */
  saveSetting: (data: Print.Setting) => {
    return request.Post<Service.Response>('pdfprint/savesetting', data)
  },
}
