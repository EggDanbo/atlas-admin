<script lang="ts" setup>
import type {
  Ref,
} from 'vue'
import type { VxeTableInstance } from 'vxe-table'

import type { PaginationProps } from './types/pagination'
import type {
  DataFormatColumn,
  FetchParams,
  TableActionType,
  TableProps,
} from './types/table'
import { Icon } from '@iconify/vue'
import { useThrottleFn } from '@vueuse/core'
import {
  computed,
  nextTick,
  onActivated,
  onMounted,
  ref,
  toRaw,
  unref,
  useAttrs,
} from 'vue'
import { useWindowSizeFn } from '@/hooks/help/useWindowSizeFn'
import { useThemeStore } from '@/store/modules/theme'
import { getViewportOffset } from '@/utils/domUtils'
import { isBoolean } from '@/utils/is'
import AdvInput from './components/search/AdvInput.vue'
import AdvInputModal from './components/search/AdvInputModal.vue'
import AdSearch from './components/search/Search.vue'
import Settings from './components/settings/Settings.vue'
import { useAdvSearch } from './hooks/useAdvSearch'
import { useColumns } from './hooks/useColumns'
import { useDataSource } from './hooks/useDataSource'
import { useLoading } from './hooks/useLoading'
import { usePagination } from './hooks/usePagination'
import { createTableContext } from './hooks/useTableContext'
import { dataTableProps } from './props'

const props = defineProps({
  ...dataTableProps,
} as any)

const emit = defineEmits([
  'fetch-success',
  'fetch-error',
  'cell-dblclick',
  'checkbox-change',
  'checkbox-all',
  'sort-change',
  'radio-change',
  'edit-closed',
  'edit-actived',
  'edit-disabled',
  'current-change',
  'data-change',
])

const attrs = useAttrs()

const densityOptions = [
  {
    type: 'menu',
    label: '默认',
    key: 'medium',
  },
  {
    type: 'menu',
    label: '紧凑',
    key: 'small',
  },
  {
    type: 'menu',
    label: '迷你',
    key: 'mini',
  },
]

const pageModeOptions = [
  {
    label: '手动分页',
    key: 'page',
  },
  {
    label: '滚动分页',
    key: 'scroll',
  },
]

const filterModeOptions = [
  {
    label: '浮动筛选',
    key: 'floating',
  },
  {
    label: '底部筛选',
    key: 'footer',
  },
]

const tableElRef = ref({} as VxeTableInstance)
const isShowTable = ref(true)
const deviceHeight = ref(150)
const wrapRef = ref(null)
const paginationRef = ref<HTMLElement | null>(null)
// fitContainer模式：被监听的弹窗内容元素，网格下方内容显隐时触发重算
const siblingResizeRef = ref<HTMLElement | null>(null)
const innerPropsRef = ref<Partial<TableProps>>()
const filterOptions = ref<DataFormatColumn[]>([])
const advInputModal = ref<any>(null)

const getProps = computed(() => {
  return { ...props, ...unref(innerPropsRef) } as TableProps
})

const { primaryColor } = storeToRefs(useThemeStore())

const { getLoading, setLoading } = useLoading(getProps)

const advSearch = useAdvSearch()

const {
  getDataTableColumns,
  buildColumn,
  loadFormat,
  resetColumn,
  setColumns,
  getColumns,
  getDataFmt,
  getDataFmtList,
  saveDataFmt,
  resetDataFmt,
  hasSumColumn,
  hasMergeRow,
  hasNotFilter,
  handleRowMerge,
  columnResizable,
  handleColumnDrop,
  handleRowSum,
} = useColumns(getProps, advSearch, (fmts: DataFormatColumn[]) => {
  filterOptions.value = fmts
})

const { getPaginationInfo, setPagination } = usePagination(getProps)

const {
  getDataSourceRef,
  getSumSourceRef,
  setDataSource,
  fetch: fetchData,
  clear: clearData,
  getSearchFilter,
  getSearchOrder,
} = useDataSource(
  getProps,
  {
    getPaginationInfo,
    setPagination,
    setLoading,
  },
  emit,
  advSearch,
)

function advInputSearch() {
  return fetch({ page: 1 })
}

function advInputShow(value) {
  if (advInputModal.value)
    advInputModal.value.showModal(value)
}

/**
   * 清空高级条件重新加载数据
   */
function reloadData() {
  clear()
  advSearch.clear()
  return fetch({ page: 1 })
}

/**
   * 远程请求数据加载
   * @param opt FetchParams
   */
function fetch(opt?: FetchParams) {
  clearCheckBox()
  return fetchData(opt)
}

/**
   * 清空数据
   */
function clear() {
  clearCheckBox()
  tableElRef?.value.clearSort()
  return clearData()
}

/** 查询 */
async function search() {
  await fetch({ page: 1 })
}

function resetData() {
  const props = unref(getProps)
  if (props.resetData) {
    props.resetData()
  }
  return reloadData()
}

// 表格密度
const tableSize: Ref<any> = ref(unref(getProps).size || 'medium')

const pageMode: Ref<string> = ref('page')

// 筛选模式
const filterMode: Ref<'footer' | 'floating'> = ref(unref(getProps).filterMode || 'floating')

// 密度切换
function densitySelect(e: any) {
  tableSize.value = e
}

// 筛选模式切换
async function filterModeSelect(e: 'footer' | 'floating') {
  filterMode.value = e
  innerPropsRef.value = { ...unref(innerPropsRef), filterMode: e }
  // 切换筛选模式后重新构建列配置
  await nextTick()
  buildColumn(filterOptions.value)
}

// 分页模式
async function pageModeSelect(e: any) {
  pageMode.value = e
  clearCheckBox()
  setPagination({ page: 1 })
  await fetch({ page: 1 })
}

// 表格序号列
const getSeqConfig = {
  seqMethod: ({ rowIndex }) => {
    if (pageMode.value === 'page') {
      const paginationInfo = unref(getPaginationInfo)
      if (isBoolean(paginationInfo)) {
        return rowIndex + 1
      }
      const pagination = paginationInfo as PaginationProps
      if (pagination.page && pagination.pageSize) {
        return rowIndex + 1 + (pagination.page - 1) * pagination.pageSize
      }

      return rowIndex + 1
    }
    else {
      return rowIndex + 1
    }
  },
}

// 计算高度
const getDeviceHeight = computed(() => {
  const maxHeight = `${unref(deviceHeight)}px`
  return maxHeight
})

/** 是否可以自适应高度 */
const getCanResize = computed(() => {
  const { canResize } = unref(getProps)
  return canResize
})

// 组装表格信息
const getTableBindValues = computed(() => {
  const propsValues = unref(getProps)
  const columns = toRaw(unref(getDataTableColumns))
  const propsData: Recordable = {
    ...attrs,
    ...propsValues,
    columns,
    sortConfig: { remote: propsValues.remoteSort, trigger: 'cell' },
    columnConfig: {
      useKey: true,
      resizable: true,
      isHover: true,
    },
    // 'max-height': getDeviceHeight.value,
  }

  if (unref(getCanResize)) {
    propsData['height'] = getDeviceHeight.value
  }

  // 列拖动
  if (propsValues.dataFormat && propsValues.columnDropDisabled === false) {
    propsData.columnConfig.drag = true
  }

  // 默认滚动条到顶
  let scrollToTopOnChange = true
  // 默认使用外部配置参数
  if (propsData.virtualYConfig && propsData.virtualYConfig.scrollToTopOnChange !== undefined) {
    scrollToTopOnChange = propsData.virtualYConfig.scrollToTopOnChange
  }
  // 滚动模式下滚动条不到顶
  if (pageMode.value !== 'page') {
    scrollToTopOnChange = false
  }
  if (propsData.virtualYConfig) {
    propsData['virtualYConfig']['scrollToTopOnChange'] = scrollToTopOnChange
  }
  else {
    propsData['virtualYConfig'] = {
      enabled: true,
      // 数据变动后滚动条还原到顶
      scrollToTopOnChange,
    }
  }

  // 扩展功能
  if (
    getDataFmtList().length > 0 // 合并行
    && hasMergeRow()
  ) {
    // 如果有合并行，则关闭纵向虚拟滚动、行样式
    propsData['rowConfig'] = { isCurrent: false, isHover: false }
    propsData['virtualYConfig'] = { enabled: false }
    propsData['stripe'] = false
    if (!propsData['spanMethod']) {
      propsData['spanMethod'] = handleRowMerge
    }
  }

  // 表尾行统计
  // 左边固定列、合并行、合计行三者出现会导致左边固定列出滚动条
  // 暂时解决方案为去掉合计行（以上问题已修复，去掉条件判断）
  const notFilter = hasNotFilter()
  const hasSum = hasSumColumn()

  // 浮动筛选配置
  if (propsValues.filterMode === 'floating' && !notFilter) {
    propsData['floatingFilterConfig'] = { enabled: true }
  }

  // 隐藏列头筛选图标
  propsData['filterConfig'] = { showIcon: false }

  // 浮动筛选模式下，只有合计列才显示底部；底部筛选模式下有筛选列或合计列都显示
  const showFooterInFloating = filterMode.value === 'floating' && hasSum
  const showFooterInFooterMode = filterMode.value === 'footer' && (hasSum || !notFilter)
  if (showFooterInFloating || showFooterInFooterMode) {
    propsData['showFooter'] = true
    if (!propsData['footerMethod']) {
      propsData['footerMethod'] = ({ columns, data }) => {
        const result = handleRowSum({ columns, data })
        if (result.length > 0 && getSumSourceRef.value && Object.keys(getSumSourceRef.value).length > 0) {
          // 使用外部传入的汇总数据覆盖
          for (const [i, column] of columns.entries()) {
            if (Object.hasOwn(getSumSourceRef.value, column.field) && i < result[0]!.length) {
              result[0]![i] = getSumSourceRef.value[column.field]
            }
          }
        }
        return result
      }
    }
  }
  return propsData
})

// 分页信息
const getPaginationBindValues = computed<any>(() => {
  const paginationInfo = unref(getPaginationInfo)
  if (isBoolean(paginationInfo))
    return paginationInfo
  const pagination = paginationInfo as PaginationProps
  const propsData: Recordable = {
    ...unref(pagination),
    disabled: pageMode.value === 'scroll',
  }
  return propsData
})

/** 可否高级查询 */
function canAdSearch() {
  const { advSearchDisabled } = unref(getProps)
  if (advSearchDisabled === true)
    return false
  const data = getDataFmtList()
  if (data.length > 0) {
    return (
      data.find((f) => {
        if (f.isfilter === false)
          return false
        return true
      }) != null
    )
  }

  return false
}

/** 可否设置格式 */
function canSetting() {
  const { settingDisabled } = unref(getProps)
  return settingDisabled === false && getDataFmtList().length > 0
}

/** 刷新 */
async function refresh() {
  clearCheckBox()
  await fetch()
}

// 列格式改动后
function resizableChange(data: any) {
  if (canSetting()) {
    columnResizable(data)
  }
}

// 列拖动后事件
function columnDragChange(data: any) {
  if (canSetting()) {
    handleColumnDrop(data)
  }
}

// 页码切换
async function updatePage(page) {
  clearCheckBox()
  setPagination({ page })
  await fetch()
}

// 分页数量切换
function updatePageSize(size) {
  setPagination({ page: 1, pageSize: size })
  fetch()
}

function reload() {
  clearCheckBox()
  tableElRef.value.reloadData(getDataSourceRef.value)
}

function getData() {
  return unref(getDataSourceRef) as Recordable[]
}

function getFullData() {
  return tableElRef.value.getFullData()
}

function setData(data: Recordable[]) {
  setDataSource(data)
  tableElRef.value.reloadData(getDataSourceRef.value)
}

function getCheckboxRows() {
  return tableElRef.value.getCheckboxRecords()
}

function removeCheckboxRow() {
  return tableElRef.value.removeCheckboxRow()
}

async function insert(record: any) {
  const $table = tableElRef.value
  const { row: newRow } = await $table.insertAt(record, 0)
  await $table.setEditCell(newRow, 'id')
}

function editRowEvent(row: any) {
  const $table = tableElRef.value
  $table.setEditRow(row)
}

function remove(row: any) {
  tableElRef.value.remove(row)
}

// 重新计算表格高度
function redoHeight() {
  computeTableHeight()
}

function recalculate() {
  // 推迟到下一个 DOM 更新周期之后执行
  nextTick(() => {
    setTimeout(() => {
      tableElRef.value?.recalculate?.(true)
    }, 5)
  })
}

const tableAction: TableActionType = {
  fetch,
  buildColumn,
  resetColumn,
  getDataFmtList,
  saveDataFmt,
  resetDataFmt,
  clear,
  reloadData,
  advSearch,
}

createTableContext({ ...tableAction, wrapRef, getBindValues: getTableBindValues, isShowTable })

/** 计算网格高度 */
function computeTableHeight() {
  const table = unref(tableElRef)
  if (!table)
    return
  if (!unref(getCanResize))
    return

  nextTick(() => {
    const tableEl = table.$el
    if (!tableEl) {
      return
    }
    const headEl = tableEl.querySelector('.vxe-table--header')
    if (!headEl) {
      return
    }
    const headTop = headEl.getBoundingClientRect().top
    // fitContainer模式：以弹窗内容区(.vxe-modal--body)底部为下边界（代替视口）。
    // 表头与内容区都随弹窗移动、间距恒定，不受打开动画影响
    const containerEl = props.fitContainer
      ? tableEl.closest('.vxe-modal--body') as HTMLElement | null
      : null
    let bottomIncludeBody: number
    if (containerEl) {
      // 网格下方同容器的元素（如辅助核算表单）需完整可见，扣除其占用高度。
      // 占用高度 = 下方元素底边 - 网格当前底边（含间距；网格高度变化时下方元素同步平移，差值不变）
      const gridBottom = tableEl.getBoundingClientRect().bottom
      let belowSpace = 0
      let below: Element | null = tableEl.nextElementSibling
      while (below) {
        const belowStyle = getComputedStyle(below)
        // 跳过绝对/固定定位和隐藏的元素
        if (belowStyle.position === 'static' && belowStyle.display !== 'none') {
          const belowRect = below.getBoundingClientRect()
          if (belowRect.height > 0)
            belowSpace = Math.max(belowSpace, belowRect.bottom - gridBottom)
        }
        below = below.nextElementSibling
      }
      // 预留底部间隙，避免网格贴住弹窗footer
      bottomIncludeBody = containerEl.getBoundingClientRect().bottom - headTop - belowSpace - 10
      // 向上找到弹窗内容区的直接子元素，供 ResizeObserver 监听下方内容变化
      let walker = tableEl as HTMLElement
      while (walker.parentElement && walker.parentElement !== containerEl)
        walker = walker.parentElement
      if (walker.parentElement === containerEl)
        siblingResizeRef.value = walker
    }
    else {
      bottomIncludeBody = getViewportOffset(headEl).bottomIncludeBody
    }
    let paginationH = 0
    let marginH = 0
    const paginationInfo = unref(getPaginationBindValues)
    if (!isBoolean(paginationInfo)) {
      const pagination = unref(paginationRef)
      const paginationEl = pagination as HTMLElement
      if (paginationEl) {
        const offsetHeight = paginationEl.offsetHeight
        paginationH = offsetHeight || 28
        // 分页区顶部有12px内边距，抵消掉
        marginH = -12
      }
      else {
        // 分页配置存在但DOM未渲染，按默认分页条高度预估
        paginationH = 28
        marginH = 0
      }
    }
    let height
      = bottomIncludeBody - (paginationH + marginH + (props.resizeHeightOffset || 0))
    const minHeight = props.resizeMinHeight
    if (minHeight && minHeight > height) {
      height = minHeight
    }
    const maxHeight = props.maxHeight
    height = maxHeight && maxHeight < height ? maxHeight : height
    deviceHeight.value = height
  })
}

useWindowSizeFn<void>(computeTableHeight, 100)

// 防抖重算高度和列宽
const debouncedResize = useDebounceFn(() => {
  computeTableHeight()
  tableElRef.value?.recalculate?.(false)
}, 100)

// 监听容器大小变化（如菜单折叠、全屏切换）
useResizeObserver(wrapRef, debouncedResize)

// fitContainer模式：监听弹窗内容元素，网格下方内容变化时触发重算
useResizeObserver(siblingResizeRef, debouncedResize)

onMounted(() => {
  computeTableHeight()
})

onActivated(() => {
  computeTableHeight()
})

// 网格事件单独emit触发，使用$attrs导致emit发出警告
function onCellDblclick(e: any) {
  emit('cell-dblclick', e)
}
function onCheckboxChange(e: any) {
  emit('checkbox-change', e)
}
function clearCheckBox() {
  onCheckboxChange({ records: [] })
  tableElRef.value.clearCheckboxRow()
}
function onGridSortChange(e) {
  const { property, order } = e
  const propsValues = unref(getProps)
  if (propsValues.remoteSort) {
    if (order) {
      fetch({
        searchOrder: [
          {
            column: property,
            value: order === 'asc' ? 0 : 1,
          },
        ],
      })
    }
    else {
      fetch({ searchOrder: [] })
    }
  }
  emit('sort-change', e)
  clearCheckBox()
}
function onRadioChange(e: any) {
  emit('radio-change', e)
}
function onEditClosed(e: any) {
  emit('edit-closed', e)
}
function onEditActived(e: any) {
  emit('edit-actived', e)
}
function onEditDisabled(e: any) {
  emit('edit-disabled', e)
}
function onCurrentChange(e: any) {
  emit('current-change', e)
}
function onDataChange(e: any) {
  emit('data-change', e)
}

const handleScrollBottom = useThrottleFn(async () => {
  if (pageMode.value !== 'scroll') {
    return
  }

  const paginationInfo = unref(getPaginationInfo)
  if (isBoolean(paginationInfo))
    return
  const pagination = paginationInfo as PaginationProps
  const page = pagination.page || 1
  const itemCount = pagination.itemCount || 1
  const pageSize = pagination.pageSize || 30
  const currentTotalPage = Math.ceil(itemCount / pageSize)
  if (page >= currentTotalPage)
    return

  setPagination({ page: page + 1 })
  await fetch({ scrollMode: true })
}, 600)

function onScroll({ isBottom }) {
  if (isBottom) {
    handleScrollBottom()
  }
}

defineExpose({
  table: tableElRef,
  search,
  reload,
  reloadData,
  refresh,
  fetch,
  clear,
  getData,
  // 外部很多已使用getDataSource而不是getData
  getDataSource: getData,
  setData,
  redoHeight,
  recalculate,
  getColumns,
  setColumns,
  buildColumn,
  loadFormat,
  getDeviceHeight,
  getSearchFilter,
  getSearchOrder,
  getCheckboxRows,
  clearCheckBox,
  insert,
  removeCheckboxRow,
  editRowEvent,
  remove,
  getLoading,
  setLoading,
  getDataFmt,
  getDataFmtList,
  advSearch,
  getFullData,
})
</script>

<template>
  <div ref="wrapRef">
    <div v-if="getProps.showToolbar" class="table-toolbar">
      <!-- 顶部左侧区域 -->
      <div class="table-toolbar-left flex items-center">
        <template v-if="getProps.title">
          <div class="table-toolbar-left-title">
            {{ getProps.title }}
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon class="ml-1 cursor-pointer text-gray-400" size="18">
                  <Icon icon="ant-design:question-circle-outlined" />
                </n-icon>
              </template>
              {{ getProps.titleTooltip }}
            </n-tooltip>
          </div>
        </template>
        <slot v-if="$slots.toolbarLeft" name="toolbarLeft" />
        <n-flex :wrap="false">
          <n-button-group v-if="getProps.showQueryBtn || getProps.showResetBtn">
            <n-button v-if="getProps.showQueryBtn" type="primary" :loading="getLoading" @click="search">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:reload-outlined" />
                </n-icon>
              </template>
              查询
            </n-button>
            <n-button v-if=" getProps.showResetBtn" @click="resetData">
              重置
            </n-button>
          </n-button-group>

          <slot v-if="$slots.toolbarLeftBtn" name="toolbarLeftBtn" />
        </n-flex>
      </div>

      <div v-if="getProps.showToolbarRight" class="table-toolbar-right flex items-center">
        <!-- 顶部右侧区域 -->
        <slot name="toolbarRight" />

        <!-- 分页模式 -->
        <n-tooltip v-if="getProps.showPageMode" trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon">
              <n-dropdown
                v-model:value="pageMode"
                :options="pageModeOptions"
                trigger="hover"
                @select="pageModeSelect"
              >
                <n-icon size="18">
                  <Icon icon="ant-design:appstore-outlined" />
                </n-icon>
              </n-dropdown>
            </div>
          </template>
          <span>分页模式</span>
        </n-tooltip>

        <!-- 重置条件 -->
        <n-tooltip v-if="filterOptions.some((q) => q.isfilter)" trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon" @click="reloadData">
              <n-icon size="18">
                <Icon icon="ant-design:clear-outlined" />
              </n-icon>
            </div>
          </template>
          <span>重置条件</span>
        </n-tooltip>

        <AdSearch v-if="canAdSearch()" />

        <!-- 刷新 -->
        <n-tooltip v-if="getProps.showReload" trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon" @click="refresh">
              <n-icon size="18">
                <Icon icon="ant-design:reload-outlined" />
              </n-icon>
            </div>
          </template>
          <span>刷新</span>
        </n-tooltip>

        <!-- 筛选模式 -->
        <n-tooltip v-if="getProps.showFilterMode && filterOptions.some((q) => q.isfilter)" trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon">
              <n-dropdown
                v-model:value="filterMode"
                :options="filterModeOptions"
                trigger="hover"
                @select="filterModeSelect"
              >
                <n-icon size="18">
                  <Icon :icon="filterMode === 'floating' ? 'ant-design:filter-outlined' : 'ant-design:filter-filled'" />
                </n-icon>
              </n-dropdown>
            </div>
          </template>
          <span>筛选模式</span>
        </n-tooltip>

        <!-- 密度 -->
        <n-tooltip trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon">
              <n-dropdown
                v-model:value="tableSize"
                :options="densityOptions"
                trigger="hover"
                @select="densitySelect"
              >
                <n-icon size="18">
                  <Icon icon="ant-design:column-height-outlined" />
                </n-icon>
              </n-dropdown>
            </div>
          </template>
          <span>密度</span>
        </n-tooltip>

        <Settings v-if="canSetting()" />
      </div>
    </div>
    <div v-if="isShowTable">
      <AdvInputModal ref="advInputModal" />
      <vxe-grid
        ref="tableElRef"
        v-bind="getTableBindValues"
        :size="tableSize"
        :loading="getLoading"
        :data="getDataSourceRef"
        :seq-config="getSeqConfig"
        :data-filter-mode="filterMode"
        :data-has-filter="!hasNotFilter()"
        @column-resizable-change="resizableChange"
        @column-dragend="columnDragChange"
        @cell-dblclick="onCellDblclick"
        @checkbox-change="onCheckboxChange"
        @checkbox-all="onCheckboxChange"
        @sort-change="onGridSortChange"
        @radio-change="onRadioChange"
        @edit-closed="onEditClosed"
        @edit-actived="onEditActived"
        @edit-disabled="onEditDisabled"
        @current-change="onCurrentChange"
        @scroll="onScroll"
        @data-change="onDataChange"
      >
        <template #pager>
          <div v-if="getPaginationBindValues" ref="paginationRef" class="pagination">
            <n-pagination
              v-bind="getPaginationBindValues"
              @update:page="updatePage"
              @update:page-size="updatePageSize"
            >
              <template #prefix="{ itemCount }">
                共 {{ itemCount }} 条
              </template>
            </n-pagination>
          </div>
        </template>

        <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
          <slot v-bind="data" :name="item" />
        </template>

        <!-- 序号列底部筛选 - 显示合计值和筛选文字 -->
        <template #seq_filter="{ _columnIndex, $rowIndex, items }">
          <div
            v-if="(hasNotFilter() || $rowIndex === 0) && items[_columnIndex]"
            class="flex flex-1 justify-center"
          >
            {{ items[_columnIndex] }}
          </div>
          <div
            v-if="filterOptions.some((q) => q.isfilter) && (!hasSumColumn() || $rowIndex > 0)"
            class="flex flex-1 justify-center text-gray-500"
          >
            筛选
          </div>
        </template>

        <!-- 序号列浮动筛选 - 显示筛选文字 -->
        <template #seq_floating_filter>
          <div v-if="filterOptions.some((q) => q.isfilter)" class="flex flex-1 justify-center text-gray-500">
            筛选
          </div>
        </template>

        <!-- checkbox列底部筛选 - 重置条件按钮 -->
        <template #checkbox_filter="{ $rowIndex }">
          <div
            v-if="!getProps.checkboxDisabled && filterOptions.some((q) => q.isfilter) && (!hasSumColumn() || $rowIndex > 0)"
            class="flex flex-1 justify-center"
          >
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button circle quaternary @click="reloadData">
                  <template #icon>
                    <n-icon><Icon icon="ant-design:clear-outlined" /></n-icon>
                  </template>
                </n-button>
              </template>
              <span>重置条件</span>
            </n-tooltip>
          </div>
        </template>

        <!-- checkbox列浮动筛选 - 重置条件按钮 -->
        <template #checkbox_floating_filter>
          <div v-if="!getProps.checkboxDisabled && filterOptions.some((q) => q.isfilter)" class="flex flex-1 justify-center">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button circle quaternary @click="reloadData">
                  <template #icon>
                    <n-icon><Icon icon="ant-design:clear-outlined" /></n-icon>
                  </template>
                </n-button>
              </template>
              <span>重置条件</span>
            </n-tooltip>
          </div>
        </template>

        <!-- 筛选组件 -->
        <template
          v-for="(item, key) in filterOptions"
          #[`${item.column}_filter`]="{ _columnIndex, $rowIndex, items }"
          :key="key"
        >
          <!-- 底部筛选模式才显示筛选组件 -->
          <template v-if="filterMode === 'footer'">
            <div v-if="hasNotFilter() || $rowIndex === 0">
              {{ items[_columnIndex] }}
            </div>
            <div v-if="item.isfilter && (!hasSumColumn() || $rowIndex > 0)" class="font-normal">
              <AdvInput
                :adv-search="advSearch"
                :value="item"
                placeholder="筛选"
                @select-change="advInputSearch"
                @input-entry-change="advInputSearch"
                @pick-change="advInputSearch"
                @show="advInputShow"
              />
            </div>
          </template>
          <!-- 浮动筛选模式下只显示汇总值 -->
          <template v-else>
            <div v-if="hasNotFilter() || $rowIndex === 0">
              {{ items[_columnIndex] }}
            </div>
          </template>
        </template>

        <!-- 浮动筛选组件 -->
        <template
          v-for="(item, key) in filterOptions"
          #[`${item.column}_floating_filter`]="{ option }"
          :key="`floating-${key}`"
        >
          <AdvInput
            v-if="item.isfilter"
            :adv-search="advSearch"
            :value="item"
            :floating-option="option"
            placeholder="筛选"
            @select-change="advInputSearch"
            @input-entry-change="advInputSearch"
            @pick-change="advInputSearch"
            @show="advInputShow"
          />
        </template>
      </vxe-grid>
    </div>
  </div>
</template>

<style lang="less" scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0 0 15px 0;

  &-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;

    &-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 16px;
      font-weight: 600;
      margin-right: 5px;
    }
  }

  &-right {
    display: flex;
    justify-content: flex-end;

    &-icon {
      margin-left: 12px;
      font-size: 16px;
      cursor: pointer;
      color: var(--text-color);

      :hover {
        color: v-bind(primaryColor);
      }
    }
  }
}

.pagination {
  padding: 12px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
</style>

<style lang="less">
/* 浮动筛选模式下的表头样式 - 仅在有筛选列时生效 */
.vxe-grid[data-filter-mode='floating'][data-has-filter='true'] {
  .vxe-table--header {
    thead {
      .vxe-header--row {
        &:last-child:not(:only-child) {
          background-color: #fffce4;
          .vxe-header--column:hover {
            background-color: transparent;
          }
        }
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .vxe-grid[data-filter-mode='floating'][data-has-filter='true'] {
    .vxe-table--header {
      thead {
        .vxe-header--row {
          &:last-child:not(:only-child) {
            background-color: #1d1d1d;
            .vxe-header--column:hover {
              background-color: transparent;
            }
          }
        }
      }
    }
  }
}

.table-toolbar-right-icon {
  display: flex;
  align-items: center;
}

.vxe-table {
  &--column {
    &.col--valid-error {
      .vxe-cell--valid-error-tip {
        top: 46px !important;
      }
    }
  }
}

.vxe-table--render-default {
  .vxe-body--row {
    &.row-success,
    .cell-success {
      background-color: #f0fdfa !important;
      &-100 {
        background-color: #d1fae5 !important;
      }
      &-200 {
        background-color: #a7f3d0 !important;
      }
      &-300 {
        background-color: #6ee7b7 !important;
      }
      &-400 {
        background-color: #34d399 !important;
        color: #fff;
      }
      &-500 {
        background-color: #10b981 !important;
        color: #fff;
      }
    }
    &.row-warning,
    .vxe-body--column.cell-warning {
      background-color: #fffbeb !important;
      &-100 {
        background-color: #fef3c7 !important;
      }
      &-200 {
        background-color: #fde68a !important;
      }
      &-300 {
        background-color: #fcd34d !important;
      }
      &-400 {
        background-color: #fbbf24 !important;
        color: #fff;
      }
      &-500 {
        background-color: #f59e0b !important;
        color: #fff;
      }
    }
    &.row-error,
    .vxe-body--column.cell-error {
      background-color: #fff7ed !important;
      &-100 {
        background-color: #fee2e2 !important;
      }
      &-200 {
        background-color: #fecaca !important;
      }
      &-300 {
        background-color: #fca5a5 !important;
      }
      &-400 {
        background-color: #f87171 !important;
        color: #fff;
      }
      &-500 {
        background-color: #ef4444 !important;
        color: #fff;
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .vxe-table--render-default {
    .vxe-body--row {
      &.row-success,
      &.row-warning,
      &.row-error,
      .cell-success,
      .cell-warning,
      .cell-error {
        background-color: transparent !important;
        &-100 {
          background-color: transparent !important;
        }
        &-200 {
          background-color: transparent !important;
        }
        &-300 {
          background-color: transparent !important;
        }
        &-400 {
          background-color: transparent !important;
        }
        &-500 {
          background-color: transparent !important;
        }
      }
      &.row-success,
      .vxe-body--column.cell-success {
        color: #6ee7b7;
        &-100 {
          color: #a7f3d0;
        }
        &-200 {
          color: #6ee7b7;
        }
        &-300 {
          color: #34d399;
        }
        &-400 {
          color: #10b981;
        }
        &-500 {
          color: #059669;
        }
      }
      &.row-warning,
      .vxe-body--column.cell-warning {
        color: #eab308;
        &-100 {
          color: #fde68a;
        }
        &-200 {
          color: #fcd34d;
        }
        &-300 {
          color: #fbbf24;
        }
        &-400 {
          color: #f59e0b;
        }
        &-500 {
          color: #d97706;
        }
      }
      &.row-error,
      .vxe-body--column.cell-error {
        color: #fb923c;
        &-100 {
          color: #fecaca;
        }
        &-200 {
          color: #fca5a5;
        }
        &-300 {
          color: #f87171;
        }
        &-400 {
          color: #ef4444;
        }
        &-500 {
          color: #dc2626;
        }
      }
      &.row--stripe {
        &.row-success,
        &.row-warning,
        &.row-error {
          background-color: #26262a !important;
        }
      }
      &.row--current {
        background-color: #2d2d30 !important;
      }
    }
  }
}
</style>
