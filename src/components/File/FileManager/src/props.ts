export const basicProps = {
  title: {
    type: String,
    default: '文件管理',
  },
  // one单选插入 many多选插入，空不处理
  type: {
    type: String,
    default: '',
  },
  // 遮罩
  mask: {
    type: Boolean,
    default: false,
  },
  // 文件大小限制，单位:MB，0为不限制
  maxSize: {
    type: Number as PropType<number>,
    default: 0,
  },
}
