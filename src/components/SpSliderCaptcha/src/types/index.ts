/**
 * 滑块验证组件类型定义
 */

/**
 * 轨迹点数据结构
 */
export interface TrailPoint {
  /** X 坐标（像素） */
  x: number
  /** Y 坐标（像素） */
  y: number
  /** 相对时间戳（毫秒） */
  t: number
}

/**
 * 后端返回的验证码数据（兼容多种命名风格）
 */
export interface CaptchaDataResponse {
  key?: string
  Key?: string
  id?: string
  Id?: string
  background?: string
  Background?: string
  backgroundimage?: string
  BackgroundImage?: string
  slider?: string
  Slider?: string
  sliderimage?: string
  SliderImage?: string
  y?: number
  Y?: number
  slidery?: number
  SliderY?: number
}

/**
 * 验证码数据（标准化后的内部格式）
 */
export interface CaptchaData {
  /** 背景图（含 data:image/png;base64, 前缀） */
  background: string
  /** 滑块图（含 data:image/png;base64, 前缀） */
  slider: string
  /** 滑块 Y 坐标 */
  y: number
  /** 验证码标识 */
  key: string
}

/**
 * 验证请求参数
 */
export interface VerifyParams {
  /** 验证码标识 */
  key: string
  /** 滑块 X 偏移量 */
  sliderx: number
  /** 滑动耗时（毫秒） */
  slidertime: number
  /** 拖拽轨迹 */
  trail?: TrailPoint[]
}

/**
 * 验证响应结果（API 返回，属性全小写）
 */
export interface VerifyResult {
  /** 是否成功 */
  success: boolean
  /** 验证凭证（成功时返回） */
  verifytoken?: string
  /** 失败原因码（数字或字符串） */
  reason?: number | string
  /** 错误消息 */
  message?: string
}

/**
 * 验证失败原因码
 */
export enum VerifyFailReason {
  /** 未知错误 */
  Unknown = 0,
  /** 验证码不存在 */
  NotFound = 1,
  /** 验证码已过期 */
  Expired = 2,
  /** 滑块位置错误 */
  PositionError = 3,
  /** 轨迹验证失败 */
  TrailError = 4,
  /** 参数错误 */
  ParamError = 5,
  /** 服务异常 */
  ServerError = 6,
  /** 尝试次数过多，已锁定 */
  Locked = 7,
}

/**
 * 组件暴露的方法
 */
export interface SliderCaptchaInst {
  /**
   * 打开验证弹窗并返回 Promise
   * @returns 验证成功返回 verifyToken，失败或取消则 reject
   */
  verify: () => Promise<string>
  /**
   * 关闭弹窗
   */
  close: () => void
}
