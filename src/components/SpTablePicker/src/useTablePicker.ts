import type { Ref } from 'vue'
import { NText } from 'naive-ui'
import { getViewportOffset } from '@/utils/domUtils'

/**
 * 通用下拉表格选择器 Hook
 * 提取选择项管理、事件处理、高度计算等通用逻辑
 */
export interface TablePickerItem {
  id: string
  label: string
}

export interface UseTablePickerOptions {
  /** 选择器 ref */
  selectRef: Ref<any>
  /** 表格 ref */
  tableRef: Ref<any>
  /** 是否多选 */
  multiple: Ref<boolean>
  /** 选择项 */
  selectItems: Ref<TablePickerItem[]>
  /** 清空选择项的函数 */
  clearItem: () => void
  /** 更新事件 emit */
  emitUpdate: (value: string | string[] | null) => void
}

export function useTablePicker(options: UseTablePickerOptions) {
  const {
    selectRef,
    tableRef,
    multiple,
    selectItems,
    clearItem,
    emitUpdate,
  } = options

  // ==================== 选择项管理 ====================

  /**
   * 添加选择项
   * 如果已存在相同 ID 的项则跳过
   */
  function addItem(item: TablePickerItem) {
    if (selectItems.value.some(q => q.id === item.id))
      return
    selectItems.value.push(item)
  }

  /**
   * 检查是否已存在指定 ID 的项
   */
  function hasItem(id: string) {
    return selectItems.value.find(q => q.id === id)
  }

  /**
   * 获取所有选择项的 ID 数组
   */
  function getItems() {
    return selectItems.value.map(m => m.id)
  }

  // ==================== 渲染函数 ====================

  /**
   * 自定义选择器选项标签渲染
   *
   * Naive UI Select 的 render-label 参数结构：
   * - 单选：option 就是 { label, value } 对象
   * - 多选：option.value 是 { label, value } 对象
   */
  function renderLabel(option: any) {
    const label = multiple.value ? option.value?.label : option.label
    return [
      h(NText),
      label || '',
    ]
  }

  // ==================== 高度计算 ====================

  /**
   * 下拉框显示/隐藏事件
   * 动态计算表格高度以适应视口空间
   */
  function onShow(
    isShow: boolean,
    gridOptions: { height?: number },
    baseHeight = 560,
    reservedSpace = 140,
  ) {
    if (!isShow)
      return

    const select = selectRef.value
    if (!select || !tableRef.value)
      return

    const selectEl = select.$el
    const headEl = selectEl?.querySelector('.n-base-selection')
    if (!headEl)
      return

    const { bottomIncludeBody, top } = getViewportOffset(headEl)

    // 根据可用空间调整高度
    let height = baseHeight
    if (bottomIncludeBody < height) {
      if (top < height) {
        height = Math.max(bottomIncludeBody, top)
      }
    }
    else if (top < height && bottomIncludeBody < height) {
      height = Math.max(bottomIncludeBody, top)
    }

    // 减去固定预留空间
    height -= reservedSpace
    gridOptions.height = height

    // 重新计算表格布局
    nextTick(() => {
      tableRef.value.recalculate()
    })
  }

  // ==================== 事件处理 ====================

  /**
   * 关闭下拉框（单选模式使用）
   */
  function closeDropdown() {
    selectRef.value?.focus()
    selectRef.value?.blur()
  }

  /**
   * 清空选择
   */
  function clearSelect() {
    clearItem()
    const newValue = multiple.value ? [] : null
    emitUpdate(newValue)
    return false
  }

  return {
    // 选择项管理
    addItem,
    hasItem,
    getItems,
    // 渲染
    renderLabel,
    // 高度计算
    onShow,
    // 事件处理
    closeDropdown,
    clearSelect,
  }
}
