import type { TableProps } from '@/components/SpTable'

/** 加班明细列：加班日期（含日期类型）+ 加班时长，数据来自 overtime.getDetail 的 list */
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

export const gridOptions = reactive<TableProps>({
  ...baseOptions,
  cellConfig: { height: 56 },
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    showStatus: true,
    autoClear: false,
  },
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      field: 'day',
      title: '加班日期',
      width: 240,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'day_default' },
    },
    {
      field: 'over_time',
      title: '加班时长（小时）',
      minWidth: 200,
      align: 'right',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'over_time_edit' },
    },
  ],
})

export const viewGridOptions = reactive<TableProps>({
  ...baseOptions,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      field: 'day',
      title: '加班日期',
      width: 240,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'day_default' },
    },
    {
      field: 'over_time',
      title: '加班时长（小时）',
      minWidth: 200,
      align: 'right',
      headerAlign: 'center',
    },
  ],
})
