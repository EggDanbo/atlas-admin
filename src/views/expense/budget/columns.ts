import type { TableProps } from '@/components/SpTable'

/**
 * 预算额度明细
 *
 * 每行是「费用分类 + 有效期 + 额度」，金额合计回写到表头的预算总额，
 * 因此编辑态保留了行内增删与排序。
 */
export const gridOptions = reactive<TableProps>({
  canResize: true,
  resizeMinHeight: 260,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: { height: 56 },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
    icon: 'fa fa-file-text-o',
    autoClear: false,
  },
  editRules: {
    content_id: [{ required: true, message: '' }],
    amount: [{ required: true, message: '' }],
  },
  validConfig: { msgMode: 'full' },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      field: 'content_id',
      title: '费用分类',
      minWidth: 260,
      align: 'left',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'content_edit', default: 'content_default' },
    },
    {
      field: 'indate',
      title: '有效期',
      width: 180,
      align: 'left',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'indate_edit', default: 'indate_default' },
    },
    {
      field: 'amount',
      title: '金额',
      width: 180,
      align: 'right',
      headerAlign: 'center',
      editRender: {},
      slots: { edit: 'amount_edit' },
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
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      field: 'content_name',
      title: '费用分类',
      minWidth: 260,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'indate',
      title: '有效期',
      width: 180,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'indate_default' },
    },
    {
      field: 'amount',
      title: '金额',
      width: 180,
      align: 'right',
      headerAlign: 'center',
    },
  ],
  pagination: false,
  showFooter: true,
})
