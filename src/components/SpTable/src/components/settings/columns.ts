import type { TableColumn } from '@/components/SpTable'

export const columns: Array<TableColumn> = [
  {
    field: 'title',
    title: '列名',
    headerAlign: 'center',
    align: 'left',
    dragSort: true,
    slots: { default: 'title' },
  },
  {
    field: 'width',
    title: '宽度',
    headerAlign: 'center',
    align: 'center',
    width: 90,
    slots: { default: 'width' },
  },
  {
    field: 'isview',
    title: '显示',
    headerAlign: 'center',
    align: 'center',
    width: 60,
    slots: { default: 'view' },
  },
  {
    field: 'isprint',
    title: '打印',
    headerAlign: 'center',
    align: 'center',
    width: 60,
    slots: { default: 'print' },
  },
  {
    field: 'fixed1',
    title: '固定',
    headerAlign: 'center',
    align: 'center',
    width: 60,
    slots: { default: 'fixed' },
  },
]
