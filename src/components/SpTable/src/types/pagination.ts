export interface PaginationProps {
  /**
   * 当前页码
   */
  page?: number
  /**
   总条数
   */
  pageCount?: number
  /** 分页大小 */
  pageSize?: number
  /**
   * 每页条数
   */
  pageSizes?: number[]
  /**
   * 总条数
   */
  itemCount?: number
  /**
   * 是否显示每页条数的选择器
   */
  showSizePicker?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
}
