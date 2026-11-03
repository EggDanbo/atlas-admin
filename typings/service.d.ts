/** 请求的相关类型 */
declare namespace Service {

  type RequestErrorType = 'Response Error' | 'Business Error' | null
  type RequestCode = string | number

  /** 基础响应接口 */
  interface BaseResponse {
    response?: any
    /** 请求服务的错误类型 */
    errorType: RequestErrorType
    /** 响应编码 */
    code: RequestCode
    /** 消息内容 */
    message: string
    /** 返回的数据 */
    data?: any
  }

  /** 响应结果 */
  interface Response extends BaseResponse {
    /** 请求服务是否成功 */
    isSuccess: boolean
  }

  /** 数据响应结果 */
  interface Result<T = any> extends Response {
    /** 返回的数据 */
    data: T
  }

  /** 高级查询筛选条件 */
  interface Pagination {
    /** 页码从 1 开始，如果设置值小于 1，则实际返回 1 */
    page?: null | number
    /** 获取或设置分页数据行数 */
    pagesize?: null | number
  }

  /** 高级查询筛选条件 */
  interface SearchFilter {
    /** 要筛选的列名或字段名 */
    column?: null | string
    /** 筛选值 */
    value?: null | string
    /** 筛选表达式操作符 */
    express?: null | string
  }

  /** 排序字段 */
  interface SearchOrder {
    /** 列名 */
    column?: null | string
    /** 0:升序 1:降序 */
    value?: number
  }

  /** 高级查询筛选条件 */
  interface SearchCondition extends Pagination {
    /** 索引签名 */
    [key: string]: any
    /** 开启行数返回 */
    totalenabled?: boolean
    /** 打印及导出选中行ID */
    ids?: null | string[]
    /** 模块数据格式 */
    format: null | string
    /** 高级查询筛选条件,空则则表示不进行数据格式处理 */
    searchfilter?: null | SearchFilter[]
    /**  高级排序条件,空则则表示不进行数据格式处理 */
    searchorder?: null | SearchOrder[]
    /** 打印参数(PDF生成时候使用) */
    print_setting?: null | PrintSettingModel[]

  }

  /** 打印设置模型 */
  export interface PrintSettingModel {
    /** 名称 */
    name?: string
    /** 打印机名称 */
    printer?: null | string
    /** 纸张方向; false为纵向 true为横向 */
    paper_direction?: boolean
    /** 纸张类型(描述使用) */
    paper_type?: string
    /** 纸张宽度 */
    paper_width?: number
    /** 纸张高度 */
    paper_height?: number
    /** 是否双页打印，默认false，设为true时如果是左右装订线则换页需要交换左右边距 */
    double_printed?: boolean
    /** 双页打印左边距追加值 */
    double_printed_left?: number
    /** 分组编号 */
    group_seq?: number
    /** 起始页码 */
    page_start?: number
    /** 每页列数 */
    columns?: number
  }

  /** 分页信息 */
  interface Paged {
    /** 获取是否为空数据 如果总数小于等于 0，则为 `true`；否则为 `false` */
    isempty?: boolean
    /** 获取数据总数 所有页的数据总条数 */
    totalcount?: number
    /** 获取当前页码 从 1 开始的页码 */
    page?: number
    /** 获取当前页索引 从 0 开始的页索引 */
    pageindex: number
    /** 获取每页数据行数 每页显示的数据条数 */
    pagesize: number
    /** 获取页总数 所有数据分成的总页数 */
    totalpages?: number
    /** 获取是否有上一页 如果当前页索引大于 0，则为 `true`；否则为 `false` */
    haspreviouspage?: boolean
    /** 获取是否有下一页 如果当前页索引加 1 小于总页数，则为 `true`；否则为 `false` */
    hasnextpage?: boolean
  }

  /** 分页列表模型类 */
  interface PagedList<T = any> extends Paged {
    /** 数据列表 */
    list: T[]
  }

  /** 分页数据响应结果 */
  interface ResultPage<T = any> extends Result<PagedList<T>> {
  }

}
