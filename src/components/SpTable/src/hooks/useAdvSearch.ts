import type {
  AdvSearchComponentCond,
  AdvSearchFilter,
  AdvSearchFilterValue,
  AdvSearchInstance,
  DataFormatColumn,
} from '../types/table'

import { addDays, format } from 'date-fns'

import { cloneDeep, startsWith } from 'lodash-es'
import { ref, unref } from 'vue'

import { dictLabel, dictOptions, normalizeDictType } from '@/dicts'
import * as searchCond from './searchCond'

/** 筛选标签项接口 */
interface FilterLabelItem {
  label: string
  value: string | string[] | number | null
  title: string
  format?: string | null
  enums?: string | null
  enumstype?: string | null
  types: string
}

function useComponentCond(): AdvSearchComponentCond {
  const hasCondType = (val: string) => searchCond.CondType.includes(val)
  const hasTextType = (val: string) => searchCond.TextType.includes(val)
  const hasNumberType = (val: string) => searchCond.NumberType.includes(val)

  /** 根据字段类型获取对应的条件列表 */
  const getCondTypeList = (type: string) => {
    switch (type) {
      case 'date':
      case 'datetime':
      case 'time':
        return searchCond.DateTimeCondList
      case 'money':
      case 'number':
        return searchCond.NumericCondList
      case 'numberlist':
      case 'numberlistinvalue':
      case 'textlist':
      case 'textlistinvalue':
      case 'enums':
        return searchCond.EnumsCondList
      default:
        return searchCond.AllCondList
    }
  }

  /** 解析布尔类型格式，返回 true/false 选项列表 */
  const getCondBool = (item: DataFormatColumn) => {
    if (!item.format)
      return []
    const segment = item.format.split(';')
    if (segment.length > 1) {
      return [
        { value: 'true', label: segment[0] },
        { value: 'false', label: segment[1] },
      ]
    }
    return []
  }

  /**
   * 获取条件选项列表
   * @param item 列配置
   * @param useIndexOrValue true 时使用索引作为值，false 时使用原始值
   */
  const getCondList = (item: DataFormatColumn, useIndexOrValue: boolean) => {
    if (item.format) {
      const segment = item.format.split(',')
      return segment.map((s, i) => ({
        value: useIndexOrValue ? i : s,
        label: s,
      }))
    }
    if (item.enums) {
      return dictOptions(item.enums).map((s, i) => ({
        value: useIndexOrValue ? i : s.value,
        label: s.label,
      }))
    }
    return []
  }

  /** 获取带值的条件列表（格式为 "value:label" 形式） */
  const getCondListInValue = (item: DataFormatColumn) => {
    // type=enums 忽略 format，枚举系统为唯一数据源，取值字段由 enumstype 决定
    if (item.enums && item.type === 'enums') {
      return dictOptions(item.enums, normalizeDictType(item.enumstype))
    }
    if (item.format) {
      return item.format.split(',').map((s) => {
        const [value, label] = s.split(':')
        return { label, value }
      })
    }
    if (item.enums) {
      return dictOptions(item.enums)
    }
    return []
  }

  /** 根据日期格式判断日期选择器类型 */
  const getDateType = (item: DataFormatColumn): 'datetimerange' | 'daterange' => {
    return item.format && startsWith(item.format, 'yyyy-MM-dd HH:') ? 'datetimerange' : 'daterange'
  }

  return {
    hasCondType,
    hasTextType,
    hasNumberType,
    getCondTypeList,
    getCondList,
    getCondBool,
    getCondListInValue,
    getDateType,
  }
}

export function useAdvSearch(): AdvSearchInstance {
  const columnsRef = ref<Array<DataFormatColumn>>([])
  const filterRef = ref<AdvSearchFilterValue>({
    name: null,
    label: null,
    value: null,
  })

  const componentCond = useComponentCond()

  /**
   * 加载网格格式
   * @param data DataFormatColumn[]
   */
  const loadFormat = (data: DataFormatColumn[]) => {
    columnsRef.value = data.filter(f => f.isfilter !== false)
  }

  /** 创建筛选条件对象 */
  const createFilter = (item: DataFormatColumn, express: string, value: any): AdvSearchFilter => ({
    column: item.column,
    express,
    value,
    format: item.format,
  })

  /** 检查值是否有效（非 undefined、非 null） */
  const isValidValue = (val: any): boolean => val !== undefined && val !== null

  /** 检查非空字符串值是否有效（非 undefined、非 null、非空字符串） */
  const isValidNonEmptyValue = (val: any): boolean => val !== undefined && val !== null && val !== ''

  /** 检查数组值是否有效（非 undefined、非空字符串、是数组且长度大于0） */
  const isValidArray = (val: any): boolean => val !== undefined && val !== '' && Array.isArray(val) && val.length > 0

  /** 列表类型集合 */
  const LIST_TYPES = ['numberlist', 'textlist', 'numberlistinvalue', 'textlistinvalue', 'enums']
  /** 日期时间类型集合 */
  const DATE_TYPES = ['date', 'time', 'datetime']
  /** 带 value:label 格式的列表类型集合 */
  const IN_VALUE_TYPES = ['numberlistinvalue', 'textlistinvalue']

  /**
   * 更新高级条件内容
   * @returns 生成的筛选条件数组
   */
  function update(): AdvSearchFilter[] {
    const filters: AdvSearchFilter[] = []
    const filtersLabel: FilterLabelItem[] = []
    const cols = unref(columnsRef)

    /** 获取条件表达式的显示标签 */
    const getExpressLabel = (express: string | null): string => {
      const found = searchCond.AllCondList.find(a => a.value === express)
      return found?.label ?? '包括'
    }

    /** 添加筛选标签到列表（简化版，用于通用场景） */
    const addFilterLabel = (
      item: DataFormatColumn,
      expressLabel: string,
      value: string | string[] | number | null,
    ) => {
      filtersLabel.push({
        label: expressLabel,
        value,
        title: item.title,
        format: item.format,
        enums: item.enums,
        enumstype: item.enumstype,
        types: item.type,
      })
    }

    // 生成条件和标签
    for (const item of cols) {
      const type = item.type

      // ========== 1. 布尔类型 ==========
      if (type === 'bool') {
        if (item.filter_value) {
          filters.push(createFilter(item, 'Equal', item.filter_value))
          // bool 类型不添加 enums 属性
          filtersLabel.push({
            label: '等于',
            value: item.filter_value || '空',
            title: item.title,
            format: item.format,
            types: type,
          })
        }
        continue
      }

      // ========== 2. 列表类型（numberlist/textlist/numberlistinvalue/textlistinvalue） ==========
      if (LIST_TYPES.includes(type) && isValidArray(item.filter_value)) {
        // 没选条件默认包括（空字符串也需要设置默认值）
        if (!item.filter_express) {
          item.filter_express = 'Contains'
        }
        // 单选时：NotContains -> NotEqual, Contains -> Equal
        const singleExpress = item.filter_express === 'NotContains' ? 'NotEqual' : 'Equal'
        const express = item.filter_value.length > 1 ? (item.filter_express || 'Contains') : singleExpress
        filters.push(createFilter(item, express, [...item.filter_value].toString()))
        addFilterLabel(item, getExpressLabel(item.filter_express), item.filter_value)
        continue
      }

      // ========== 3. 时间戳类型 ==========
      if (type === 'timestamp' && isValidArray(item.filter_value)) {
        // 创建副本避免修改原始数据
        const filterValue = [...item.filter_value]
        // 年月日选择时，结束日期默认加一天（实现包含结束日期的效果）
        if (!startsWith(item.format, 'yyyy-MM-dd HH:')) {
          filterValue[1] = addDays(filterValue[1], 1).getTime()
        }
        filters.push(createFilter(item, 'Between', filterValue.join(',')))
        filtersLabel.push({
          label: getExpressLabel(item.filter_express),
          value: filterValue.length > 0
            ? `${format(filterValue[0], 'yyyy-MM-dd')}至${format(filterValue[1], 'yyyy-MM-dd')}`
            : '空',
          title: item.title,
          types: type,
        })
        continue
      }

      // ========== 4. 有明确条件表达式的 ==========
      if (item.filter_express) {
        const isNumber = componentCond.hasNumberType(type)
        if (isNumber && isValidNonEmptyValue(item.filter_value)) {
          filters.push(createFilter(item, item.filter_express, item.filter_value.toString()))
          // 数值类型不添加 enums 属性
          addFilterLabel(item, getExpressLabel(item.filter_express), item.filter_value)
        }
        else if (!isNumber) {
          filters.push(createFilter(item, item.filter_express, (item.filter_value || '').toString()))
          addFilterLabel(item, getExpressLabel(item.filter_express), item.filter_value || '空')
        }
        continue
      }

      // ========== 5. 无条件表达式但有值（使用默认条件） ==========
      if (isValidValue(item.filter_value)) {
        // 日期/时间或数值类型默认等于，其他类型默认包含
        item.filter_express = DATE_TYPES.includes(type) || componentCond.hasNumberType(type) ? 'Equal' : 'Like'
        filters.push(createFilter(item, item.filter_express, (item.filter_value || '').toString()))
        addFilterLabel(item, getExpressLabel(item.filter_express), item.filter_value || '空')
      }
    }

    // ========== 生成筛选描述文本 ==========
    let text = ''
    for (const labelItem of filtersLabel) {
      if (!labelItem.label || labelItem.value === undefined || labelItem.value === null)
        continue

      let labelContent: string | string[] | number | null = null
      const { types, value, format, enums, enumstype } = labelItem

      // 数值/金额类型直接使用原值
      if (types === 'money' || types === 'number') {
        labelContent = value as string | number
      }
      // 布尔类型根据 format 解析显示文本
      else if (types === 'bool') {
        const labels = format?.split(';') ?? []
        labelContent = value === 'true' ? (labels[0] ?? '是') : (labels[1] ?? '否')
      }
      // 其他类型：处理 format 或 enums
      else {
        const valArr = value as string[]

        // 处理带 value:label 格式的列表
        if (format?.includes(',') && IN_VALUE_TYPES.includes(types)) {
          const formatMap = new Map(
            format.split(',').map((s: string) => {
              const [id, val] = s.split(':')
              return [id, val]
            }),
          )
          labelContent = valArr.map((id: string) => formatMap.get(id) ?? '').filter(Boolean)
        }

        // 处理枚举类型（type=enums 按 enumstype 匹配，其余固定按 value）
        if (enums) {
          const matchBy = types === 'enums' ? normalizeDictType(enumstype) : 'value'
          labelContent = valArr
            .map((v: string) => dictLabel(enums, v, matchBy))
            .filter((v): v is string => Boolean(v))
        }
      }

      const content = labelContent ?? value
      text += `${text ? '、' : ''}${labelItem.title}${labelItem.label}：${content}`
    }

    filterRef.value.label = text
    filterRef.value.value = filters

    return filters
  }

  /**
   * 清空高级条件内容(真实请求过滤内容)
   */
  const clearFilter = () => {
    filterRef.value.value = null
    filterRef.value.label = null
  }

  /**
   * 重置高级筛选条件(可视化显示)
   */
  const resetFilter = () => {
    unref(columnsRef).forEach((col) => {
      col.filter_express = null
      col.filter_value = null
    })
  }

  /**
   * 清空
   */
  const clear = () => {
    clearFilter()
    resetFilter()
  }

  /**
   * 获取筛选条件
   */
  const getFilter = (): AdvSearchFilter[] => {
    return filterRef.value.value ? cloneDeep(filterRef.value.value) : []
  }

  return {
    componentCond,
    loadFormat,
    update,
    clearFilter,
    resetFilter,
    clear,
    getFilter,
    filterRef,
    columnsRef,
  }
}
