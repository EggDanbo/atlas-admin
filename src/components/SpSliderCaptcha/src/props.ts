import type { ExtractPublicPropTypes } from 'vue'

export const sliderCaptchaProps = {
  /** 验证区域宽度（px） */
  width: {
    type: Number,
    default: 300,
  },
  /** 验证区域高度（px） */
  height: {
    type: Number,
    default: 200,
  },
  /** 滑块宽度（px，需与后端 SliderWidth 一致） */
  sliderWidth: {
    type: Number,
    default: 58,
  },
  /** 凸起半径（px，需与后端 ProtrusionRadius 一致） */
  protrusionRadius: {
    type: Number,
    default: 12,
  },
  /** 拖拽手柄尺寸（px） */
  handleSize: {
    type: Number,
    default: 40,
  },
  /** 验证码过期时间（秒） */
  captchaExpiration: {
    type: Number,
    default: 120,
  },
  /** 验证成功后自动关闭 */
  autoClose: {
    type: Boolean,
    default: true,
  },
  /** 成功后延迟关闭时间（毫秒） */
  successDuration: {
    type: Number,
    default: 1500,
  },
  /** 弹窗标题 */
  title: {
    type: String,
    default: '安全验证',
  },
  /** 轨迹点最大采集数量（需与后端限制一致） */
  maxTrailPoints: {
    type: Number,
    default: 100,
  },
}

export type SliderCaptchaProps = ExtractPublicPropTypes<typeof sliderCaptchaProps>
