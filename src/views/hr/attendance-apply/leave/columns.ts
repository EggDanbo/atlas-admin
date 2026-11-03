import type { TableProps } from '@/components/SpTable'

/** 请假明细列：按天展开，数据来自 leave.getDetail 的 list */
const columns: TableProps['columns'] = [
  { type: 'seq', title: '行号', width: 60, align: 'right' },
  {
    field: 'day',
    title: '请假日期',
    width: 220,
    align: 'left',
    headerAlign: 'center',
  },
  {
    field: 'leave_time_fmt',
    title: '请假时长',
    minWidth: 220,
    align: 'left',
    headerAlign: 'center',
    slots: { default: 'leave_time' },
  },
]

const baseOptions: TableProps = {
  canResize: true,
  resizeMinHeight: 240,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  showToolbar: false,
  pagination: false,
  showFooter: true,
}

/** 编辑态容器（明细本身只读，仅承载列表） */
export const gridOptions = reactive<TableProps>({
  ...baseOptions,
  columns: columns!.map(item => ({ ...item })),
})

/** 查看态 */
export const viewGridOptions = reactive<TableProps>({
  ...baseOptions,
  columns: columns!.map(item => ({ ...item })),
})
