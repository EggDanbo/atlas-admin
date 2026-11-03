import { request } from '@/service/http'

export default {
  /**
   * 获取图形验证码(返回base64字符)
   */
  getImage: () => {
    const method = request.Get<Service.Result<string>>('/verifycode/getimage')
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 呈现图形验证码(返回二进制流)
   */
  renderImage: () => {
    const method = request.Get('/verifycode/renderimage')
    method.meta = {
      withToken: false,
      authRole: null,
      isReturnNativeResponse: true,
    }
    return method
  },
}
