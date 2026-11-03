export const basicProps = {
  /** 草稿箱分类 */
  types: {
    type: String,
    default: '',
  },
  /**
   * 数据保存
   */
  save: {
    type: Function as PropType<() => any>,
    default: null,
  },
  /**
   * 数据设置
   */
  get: {
    type: Function as PropType<(data: any) => void>,
    default: null,
  },
  /**
   * 备注
   */
  memo: {
    type: String,
    default: null,
  },
}
