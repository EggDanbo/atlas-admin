import type { TableProps } from '@/components/SpTable'
import { add } from 'xe-utils'
import { isNumber } from '@/utils/is'

const sumObj = ref<any>({
  seq: '合计',
  debit: '-',
  credit: '-',
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
  sumObj.value.debit = sumNums(data, 'debit')
  sumObj.value.credit = sumNums(data, 'credit')
}

export const gridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  resizeHeightOffset: 420,
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
    debit: [{
      validator({ row }) {
        if (!row.debit && !row.credit) {
          return new Error(' ')
        }
      },
    }],
    credit: [{
      validator({ row }) {
        if (!row.debit && !row.credit) {
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
      minWidth: 360,
      field: 'digest',
      title: '凭证摘要',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'digest_edit' },
    },
    {
      minWidth: 240,
      field: 'content_id',
      title: '会计科目',
      align: 'left',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'content_edit', default: 'content_default' },
    },
    {
      width: 160,
      field: 'debit',
      title: '借方金额',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'debit_edit' },
    },
    {
      width: 160,
      field: 'credit',
      title: '贷方金额',
      align: 'right',
      headerAlign: 'center',
      editRender: { autofocus: '.n-input__input-el' },
      slots: { edit: 'credit_edit' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 122,
      align: 'center',
      headerAlign: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  pagination: false,
  showFooter: true,
  footerData: [sumObj.value],
})

export const viewGridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  resizeHeightOffset: 420,
  keepSource: true,
  rowConfig: { isCurrent: true, isHover: false },
  cellConfig: {
    height: 56,
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      minWidth: 360,
      field: 'digest',
      title: '凭证摘要',
      align: 'left',
      headerAlign: 'center',
    },
    {
      minWidth: 240,
      field: 'content_name',
      title: '会计科目',
      align: 'left',
      headerAlign: 'center',
    },
    {
      width: 160,
      field: 'debit',
      title: '借方金额',
      align: 'right',
      headerAlign: 'center',
    },
    {
      width: 160,
      field: 'credit',
      title: '贷方金额',
      align: 'right',
      headerAlign: 'center',
    },
  ],
  pagination: false,
  showFooter: true,
  footerData: [sumObj.value],
})
