import type { DataFormatColumn, TableColumn, TableProps } from '../types/table'
import { cloneDeep, isEmpty, merge, throttle } from 'lodash-es'
import XEUtils from 'xe-utils'
import { usePermission } from '@/hooks/permission/usePermission'
import dataFormatApi from '@/service/api/dataformat'
import fmtMoney from '@/utils/fmtMoney'
import { isBoolean, isFunction } from '@/utils/is'

import toast from '@/utils/toast'
import { formatter } from '../formatter'

/** 列常量配置 */
const COLUMN_CONSTANTS = {
  /** 复选框列宽度（单层表头） */
  CHECKBOX_WIDTH: 48,
  /** 复选框列宽度（分组表头） */
  CHECKBOX_WIDTH_GROUP: 44,
  /** 序号列宽度 */
  SEQ_WIDTH: 70,
  /** 格式变化提示节流时间（ms） */
  CHANGE_MSG_THROTTLE: 2000,
}

interface AdvSearchInstance {
  loadFormat: (data: DataFormatColumn[]) => void
}

/**
 * 列配置管理 Hook
 * @description 管理表格列的配置、格式化、分组、合并等功能
 */
export function useColumns(
  propsRef: ComputedRef<TableProps>,
  advSearch: AdvSearchInstance,
  loadFormatCallback?: (data: DataFormatColumn[]) => void,
) {
  /** 列的真实配置 */
  const columnsRef = ref(unref(propsRef).columns) as unknown as Ref<TableColumn[]>
  /** 列的原始配置（用于重置） */
  const originColumns = cloneDeep(columnsRef.value)
  /** 基于列名的快速查找映射 */
  const columnsMap = new Map<string, DataFormatColumn>()
  /** 需要合并的列字段 */
  const mergeFieldsRef = ref<string[]>([])
  /** 合并列的附加比较字段 */
  const mergeCompares = new Map<string, string[]>()
  /** 需要统计的列映射 */
  const columnSumMap = new Map<string, DataFormatColumn>()
  /** 数据格式配置列表 */
  const dataFmtsRef = ref<DataFormatColumn[]>([])

  /** 格式变化提示（节流） */
  const showChangeMsg = throttle(() => {
    toast.info('格式已变化，请打开网格设置进行保存')
  }, COLUMN_CONSTANTS.CHANGE_MSG_THROTTLE)

  /**
   * 监听网格格式变化
   */
  watch(
    () => unref(propsRef).dataFormat,
    (dataFormat) => {
      if (dataFormat) {
        fetchColumns(dataFormat)
      }
    },
    { immediate: true },
  )

  const getColumnsRef = computed(() => unref(columnsRef) || [])

  const { hasPermission } = usePermission()

  /**
   * 判断列是否显示
   * @param column - 列配置
   * @returns 是否显示
   */
  function isShow(column: TableColumn): boolean {
    const { ifShow } = column
    if (isBoolean(ifShow))
      return ifShow
    if (isFunction(ifShow))
      return ifShow(column) || true // 注意：|| true 确保函数返回 falsy 值时仍显示
    return true
  }

  /** 获取经过权限和显示过滤后的列配置 */
  const getDataTableColumns = computed(() => {
    const columns = unref(getColumnsRef)
    return columns.filter(column =>
      hasPermission(column.auth as string[]) && isShow(column),
    )
  })

  function setColumns(columnList: TableColumn[]) {
    columnsRef.value = columnList
  }

  function getColumns(): TableColumn[] {
    return unref(getColumnsRef)
  }

  /**
   * 根据列名获取格式配置
   * @param column - 列名
   */
  function getDataFmt(column: string) {
    return columnsMap.get(column)
  }

  /**
   * 保存自定义格式
   * @param dataFmts - 格式配置列表
   */
  function saveDataFmt(dataFmts: DataFormatColumn[]) {
    const dataFormat = unref(propsRef).dataFormat
    const list = dataFmts.map(m => ({
      column: m.column,
      width: m.width,
      fixed: m.fixed,
      isview: m.isview,
      isprint: m.isprint,
    }))
    return dataFormatApi.save({
      name: dataFormat || '',
      list,
    })
  }

  /** 重置格式 */
  function resetDataFmt() {
    const dataFormat = unref(propsRef).dataFormat
    return dataFormatApi.remove({ value: dataFormat || '' })
  }

  /** 获取网格数据格式列表 */
  function getDataFmtList() {
    return dataFmtsRef.value
  }

  /** 是否存在合并行 */
  function hasMergeRow() {
    return mergeFieldsRef.value.length > 0
  }

  /** 是否存在统计的列 */
  function hasSumColumn() {
    return columnSumMap.size > 0
  }

  /** 是否没有筛选列 */
  function hasNotFilter() {
    const props = unref(propsRef)
    return props.filterDisabled || dataFmtsRef.value.every(q => !q.isfilter)
  }

  /**
   * 应用格式配置（内部方法）
   * @param result - 格式数据
   */
  async function applyFormat(result: DataFormatColumn[]) {
    buildColumn(result)
    advSearch.loadFormat(result)
    loadFormatCallback?.(result)

    const loadDataFmtAfter = unref(propsRef).loadDataFmtAfter
    if (loadDataFmtAfter) {
      await loadDataFmtAfter(result)
    }
  }

  /**
   * 获取网格格式
   * @param dataFormat - 格式名
   */
  async function fetchColumns(dataFormat?: string) {
    if (!dataFormat)
      return

    const { isSuccess, data } = await dataFormatApi.get(dataFormat)
    if (!isSuccess)
      return

    await applyFormat(data as DataFormatColumn[])
  }

  /**
   * 加载 DataFormat 格式
   * @param result - 格式数据
   */
  async function loadFormat(result?: DataFormatColumn[]) {
    if (!result)
      return

    await applyFormat(result)
  }

  /** 重新加载格式 */
  async function resetColumn() {
    const dataFormat = unref(propsRef).dataFormat
    if (dataFormat) {
      await fetchColumns(dataFormat)
    }
  }

  /**
   * 生成列格式
   * @description 根据是否存在分组表头选择不同的构建方式
   */
  function buildColumn(data: DataFormatColumn[]) {
    if (data.some(q => !isEmpty(q.hcolumn))) {
      buildColumnWithGroup(data)
    }
    else {
      buildColumnSimple(data)
    }
  }

  /**
   * 添加系统列（复选框、序号）
   * @param list - 列列表
   * @param columns - 原始列配置
   * @param isGrouped - 是否分组表头（分组表头 checkbox 宽度不同，且无 field 属性）
   */
  function addSystemColumns(list: TableColumn[], columns: TableColumn[], isGrouped = false) {
    const props = unref(propsRef)

    // 保留类型列和操作列
    for (const item of columns) {
      if (item.type || item.isOperate) {
        if (item.isOperate) {
          item.resizable = false
        }
        list.push(item)
      }
    }

    // 添加复选框列（分组表头使用不同的宽度，且无 field 属性）
    const checkboxWidth = isGrouped
      ? COLUMN_CONSTANTS.CHECKBOX_WIDTH_GROUP
      : COLUMN_CONSTANTS.CHECKBOX_WIDTH

    if (!props.checkboxDisabled && !list.some(q => q.type === 'checkbox')) {
      const checkboxCol: TableColumn = {
        type: 'checkbox',
        width: checkboxWidth,
        align: 'center',
        resizable: false,
        fixed: 'left',
        slots: { footer: 'checkbox_filter', floatingFilter: 'checkbox_floating_filter' },
      }
      // 非分组表头才有 field 属性
      if (!isGrouped) {
        checkboxCol.field = '_checkbox'
      }
      list.push(checkboxCol)
    }

    // 添加序号列（分组表头无 field 属性）
    if (!props.seqDisabled && !list.some(q => q.type === 'seq')) {
      const seqCol: TableColumn = {
        type: 'seq',
        title: '序号',
        width: COLUMN_CONSTANTS.SEQ_WIDTH,
        align: 'right',
        headerAlign: 'center',
        resizable: false,
        fixed: 'left',
        slots: { footer: 'seq_filter', floatingFilter: 'seq_floating_filter' },
      }
      // 非分组表头才有 field 属性
      if (!isGrouped) {
        seqCol.field = '_seq'
      }
      list.push(seqCol)
    }
  }

  /**
   * 更新列映射（快速查找、统计列）
   */
  function updateColumnMaps(data: DataFormatColumn[]) {
    columnsMap.clear()
    columnSumMap.clear()

    for (const item of data) {
      if (item.column) {
        columnsMap.set(item.column, item)
      }
      if (item.istotal) {
        columnSumMap.set(item.column, item)
      }
    }
  }

  /**
   * 构建单层表头
   */
  function buildColumnSimple(data: DataFormatColumn[]) {
    const list: TableColumn[] = []
    const columns = cloneDeep(originColumns)
    dataFmtsRef.value = data

    addSystemColumns(list, columns)

    const props = unref(propsRef)
    const noFilter = props.filterDisabled || data.every(q => !q.isfilter)

    mergeFieldsRef.value = []
    mergeCompares.clear()

    // 生成列格式
    for (const item of data) {
      let col = columns.find(c => c.field === item.column)

      if (!col) {
        col = {
          field: item.column,
          resizable: !props.resizableDisabled,
        } as TableColumn
      }

      fillColumn(col, item, false, noFilter)
      list.push(col)
    }

    setColumns(list)
    updateColumnMaps(data)
  }

  /**
   * 填充列格式属性
   * @param col - 列配置
   * @param item - 数据格式配置
   * @param filterFixed - 是否排除固定列处理
   * @param noFilter - 是否禁用筛选
   * @param externalColumns - 外部列配置（用于分组表头合并插槽）
   */
  function fillColumn(
    col: TableColumn,
    item: DataFormatColumn,
    filterFixed: boolean,
    noFilter: boolean,
    externalColumns?: TableColumn[],
  ) {
    col.headerAlign = 'center'
    col.showOverflow = true
    col.showHeaderOverflow = true
    col.visible = item.isview
    col.title = item.title
    col.minWidth = item.width

    // 对齐方式
    if (item.align) {
      col.align = item.align
    }

    // 固定列
    if (!filterFixed && item.fixed) {
      col.fixed = item.fixed
    }

    // 排序
    if (item.sortable) {
      col.sortable = true
    }

    // 分组表头：合并外部定义的插槽
    if (externalColumns && item.isview) {
      const customCol = externalColumns.find(c => c.field === item.column)
      if (customCol?.slots) {
        col.slots = { ...customCol.slots }
      }
    }

    // 筛选插槽
    if (!noFilter && item.isview && item.isfilter) {
      const filterMode = unref(propsRef).filterMode || 'footer'
      if (filterMode === 'floating') {
        // 浮动筛选模式
        col.filters = [{ data: item.filter_value ?? '' }]
        col.slots = {
          ...col.slots,
          floatingFilter: `${item.column}_floating_filter`,
        }
      }
      else {
        // 底部筛选模式
        col.slots = {
          ...col.slots,
          footer: `${item.column}_filter`,
        }
      }
    }

    // 打印标记
    col.isPrint = item.isprint

    // 合并行配置（固定列不能合并）
    if (item.ismerge && !item.fixed) {
      mergeFieldsRef.value.push(col.field as string)
      if (item.mergecompare) {
        const fields = item.mergecompare.split(',').filter(Boolean)
        if (fields.length > 0) {
          mergeCompares.set(col.field as string, fields)
        }
      }
    }

    // 格式化内容
    formatter(col, item)

    return col
  }

  /**
   * 构建分组表头
   * @description 支持多层嵌套的表头结构
   */
  function buildColumnWithGroup(data: DataFormatColumn[]) {
    const list: TableColumn[] = []
    const columns = cloneDeep(originColumns)
    dataFmtsRef.value = data

    addSystemColumns(list, columns, true)

    const props = unref(propsRef)
    const noFilter = props.filterDisabled || data.every(q => !q.isfilter)

    mergeFieldsRef.value = []
    mergeCompares.clear()

    // 父节点缓存，用于构建分组表头
    const parentMap = new Map<string, TableColumn>()

    /**
     * 查找或创建父节点
     * @param title - 父节点标题
     * @param item - 数据格式配置
     */
    function findOrCreateParent(title: string, item: DataFormatColumn) {
      let col = parentMap.get(title)
      if (!col) {
        col = {
          title,
          minWidth: item.width,
          headerAlign: 'center',
          resizable: false,
          children: [],
        }
        if (item.fixed) {
          col.fixed = item.fixed
        }
        parentMap.set(title, col)
        list.push(col)
      }
      return col
    }

    // 遍历数据构建列结构
    for (const item of data) {
      const col: TableColumn = {
        field: item.column,
        resizable: !props.resizableDisabled,
      }

      // 无分组表头，直接添加到列表
      if (isEmpty(item.hcolumn)) {
        list.push(fillColumn(col, item, false, noFilter, columns))
        continue
      }

      const headers = item.hcolumn.split(',')
      let parent = findOrCreateParent(headers[0] || '', item)

      // 单层分组
      if (headers.length === 1) {
        parent.children?.push(fillColumn(col, item, true, noFilter, columns))
        continue
      }

      // 多层分组：遍历构建嵌套结构
      for (let i = 1; i < headers.length; i++) {
        const headerTitle = headers[i]

        if (parent.title === headerTitle) {
          // 标题相同，直接作为子节点
          if (i === headers.length - 1) {
            parent.children?.push(fillColumn(col, item, true, noFilter, columns))
          }
        }
        else {
          // 查找或创建子节点
          const child = parent.children?.find(q => q.title === headerTitle)
          if (child) {
            parent = child
          }
          else {
            const node: TableColumn = {
              title: headerTitle,
              headerAlign: 'center',
              resizable: false,
              children: [],
            }
            parent.children?.push(node)
            parent = node
          }

          // 最后一级添加叶子节点
          if (i === headers.length - 1) {
            parent.children?.push(fillColumn(col, item, true, noFilter, columns))
          }
        }
      }
    }

    // 合并外部定义的格式
    mergeExternalFormats(list, columns)

    setColumns(list)
    updateColumnMaps(data)
  }

  /**
   * 合并外部定义的格式
   * @description 将 columns 中的自定义配置合并到生成的列结构中
   */
  function mergeExternalFormats(list: TableColumn[], columns: TableColumn[]) {
    for (const item of list) {
      const dest = columns.find(
        q =>
          (q.field && q.field === item.field)
          || (q.title === item.title
            && q.children?.length
            && item.children?.length),
      )

      if (!dest)
        continue

      if (item.children && dest.children) {
        // 计算源和目标的深度
        const depth1 = calculateTreeDepth(item)
        const depth2 = calculateTreeDepth(dest)

        // 深度相同时进行叶子节点合并
        if (depth1 === depth2) {
          const leafNodes1 = getLeafNodes(item)
          const leafNodes2 = getLeafNodes(dest)

          for (const col of leafNodes2) {
            const leaf = leafNodes1.find(q => q.field === col.field)
            if (leaf) {
              merge(leaf, col)
            }
            else {
              leafNodes1.push(col)
            }
          }
        }
      }
      else {
        merge(item, dest)
      }
    }
  }

  /**
   * 计算树形结构的最大深度
   */
  function calculateTreeDepth(node: TableColumn): number {
    if (!node.children?.length)
      return 0
    return 1 + Math.max(...node.children.map(calculateTreeDepth))
  }

  /**
   * 获取树形结构的所有叶子节点
   */
  function getLeafNodes(node: TableColumn): TableColumn[] {
    if (!node.children?.length)
      return [node]

    const result: TableColumn[] = []
    for (const child of node.children) {
      result.push(...getLeafNodes(child))
    }
    return result
  }

  /**
   * 合并行处理
   * @description 根据配置自动合并相邻且值相同的单元格
   */
  function handleRowMerge({ row, rowIndex, column, visibleData }) {
    if (mergeFieldsRef.value.length === 0)
      return

    const fieldName = column.field || ''
    if (!fieldName || !mergeFieldsRef.value.includes(fieldName))
      return

    const compares = mergeCompares.get(fieldName)
    const cellValue = getCompareValue(row, fieldName, compares)

    if (cellValue === undefined)
      return

    const prevRow = visibleData[rowIndex - 1]

    // 与上一行比较，相同则隐藏
    if (prevRow) {
      const prevValue = getCompareValue(prevRow, fieldName, compares)
      if (prevValue === cellValue) {
        return { rowspan: 0, colspan: 0 }
      }
    }

    // 计算向下合并的行数
    let countRowspan = 1
    let nextRow = visibleData[rowIndex + 1]

    while (nextRow) {
      const nextValue = getCompareValue(nextRow, fieldName, compares)
      if (nextValue !== cellValue)
        break
      countRowspan++
      nextRow = visibleData[rowIndex + countRowspan]
    }

    if (countRowspan > 1) {
      return { rowspan: countRowspan, colspan: 1 }
    }
  }

  /**
   * 获取用于合并比较的值
   * @description 支持附加比较字段，将多个字段值拼接后比较
   */
  function getCompareValue(row: any, fieldName: string, compares?: string[]) {
    let value = XEUtils.get(row, fieldName)
    if (compares?.length) {
      for (const c of compares) {
        value += XEUtils.get(row, c)
      }
    }
    return value
  }

  /**
   * 列拖拽移动处理
   */
  function handleColumnDrop({ newColumn, oldColumn }) {
    const fieldName = (field: any) => field || ''
    const oldIdx = dataFmtsRef.value.findIndex(f => f.column === fieldName(oldColumn.field))
    const newIdx = dataFmtsRef.value.findIndex(f => f.column === fieldName(newColumn.field))

    if (oldIdx > -1 && newIdx > -1) {
      const [curr] = dataFmtsRef.value.splice(oldIdx, 1)
      dataFmtsRef.value.splice(newIdx, 0, curr!)
      if (oldIdx !== newIdx) {
        showChangeMsg()
      }
    }
  }

  /**
   * 列宽度调整处理
   */
  function columnResizable({ column }) {
    if (!column.field)
      return

    const dataFmt = getDataFmt(column.field || '')
    if (dataFmt) {
      dataFmt.width = column.resizeWidth
      showChangeMsg()
    }
  }

  /**
   * 合计行处理
   */
  function handleRowSum({ columns, data }) {
    const notFilter = hasNotFilter()
    const hasSum = hasSumColumn()

    if (!hasSum) {
      return [['']]
    }

    const props = unref(propsRef)
    const sums: any[] = []

    columns.forEach((column: any, columnIndex: number) => {
      if (columnIndex === propsRef.value.sumIndex) {
        sums.push(propsRef.value.sumLabel || '')
        return
      }

      const fieldName = column.field || ''
      const col = columnsMap.get(fieldName)

      if (col?.istotal) {
        const sumValue = XEUtils.sum(data, (item: any) => {
          if (props.sumFilterRow) {
            const { field, value } = props.sumFilterRow
            return item[fieldName] && item[field] !== value ? item[fieldName] : 0
          }
          return item[fieldName]
        })

        // 保存原始数值用于判断是否为 0
        const isZero = sumValue === 0

        // 格式化金额
        let sumCell = sumValue.toString()
        if (col.format) {
          sumCell = fmtMoney(
            sumCell,
            Number.parseInt(col.format[0] || '0'),
            false,
            '.',
            col.format.includes(',') ? ',' : '',
          )
        }

        // 原始值为 0 时显示 '-'
        sums.push(isZero ? '-' : sumCell)
      }
      else {
        sums.push(null)
      }
    })

    // 有统计且存在筛选时返回两行（筛选行 + 统计行）
    // 浮动筛选模式下不需要筛选行
    const filterMode = unref(propsRef).filterMode || 'floating'
    if (hasSum && !notFilter && filterMode === 'footer') {
      return [sums, ['']]
    }
    return [sums]
  }

  return {
    getDataTableColumns,
    getColumns,
    setColumns,
    getDataFmt,
    getDataFmtList,
    loadFormat,
    saveDataFmt,
    resetDataFmt,
    fetchColumns,
    resetColumn,
    buildColumn,
    hasSumColumn,
    hasMergeRow,
    hasNotFilter,
    handleRowMerge,
    columnResizable,
    handleColumnDrop,
    handleRowSum,
  }
}
