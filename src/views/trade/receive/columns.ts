import type { TableProps } from '@/components/SpTable'

export const gridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 50, align: 'right' },
    {
      minWidth: 200,
      field: 'invoice_no',
      title: '发票号码',
      align: 'left',
      headerAlign: 'center',
    },
    {
      minWidth: 240,
      field: 'outer_name',
      title: '客户名称',
      align: 'left',
      headerAlign: 'center',
    },
    {
      minWidth: 220,
      field: 'team_name',
      title: '分摊单位',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 180,
      field: 'amount',
      title: '分摊金额',
      align: 'right',
      headerAlign: 'center',
    },
  ],
  pagination: false,
  showFooter: true,
})
