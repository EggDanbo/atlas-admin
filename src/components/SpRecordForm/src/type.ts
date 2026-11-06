export type RecordFormMode = 'view' | 'create' | 'edit'

export interface RecordFormOpenOptions {
  /** view 只读查看，create 空表单，edit 带原值 */
  opt: RecordFormMode
  /** 编辑/查看时的行数据 */
  row?: Recordable
  /** 覆盖标题，不传按 opt 生成 */
  title?: string
}

export interface RecordFormInst {
  open: (options: RecordFormOpenOptions) => void
  close: () => void
}
