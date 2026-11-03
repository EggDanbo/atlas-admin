import type { VxeGridProps, VxeTableDefines, VxeTableInstance } from 'vxe-table'
import type { PaginationProps } from './pagination'

export interface FetchSetting {
  /**
   * 请求接口当前页数
   */
  pageField: string
  /**
   * 每页显示多少条
   */
  sizeField: string
  /**
   * 请求结果列表字段
   */
  listField: string
  /**
   * 接口返回总页数字段名
   */
  pagesField: string
  /**
   * 请求结果总数字段
   */
  totalField: string
}

export interface SumFilterRow {
  /**
   * 过滤的字段
   */
  field: string
  /**
   * 过滤的值
   */
  value: any
}

/**
 * 表格组件列定义
 */
export interface TableColumn extends VxeTableDefines.ColumnOptions {
  /**
   * 权限编码控制是否显示
   */
  auth?: string[]
  /**
   * 业务控制是否显示
   */
  ifShow?: ((column: TableColumn) => boolean) | boolean
  /**
   * 是否操作列
   */
  isOperate?: boolean
  /**
   * 是否打印
   */
  isPrint?: boolean

  depth?: number
}

/**
 * 表格属性定义
 */
export interface TableProps extends VxeGridProps {
  /**
   * 标题
   */
  title?: string
  /**
   * 网格工具提示
   */
  titleTooltip?: string
  /**
   * 表格格式
   */
  dataFormat?: string | null | undefined
  /**
   * 表格数据源
   */
  dataSource?: any | Recordable[]
  /**
   * 是否远程排序
   */
  remoteSort?: boolean
  /**
   * 立即请求接口
   */
  immediate?: boolean
  /**
   * 显示刷新按钮
   */
  showReload?: boolean
  /**
   * 接口请求对象
   */
  fetchData?: (...arg: any) => Promise<any>
  /**
   * 重置操作
   */
  resetData?: () => void
  /**
   * 是否显示查询按钮
   */
  showQueryBtn?: boolean
  /**
   * 是否显示重置按钮
   */
  showResetBtn?: boolean
  /**
   * 请求接口配置
   */
  fetchSetting?: Partial<FetchSetting>
  /**
   * 列配置
   */
  columns?: TableColumn[]
  /**
   * 分页配置
   */
  pagination?: boolean | PaginationProps
  /**
   * 是否可以自适应高度
   */
  canResize?: boolean
  /**
   * 自适应高度偏移， 计算结果-偏移量
   */
  resizeHeightOffset?: number
  /**
   * 自适应最小高度， 计算结果低于该值时使用该值
   */
  resizeMinHeight?: number
  /**
   * 弹窗内自适应：以弹窗内容区底部为下边界（代替视口底部），
   * 无需resizeHeightOffset补偿footer和视口间距，且不受弹窗打开动画影响。
   * 网格下方同容器的元素会被自动扣除占用高度
   */
  fitContainer?: boolean
  /**
   * 合计显示的标签
   */
  sumLabel?: string
  /**
   * 合计显示的标签位置
   */
  sumIndex?: number
  /**
   * 合计行过滤
   */
  sumFilterRow?: SumFilterRow
  /**
   * 显示工具栏
   */
  showToolbar?: boolean
  /**
   * 显示工具栏右侧
   */
  showToolbarRight?: boolean
  /**
   * 分页模式
   */
  showPageMode?: boolean
  /**
   * 禁用列设置
   */
  settingDisabled?: boolean
  /**
   * 禁用高级查询
   */
  advSearchDisabled?: boolean
  /**
   * 禁用列拖动
   */
  columnDropDisabled?: boolean
  /**
   * 禁用列宽度调整
   */
  resizableDisabled?: boolean
  /**
   * 禁用序号
   */
  seqDisabled?: boolean
  /**
   * 禁用checkbox
   */
  checkboxDisabled?: boolean

  /**
   * 禁用筛选组件
   */
  filterDisabled?: boolean
  /**
   * 筛选模式：footer(底部) | floating(浮动)
   * @default 'floating'
   */
  filterMode?: 'footer' | 'floating'
  /**
   * 显示筛选模式切换按钮
   * @default true
   */
  showFilterMode?: boolean
  /**
   * 表格高度
   */
  height?: number
  /**
   * 数据格式加载完成回调
   */
  loadDataFmtAfter?: (data: any) => void
}

export interface AdvSearchFilter {
  column: string
  express: string
  value: string
  format: string
}

export interface AdvSearchFilterValue {
  name: null | string
  label: null | string
  value: any
}

export interface FetchParams {
  page?: number
  reset?: boolean
  searchFilter?: AdvSearchFilter[]
  searchOrder?: Recordable[]
  scrollMode?: boolean
}

/** 数据格式 */
export interface GridFormat {
  /** 列名 */
  column: string
  /** 列标题 */
  title: string
  /** 合并列 */
  hcolumn: string
  /** 对齐方式 */
  align: 'left' | 'center' | 'right' | '' | null | undefined
  /** 宽度 */
  width: number
  /** text，number，money，bool，tree，date，time，datetime，numberlist，numberlistinvalue，textlist，textlistinvalue，dict，dictinvalue，enums */
  type: string
  /** 是否高级查询 */
  search: string
  /** 禁用筛选 */
  disablefilter: string
  /** 固定列方式：left、right、空表示不固定 */
  fixed: 'left' | 'right' | null | undefined
  /** 内容显示格式如金额(金额为0时不显示，显示-，或按格式显示)、日期显示格式，布尔型显示内容 */
  format: string
  /** 枚举系统关键字 */
  enums: string | null | undefined
  /** 枚举值使用字段：label、name、value；仅 type=enums 时生效，默认 value */
  enumstype?: 'label' | 'value' | 'name' | null
  /**  是否开启高级查询(默认开启) */
  isfilter: boolean
  /** 浏览是否显示 */
  isview: boolean
  /** 打印是否显示 */
  isprint: boolean
  /** 列是否纵向合并 */
  ismerge: boolean
  /** 合并列关联 */
  mergecompare?: string
  /** 列是否合计 */
  istotal: string
  /** 排序 */
  sortable: boolean

}

export interface DataFormatColumn extends GridFormat {
  filter_express: null | string
  filter_value: any
}

export interface AdvSearchComponentCond {
  hasCondType: (dval: string) => boolean
  hasTextType: (dval: string) => boolean
  hasNumberType: (dval: string) => boolean

  getCondTypeList: (type: string) => any[]
  getCondBool: (item: DataFormatColumn) => any[]
  getCondList: (item: DataFormatColumn, useIndexOrValue: boolean) => any[]
  getCondListInValue: (item: DataFormatColumn) => any[]
  getDateType: (item: DataFormatColumn) => any
}

export interface AdvSearchInstance {
  componentCond: AdvSearchComponentCond
  /**
   * 加载网格格式
   */
  loadFormat: (data: DataFormatColumn[]) => void
  /**
   * 更新高级条件内容
   */
  update: () => void
  /**
   * 清空
   */
  clear: () => void
  /**
   * 空高级条件内容(真实请求过滤内容)
   */
  clearFilter: () => void
  /**
   * 重置高级筛选条件(可视化显示)
   */
  resetFilter: () => void
  /**
   * 获取筛选条件
   */
  getFilter: () => AdvSearchFilter[]

  filterRef: Ref<AdvSearchFilterValue>

  columnsRef: Ref<Array<DataFormatColumn>>
}

export interface TableInstance {
  table: Ref<VxeTableInstance>
  /** 查询 */
  search: () => Promise<void>
  /** 加载数据并恢复到初始状态 */
  reload: () => void
  /** 清空高级条件重新加载数据 */
  reloadData: () => Promise<void>
  /** 远程请求数据加载 */
  fetch: (opt?: FetchParams) => Promise<Recordable<any>[] | undefined>
  /** 刷新 */
  refresh: () => Promise<void>
  /** 清空数据 */
  clear: () => void
  getData: () => Recordable[]
  getDataSource: () => Recordable[]
  setData: (data: Recordable[]) => void
  redoHeight: () => void
  recalculate: () => void
  getColumns: () => TableColumn[]
  setColumns: (columnList: TableColumn[]) => void
  buildColumn: (data: DataFormatColumn[]) => void
  loadFormat: (data: DataFormatColumn[] | undefined) => Promise<void>
  getDeviceHeight: ComputedRef<string>
  getSearchFilter: () => AdvSearchFilter[]
  getSearchOrder: () => Recordable[]
  getCheckboxRows: () => Recordable[]
  clearCheckBox: () => void
  insert: (record: any) => Promise<void>
  removeCheckboxRow: () => Promise<any>
  editRowEvent: (row: any) => void
  remove: (row: any) => void
  getLoading: boolean
  setLoading: (val: boolean) => void
  getDataFmt: (column: string) => DataFormatColumn | undefined
  getDataFmtList: () => DataFormatColumn[]
  advSearch: AdvSearchInstance
}

export interface TableActionType {
  fetch: (opt?: FetchParams) => Promise<Recordable<any> | undefined>
  buildColumn: (data: DataFormatColumn[]) => void
  resetColumn: () => void
  saveDataFmt: (columns: DataFormatColumn[]) => Promise<Service.Response>
  resetDataFmt: () => Promise<Service.Response>
  getDataFmtList: () => DataFormatColumn[]
  clear: () => void
  reloadData: () => void
  advSearch: AdvSearchInstance
}
