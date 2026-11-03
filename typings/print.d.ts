declare namespace Print {

  /** PDF纸张大小 */
  interface PdfPageSize {
    /** 纸张名称 */
    name: string
    /** 纸张宽度，单位毫米 */
    width: number
    /** 纸张高度，单位毫米 */
    height: number
  }

  /** 打印设置 */
  interface Setting {
    /** 名称 */
    name: string
    /** 打印机名称 */
    printer: string
    /** 纸张方向 */
    paper_direction: boolean
    /** 纸张类型 */
    paper_type: string
    /** 纸张宽度 */
    paper_width: number
    /** 纸张高度 */
    paper_height: number
    /** 是否双页打印 */
    double_printed: boolean
    /** 双页打印左边距追加值 */
    double_printed_left: number
    /** 自动编号 */
    group_seq: boolean
    /** 起始页码 */
    page_start: number
    /** 每页列数 */
    columns: number
  }
}
