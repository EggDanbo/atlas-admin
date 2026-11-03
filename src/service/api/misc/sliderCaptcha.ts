import type { CaptchaData, TrailPoint, VerifyResult } from '@/components/SpSliderCaptcha/src/types'
import { request } from '@/service/http'

export default {
  /**
   * 获取滑块验证码
   */
  create: () => {
    const method = request.Get<Service.Result<CaptchaData>>('/captcha/slider')
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
  /**
   * 验证滑块位置
   * @param key 验证码标识（32位GUID）
   * @param sliderX 滑动距离（像素）
   * @param sliderTime 滑动耗时（毫秒）
   * @param trail 滑动轨迹
   */
  verify: (key: string, sliderX: number, sliderTime: number, trail?: TrailPoint[]) => {
    const method = request.Post<Service.Result<VerifyResult>>('/captcha/slider/verify', {
      key,
      slideX: sliderX,
      slideTime: sliderTime,
      trail,
    })
    method.meta = {
      withToken: false,
      authRole: null,
    }
    return method
  },
}
