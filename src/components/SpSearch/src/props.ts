export const UserSelectProps = {
  /** 文本组件宽度 */
  width: {
    type: String,
    default: null,
  },
  /** 下内容宽度 */
  contentWidth: {
    type: String,
    default: '100%',
  },
  placeholder: {
    type: String,
    default: '更多筛选条件',
  },
  /** 是否排除单位权限过滤 */
  all: {
    type: [Boolean] as PropType<boolean | null>,
    default: null,
  },
  /** 是否查看停用 */
  stop: {
    type: [Boolean] as PropType<boolean | null>,
    default: null,
  },
  /** 是否多选 */
  multiple: {
    type: Boolean,
    default: false,
  },
  tableRef: {
    type: Object,
    default: null,
  },
}
