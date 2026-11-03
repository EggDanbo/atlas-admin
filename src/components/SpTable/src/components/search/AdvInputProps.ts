export const AdvInputProps = {
  placeholder: {
    type: String,
    default: '筛选',
  },
  advSearch: {
    type: Object,
    default: null,
  },
  value: {
    type: Object,
    default: () => ({}),
  },
  /** 浮动筛选选项（VXE Table 传入） */
  floatingOption: {
    type: Object as PropType<{ data: any }>,
    default: null,
  },
}
