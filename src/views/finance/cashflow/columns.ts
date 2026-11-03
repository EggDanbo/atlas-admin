import type { TableProps } from '@/components/SpTable'
import { add } from 'xe-utils'
import { isNumber } from '@/utils/is'

const sumObj = ref<any>({
  seq: '合计',
  amount: '-',
})

function sumNums(list: any, name: string) {
  const formatter = new Intl.NumberFormat('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  let count = 0
  list.forEach((items) => {
    const nums = isNumber(items[name]) ? items[name] : String(items[name]).split(',').join('')
    if (nums && Number(nums) !== 0) {
      count = add(count, Number(nums))
    }
    else {
      count = add(count, 0)
    }
  })

  return Number(count) === 0 || Number.isNaN(count) ? '-' : formatter.format(count)
}

export function updateDataTableCount(data) {
  sumObj.value.amount = sumNums(data, 'amount')
}

export const gridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: {
    height: 56,
  },
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
    amount: [{
      validator({ row }) {
        if (!row.amount && !row.amount) {
          return new Error(' ')
        }
      },
    }],
  },
  validConfig: {
    msgMode: 'full',
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      minWidth: 300,
      field: 'digest',
      title: '凭证摘要',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 120,
      field: 'debit_credit',
      title: '金额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 320,
      field: 'content_name',
      title: '会计科目',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 160,
      field: 'amount',
      title: '分配金额',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'amount_edit' },
    },
    {
      minWidth: 200,
      field: 'cash_dir_id',
      title: '主表项目',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'cash_dir_edit', default: 'cash_dir_default' },
    },
    {
      minWidth: 200,
      field: 'cash_sub_id',
      title: '附表项目',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'cash_sub_edit', default: 'cash_sub_default' },
    },
  ],
  pagination: false,
  showFooter: true,
  footerData: [sumObj.value],
})

export const viewGridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: {
    height: 56,
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      minWidth: 300,
      field: 'digest',
      title: '凭证摘要',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 120,
      field: 'debit_credit',
      title: '金额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 320,
      field: 'content_name',
      title: '会计科目',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 120,
      field: 'amount',
      title: '分配金额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      minWidth: 200,
      field: 'cash_dir_name',
      title: '主表项目',
      align: 'left',
      headerAlign: 'center',
    },
    {
      minWidth: 200,
      field: 'cash_sub_name',
      title: '附表项目',
      align: 'left',
      headerAlign: 'center',
    },
  ],
  pagination: false,
  showFooter: true,
  footerData: [sumObj.value],
})
