import type { TableColumn } from '@/components/SpTable'

export const columns: Array<TableColumn> = [
  {
    type: 'checkbox',
    width: 48,
    align: 'center',
    resizable: false,
    fixed: 'left',
  },
  {
    type: 'seq',
    title: '序号',
    width: 70,
    resizable: false,
    headerAlign: 'center',
    align: 'right',
    fixed: 'left',
  },
  {
    field: 'name',
    title: '格式名称',
    headerAlign: 'center',
    align: 'left',
    minWidth: 350,
  },
  {
    field: 'user_id',
    title: '用户标识',
    headerAlign: 'center',
    align: 'left',
    minWidth: 150,
  },
  {
    field: 'user_name',
    title: '用户名称',
    headerAlign: 'center',
    align: 'left',
    minWidth: 100,
  },
  {
    field: 'mobile_number',
    title: '手机号码',
    headerAlign: 'center',
    align: 'center',
    minWidth: 120,
  },
  {
    field: 'ctime',
    title: '更新时间',
    headerAlign: 'center',
    align: 'center',
    minWidth: 150,
  },
  {
    title: '操作',
    width: 80,
    align: 'center',
    slots: { default: 'operate' },
    fixed: 'right',
  },
]
