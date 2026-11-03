import type { PaginationProps } from './types/pagination'
import type { SumFilterRow, TableColumn } from './types/table'
import { VxeGrid } from 'vxe-table'

export const dataTableProps = {
  ...VxeGrid.props,
  /**
   * 标题
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * 网格工具提示
   */
  titleTooltip: {
    type: String,
    default: null,
  },
  /**
   * 表格格式
   */
  dataFormat: {
    type: String,
    default: null,
  },
  /**
   * 表格数据源
   */
  dataSource: {
    type: Array as PropType<Recordable[]>,
    default: () => [],
  },
  /**
   * 列配置
   */
  columns: {
    type: Array as PropType<TableColumn[]>,
    default: () => [],
  },
  /**
   * 是否远程排序
   */
  remoteSort: {
    type: Boolean,
    default: true,
  },
  /**
   * 立即请求接口
   */
  immediate: {
    type: Boolean,
    default: true,
  },
  /**
   * 显示刷新按钮
   */
  showReload: {
    type: Boolean,
    default: false,
  },
  /**
   * 接口请求对象
   */
  fetchData: {
    type: Function as PropType<(...arg: any[]) => Promise<any>>,
    default: null,
  },
  /**
   * 重置操作
   */
  resetData: {
    type: Function as PropType<() => void>,
    default: null,
  },
  /**
   * 是否显示查询按钮
   */
  showQueryBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否显示重置按钮
   */
  showResetBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 分页配置
   */
  pagination: {
    type: [Object, Boolean] as PropType<boolean | PaginationProps>,
    default: null,
  },
  /**
   * 是否可以自适应高度
   */
  canResize: {
    type: Boolean,
    default: true,
  },
  /**
   * 自适应高度偏移， 计算结果-偏移量
   */
  resizeHeightOffset: {
    type: Number,
    default: 0,
  },
  /**
   * 自适应最小高度， 计算结果低于该值时使用该值
   */
  resizeMinHeight: {
    type: Number,
    default: 400,
  },
  /**
   * 弹窗内自适应：以表格所在弹窗内容区(.vxe-modal--body)的底部为下边界（代替视口底部），
   * 无需resizeHeightOffset补偿footer和视口间距，且不受弹窗打开动画影响。
   * 网格下方同一容器的其他元素（如辅助核算表单）会被自动扣除占用高度
   */
  fitContainer: {
    type: Boolean,
    default: false,
  },
  /**
   * 合计显示的标签
   */
  sumLabel: {
    type: String,
    default: '合计',
  },
  /**
   * 合计显示的标签位置
   */
  sumIndex: {
    type: Number,
    default: 1,
  },
  /**
   * 合计行过滤
   */
  sumFilterRow: {
    type: Object as PropType<SumFilterRow>,
    default: () => {
      return { field: 'id', value: '0' }
    },
  },
  /**
   * 显示工具栏
   */
  showToolbar: {
    type: Boolean,
    default: true,
  },
  /**
   * 显示工具栏右侧
   */
  showToolbarRight: {
    type: Boolean,
    default: true,
  },
  /**
   * 分页模式
   */
  showPageMode: {
    type: Boolean,
    default: true,
  },
  /**
   * 禁用高级查询
   */
  advSearchDisabled: {
    type: Boolean,
    default: true,
  },
  /**
   * 禁用列设置
   */
  settingDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 禁用列拖动
   */
  columnDropDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 禁用列宽度调整
   */
  resizableDisabled: {
    type: Boolean,
    default: false,
  },

  /**
   * 禁用序号
   */
  seqDisabled: {
    type: Boolean,
    default: false,
  },

  /**
   * 禁用checkbox
   */
  checkboxDisabled: {
    type: Boolean,
    default: false,
  },

  /**
   * 禁用筛选组件
   */
  filterDisabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 筛选模式：footer(底部) | floating(浮动)
   */
  filterMode: {
    type: String as PropType<'footer' | 'floating'>,
    default: 'floating',
  },
  /**
   * 显示筛选模式切换按钮
   */
  showFilterMode: {
    type: Boolean,
    default: true,
  },
  /**
   * 数据加载完成回调
   */
  loadDataFmtAfter: {
    type: Function as PropType<(data: any[]) => void>,
    default: null,
  },
}
