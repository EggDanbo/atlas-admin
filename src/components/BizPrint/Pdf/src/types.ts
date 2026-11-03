export interface OptionsType {
  /** 标题 */
  title?: string
  /** 名称 */
  name: string
  /** 是否直接打印 */
  direct: boolean
  /** 回调参数 */
  callback: (settingType: Print.Setting, handle: (url: string) => void) => Promise<void>
  // 印或另存后要提交api地址及参数，完整url，为空时不上报
  callbackUrl?: string
}

export interface PrintInst {
  show: (params: OptionsType) => Promise<void>
  close: () => void
}
