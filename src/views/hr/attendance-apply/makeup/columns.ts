import type { TableProps } from '@/components/SpTable'

/** 补卡明细列：补卡日期与补卡时间，数据来自 makeup.getDetail */
const columns: TableProps['columns'] = [
  { type: 'seq', title: '行号', width: 60, align: 'right' },
  {
    field: 'day',
    title: '补卡日期',
    width: 220,
    align: 'left',
    headerAlign: 'center',
  },
  {
    field: 'checkin_time',
    title: '补卡时间',
    width: 200,
    align: 'left',
    headerAlign: 'center',
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: 300,
    align: 'left',
    headerAlign: 'center',
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

/** 编辑态容器（明细只读） */
export const gridOptions = reactive<TableProps>({
  ...baseOptions,
  columns: columns!.map(item => ({ ...item })),
})

export const viewGridOptions = reactive<TableProps>({
  ...baseOptions,
  columns: columns!.map(item => ({ ...item })),
})
