import type { TableColumn } from '@/components/SpTable'

export const columns: Array<TableColumn> = [
  { type: 'checkbox', width: 48, align: 'center' },
  {
    type: 'seq',
    title: '序号',
    width: 70,
    resizable: false,
    headerAlign: 'center',
    align: 'right',
  },
  {
    field: 'name',
    title: '名称',
    headerAlign: 'center',
    align: 'left',
    minWidth: 140,
  },
  {
    field: 'kind',
    title: '固定',
    headerAlign: 'center',
    align: 'center',
    width: 80,
    slots: {
      default: ({ row }) => {
        return [row.kind === 1 ? '是' : '否']
      },
    },
  },
  {
    field: 'sort',
    title: '排序',
    headerAlign: 'center',
    align: 'left',
    width: 80,
    slots: { default: 'sort' },
  },
  {
    field: 'ctime',
    title: '创建时间',
    headerAlign: 'center',
    align: 'left',
    width: 175,
  },
  {
    field: 'utime',
    title: '更新时间',
    headerAlign: 'center',
    align: 'left',
    width: 175,
  },
  {
    title: '操作',
    width: 130,
    align: 'center',
    slots: { default: 'operate' },
    fixed: 'right',
  },
]
