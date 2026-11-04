import type { DataFormatColumn, TableColumn } from './types/table'
import { format, isValid, parse } from 'date-fns'
import { dictLabel, hasDict, normalizeDictType } from '@/dicts'

import fmtMoney from '@/utils/fmtMoney'
import { isNumber } from '@/utils/is'

// 格式化内容
export function formatter(col: TableColumn, dataFmt: DataFormatColumn) {
  const type = dataFmt.type
  switch (type) {
    case 'bool': {
      boolFormatter(col, dataFmt)
      break
    }
    case 'date':
    case 'datetime':
    case 'time':
    case 'timestamp': {
      dateFormatter(col, dataFmt)
      break
    }
    case 'money': {
      moneyFormatter(col, dataFmt)
      break
    }
    case 'number': {
      numberFormatter(col)
      break
    }
    case 'numberlistinvalue':
    case 'textlistinvalue': {
      listFormatter(col, dataFmt)
      break
    }
    case 'enums': {
      enumFormatter(col, dataFmt)
      break
    }
  }
}

export function formatValue(cellValue: any, dataFmt: DataFormatColumn | undefined) {
  if (!dataFmt)
    return cellValue
  const type = dataFmt.type
  switch (type) {
    case 'bool': {
      return boolFormatVal(cellValue, dataFmt)
    }
    case 'date':
    case 'datetime':
    case 'time':
    case 'timestamp': {
      return dateFormatVal(cellValue, dataFmt)
    }
    case 'money': {
      return moneyFormatVal(cellValue, dataFmt)
    }
    case 'number': {
      return numberFormatVal(cellValue, dataFmt)
    }
    case 'numberlistinvalue':
    case 'textlistinvalue': {
      return listFormatVal(cellValue, dataFmt)
    }
    case 'enums': {
      return enumFormatVal(cellValue, dataFmt)
    }
  }
  return cellValue
}

// 整型格式化
function numberFormatter(col: TableColumn) {
  col.formatter = ({ cellValue }) => {
    if (cellValue === 0) {
      return '-'
    }
    return cellValue
  }
}

function numberFormatVal(cellValue: any, _: DataFormatColumn) {
  if (cellValue === 0) {
    return '-'
  }
  return cellValue
}

// 真假格式化
function boolFormatter(col: TableColumn, dataFmt: DataFormatColumn) {
  if (!dataFmt.format) {
    return
  }
  const segment = dataFmt.format.split(';')
  if (segment.length < 2) {
    return
  }

  col.formatter = ({ cellValue }): string => {
    return cellValue === true || cellValue === 'true' || cellValue === 'True' || cellValue === '1'
      ? segment[0] || ''
      : segment[1] || ''
  }
}

function boolFormatVal(cellValue: any, dataFmt: DataFormatColumn) {
  if (!dataFmt.format) {
    return cellValue
  }
  const segment = dataFmt.format.split(';')
  if (segment.length < 2) {
    return cellValue
  }

  return cellValue === true || cellValue === 'true' || cellValue === 'True' || cellValue === '1'
    ? segment[0]
    : segment[1]
}

function listFormatter(col: TableColumn, dataFmt: DataFormatColumn) {
  const { format, enums } = dataFmt

  if (format) {
  // eg 保0:保密,1:男,2:女
    const segment = dataFmt.format.split(',')
    if (segment.length === 0) {
      return
    }

    const kv = {}
    for (const item of segment) {
      const seg = item.split(':')
      kv[seg[0] || ''] = seg[1]
    }

    col.formatter = ({ cellValue }) => kv[cellValue] || ''
  }
  else if (enums) {
    col.formatter = ({ cellValue }) => dictLabel(enums, cellValue) || ''
  }
}

function listFormatVal(cellValue: any, dataFmt: DataFormatColumn) {
  const { format, enums } = dataFmt

  if (format) {
  // eg 保0:保密,1:男,2:女
    const segment = format.split(',')
    if (segment.length === 0) {
      return cellValue
    }

    const kv = {}
    for (const item of segment) {
      const seg = item.split(':')
      kv[seg[0] || ''] = seg[1]
    }

    return kv[cellValue] || ''
  }
  else if (enums) {
    return dictLabel(enums, cellValue) || ''
  }
  else {
    return cellValue
  }
}

// 枚举类型格式化（type=enums 忽略 format，翻译匹配字段由 enumstype 决定）
// 枚举名在枚举数据中不存在时跳过翻译，直接显示原值
function enumFormatter(col: TableColumn, dataFmt: DataFormatColumn) {
  const { enums } = dataFmt

  if (!enums || !hasDict(enums)) {
    return
  }
  const matchBy = normalizeDictType(dataFmt.enumstype)
  col.formatter = ({ cellValue }) => dictLabel(enums, cellValue as string, matchBy) || ''
}

function enumFormatVal(cellValue: any, dataFmt: DataFormatColumn) {
  const { enums } = dataFmt

  if (!enums || !hasDict(enums)) {
    return cellValue
  }
  return dictLabel(enums, cellValue, normalizeDictType(dataFmt.enumstype)) || ''
}

// 金额格式化
function moneyFormatter(col: TableColumn, dataFmt: DataFormatColumn) {
  if (!dataFmt.format) {
    return
  }
  col.formatter = ({ cellValue }) => {
    if (cellValue === 0) {
      return '-'
    }

    if (!dataFmt.format) {
      return cellValue
    }

    if (!isNumber(cellValue)) {
      return cellValue
    }
    return fmtMoney(
      cellValue,
      Number.parseInt(dataFmt.format[0] || '0'),
      false,
      '.',
      dataFmt.format.includes(',') ? ',' : '',
    )
  }
}

function moneyFormatVal(cellValue: any, dataFmt: DataFormatColumn) {
  if (!dataFmt.format) {
    return cellValue
  }

  if (cellValue === 0) {
    return '-'
  }

  if (!dataFmt.format) {
    return cellValue
  }

  if (!isNumber(cellValue)) {
    return cellValue
  }
  return fmtMoney(
    cellValue,
    Number.parseInt(dataFmt.format[0] || '0'),
    false,
    '.',
    dataFmt.format.includes(',') ? ',' : '',
  )
}

// 日期格式化
function dateFormatter(col: TableColumn, dataFmt: DataFormatColumn) {
  col.formatter = ({ cellValue }) => {
    let date: Date
    const type = dataFmt.type
    if (type === 'timestamp' || (cellValue != null && !Number.isNaN(Number(cellValue)))) {
      if (cellValue == null || cellValue === '' || cellValue === '0')
        return ''
      date = new Date()
      date.setTime(cellValue)
    }
    else {
      if (cellValue == null || cellValue === '')
        return ''
      date = parse(cellValue as string, 'yyyy-MM-dd HH:mm:ss', new Date())
    }

    if (!isValid(date)) {
      return cellValue
    }
    // 获取format格式
    if (dataFmt.format) {
      return format(date, dataFmt.format)
    }

    if (type === 'date') {
      return format(date, 'yyyy-MM-dd')
    }
    else if (type === 'time') {
      return format(date, 'HH:mm:ss')
    }
    else if (type === 'timestamp') {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    }
    else {
      return cellValue
    }
  }
}

function dateFormatVal(cellValue: any, dataFmt: DataFormatColumn) {
  let date: Date
  const type = dataFmt.type
  if (type === 'timestamp' || (cellValue != null && !Number.isNaN(Number(cellValue)))) {
    if (cellValue == null || cellValue === '' || cellValue === '0')
      return ''
    date = new Date()
    date.setTime(cellValue)
  }
  else {
    if (cellValue == null || cellValue === '')
      return ''
    date = parse(cellValue as string, 'yyyy-MM-dd HH:mm:ss', new Date())
  }

  if (!isValid(date)) {
    return cellValue
  }
  // 获取format格式
  if (dataFmt.format) {
    return format(date, dataFmt.format)
  }

  if (type === 'date') {
    return format(date, 'yyyy-MM-dd')
  }
  else if (type === 'time') {
    return format(date, 'HH:mm:ss')
  }
  else if (type === 'timestamp') {
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  }
  else {
    return cellValue
  }
}
