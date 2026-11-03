import type { TableProps } from '@/components/SpTable'

/**
 * 报销明细（付款申请）
 *
 * 每行是一笔报销（摘要 + 费用分类 + 发票 + 金额 + 附件），行下可展开查看
 * 分摊明细（分摊到各单位的金额）。编辑态保留行内增删、复制与上下移，展开区保留分摊明细的增删。
 */
export const gridOptions = reactive<TableProps>({
  canResize: true,
  resizeMinHeight: 260,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: { height: 56 },
  expandConfig: { showIcon: true },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    icon: 'fa fa-file-text-o',
    autoClear: false,
  },
  editRules: {
    digest: [{ required: true, message: '' }],
    content_id: [{ required: true, message: '' }],
    amount: [{ required: true, message: '' }],
  },
  validConfig: { msgMode: 'full' },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    { type: 'expand', title: '', width: 44 },
    {
      field: 'digest',
      title: '摘要',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'digest_edit' },
    },
    {
      field: 'content_id',
      title: '费用分类',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'content_edit', default: 'content_default' },
    },
    {
      field: 'invoice',
      title: '发票',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'invoice_edit', default: 'invoice_default' },
    },
    {
      field: 'amount',
      title: '金额',
      width: 160,
      align: 'right',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'amount_edit' },
    },
    {
      field: 'files',
      title: '附件',
      minWidth: 140,
      align: 'left',
      headerAlign: 'center',
      slots: { edit: 'files_edit', default: 'files_default' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  pagination: false,
  showFooter: true,
})

export const viewGridOptions = reactive<TableProps>({
  canResize: true,
  resizeMinHeight: 260,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: { height: 56 },
  expandConfig: { showIcon: true },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    { type: 'expand', title: '', width: 44 },
    {
      field: 'digest',
      title: '摘要',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'expense_name',
      title: '费用分类',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'invoice',
      title: '发票',
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'invoice_default' },
    },
    {
      field: 'amount',
      title: '金额',
      width: 160,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'files',
      title: '附件',
      minWidth: 140,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'files_default' },
    },
  ],
  pagination: false,
  showFooter: true,
})
