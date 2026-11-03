import type { Ref } from 'vue'
import type { PrintInst } from '@/components/BizPrint'
import type { OpenModal } from '@/components/SpModal'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'

/**
 * 列表页面 API 接口
 */
export interface UseListPageApi<
  Q extends Service.SearchCondition = Service.SearchCondition,
  T extends Recordable = Recordable,
> {
  /** 搜索/列表查询 */
  search: (params: Q) => Promise<Service.ResultPage<T>> | Promise<Service.Result<T[]>>
  /** 导出 Excel（可选） */
  export?: (params: Q) => Promise<Service.Result<string>>
  /** 打印（可选） */
  print?: (params: Q) => Promise<Service.Result<string>>
}

/**
 * 列表页面 Hook 配置选项
 * @template Q 查询模型类型（需继承 Service.SearchCondition）
 * @template T 行数据类型
 */
export interface UseListPageOptions<
  Q extends Service.SearchCondition = Service.SearchCondition,
  T extends Recordable = Recordable,
> {
  /** API 服务对象 */
  api: UseListPageApi<Q, T>
  /** 详情组件 ref（无详情页时可省略） */
  detailRef?: Ref<OpenModal | null>
  /** 查询模型工厂函数 */
  createQueryModel: () => Q
  /** 表格列配置 */
  columns?: TableColumn[]
  /** ID 字段名，支持嵌套路径如 'role.id'，默认 'id' */
  idField?: string
  /** 自定义行样式 */
  rowClassName?: (data: { row: T }) => string | null
  /** 自定单元格样式 */
  cellClassName?: (data: { row: T, column: TableColumn }) => string | null
  /** 查询/导出/打印请求前的参数处理（三个出口统一生效） */
  beforeFetch?: (params: Q) => Q
  /** 自定义 gridOptions 配置（会覆盖默认配置） */
  gridOptions?: Partial<TableProps>
  /** 自定义编辑处理（覆盖默认 handleEdit） */
  customHandleEdit?: (action: string, row?: T, extra?: Recordable) => void
}

/**
 * 列表页面 Hook 返回值
 * @template Q 查询模型类型
 * @template T 行数据类型
 */
export interface UseListPageReturn<
  Q extends Service.SearchCondition = Service.SearchCondition,
  T extends Recordable = Recordable,
> {
  // === Refs ===
  /** 表格组件引用 */
  tableRef: Ref<TableInstance>
  /** 页面加载状态 */
  pageLoading: Ref<boolean>
  /** 打印设置组件引用 */
  pdfSettingRef: Ref<PrintInst | null>
  /** 查询模型（响应式，保留自定义属性类型） */
  queryModel: Q
  /** 表格配置 */
  gridOptions: TableProps

  // === 权限 ===
  /** Tab 权限名称 */
  tabPermName: Ref<string | undefined>
  /** 新增权限 */
  hasPermAdd: boolean
  /** 编辑权限 */
  hasPermEdit: boolean
  /** 删除权限 */
  hasPermDele: boolean
  /** 导出权限 */
  hasPermExport: boolean
  /** 打印权限 */
  hasPermPrint: boolean

  // === 方法 ===
  /** 编辑操作回调（新增后 search，编辑后 refresh） */
  editAction: (action: string) => Promise<void>
  /** 处理新增/查看/编辑操作 */
  handleEdit: (action: string, row?: T, extra?: Recordable) => void
  /** 直接打开详情弹窗（支持自定义参数） */
  openDetail: (params?: Recordable) => void
  /** 处理导出/打印（含选中确认逻辑） */
  handleExportOrPrint: (key: string, rows: T[]) => Promise<void>
  /** 刷新表格 */
  refresh: () => void
  /** 获取行 ID（支持嵌套路径） */
  getId: (row: T) => string
}
