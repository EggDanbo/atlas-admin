/** 文件管理类型 */
export interface FileManagerInst {
  /**
   * 打开模态框
   */
  show: (params: ManagerType) => Promise<void>
}

/** 文件管理类型 */
export interface ManagerType {
  /** (可选)业务关联 */
  xid?: string
  /** 分类 */
  mark?: string
  /** 可否上传 */
  canUpload?: boolean
  /** 可否删除 */
  canRemove?: boolean
}
