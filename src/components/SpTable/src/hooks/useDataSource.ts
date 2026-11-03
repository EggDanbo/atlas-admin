import type { EmitFn } from 'vue'

import type { PaginationProps } from '../types/pagination'
import type { AdvSearchFilter, AdvSearchInstance, FetchParams, TableProps } from '../types/table'
import { useTimeoutFn } from '@vueuse/core'

import { computed, onMounted, ref, unref, watch } from 'vue'
import { isAsyncFunction, isBoolean, isFunction } from '@/utils/is'
import { DEFAULTPAGESIZE, FETCHSETTING } from '../const'

interface ActionType {
  getPaginationInfo: ComputedRef<boolean | PaginationProps>
  setPagination: (info: Partial<PaginationProps>) => void
  setLoading: (loading: boolean) => void
}

/** useDataSource 涉及的事件类型定义 */
interface DataSourceEmits {
  'fetch-success': [result: { items: Recordable[], totalcount: number }]
  'fetch-error': [error: unknown]
}

/**
 * 数据源管理 Hook
 * @description 管理表格数据的获取、分页、缓存和状态
 */
export function useDataSource(
  propsRef: ComputedRef<TableProps>,
  { getPaginationInfo, setPagination, setLoading }: ActionType,
  emit: EmitFn<DataSourceEmits>,
  advSearch: AdvSearchInstance,
) {
  /** 表格数据源 */
  const dataSourceRef = ref<Recordable[]>([])
  /** 汇总数据源（用于显示统计行） */
  const sumSourceRef = ref<Recordable>({})
  /** 高级筛选条件缓存 */
  const searchFilterRef = ref<AdvSearchFilter[]>([])
  /** 排序条件缓存 */
  const searchOrderRef = ref<Recordable[]>([])

  /**
   * 监听外部数据源变化
   * @description 当未配置 fetchData 时，直接使用传入的 dataSource
   */
  watch(
    () => unref(propsRef).dataSource,
    (dataSource) => {
      const { fetch }: any = unref(propsRef)
      if (!fetch && dataSource) {
        dataSourceRef.value = dataSource
      }
    },
    { immediate: true },
  )

  const getDataSourceRef = computed(() => unref(dataSourceRef))
  const getSumSourceRef = computed(() => unref(sumSourceRef))

  /**
   * 远程数据获取
   * @description 核心数据获取方法，处理分页、筛选、排序等逻辑
   * @param opt - 可选的请求参数，包含分页、筛选条件等
   * @returns 当前页的数据数组
   */
  async function remoteFetch(opt?: FetchParams) {
    const props = unref(propsRef)
    const { fetchData, pagination, fetchSetting } = props

    // 校验 fetchData 是否为有效函数
    if (!fetchData || !(isFunction(fetchData) || isAsyncFunction(fetchData)))
      return

    try {
      setLoading(true)

      // ========== 构建分页参数 ==========
      const { pagedField, pageField, sizeField, dataField, totalField, sumField }
        = Object.assign({}, FETCHSETTING, fetchSetting)

      const { page = 1, pageSize = DEFAULTPAGESIZE } = unref(getPaginationInfo) as PaginationProps

      // 判断是否需要分页：pagination 为 false 或 getPaginationInfo 为布尔值时禁用分页
      const paginationDisabled = (isBoolean(pagination) && !pagination) || isBoolean(getPaginationInfo)

      const pageParams: Recordable = paginationDisabled
        ? {}
        : {
            [pageField]: (opt?.[pageField]) || page,
            [sizeField]: pageSize,
          }

      // ========== 合并筛选条件 ==========
      const advFilter = advSearch.getFilter()

      // 合并外部传入的筛选条件
      if (opt?.searchFilter) {
        advFilter.push(...opt.searchFilter)
      }

      // 更新排序条件
      if (opt?.searchOrder) {
        searchOrderRef.value = opt.searchOrder
      }

      searchFilterRef.value = advFilter

      // ========== 重置逻辑 ==========
      // reset 为 true 时清空筛选和排序，重置到第一页
      if (opt?.reset) {
        searchFilterRef.value = []
        searchOrderRef.value = []
        pageParams[pageField] = 1
        pageParams.reset = true
        setPagination({ page: 1 })
      }

      // ========== 发起请求 ==========
      const params = {
        ...pageParams,
        searchFilter: searchFilterRef.value,
        searchOrder: searchOrderRef.value,
      }

      const res = await fetchData(params)

      // ========== 处理空响应 ==========
      if (!res) {
        sumSourceRef.value = {}
        setPagination({ page: 1, itemCount: 0 })
        emit('fetch-success', { items: [], totalcount: 0 })
        return []
      }

      // ========== 解析响应数据 ==========
      const isArrayResult = Array.isArray(res)
      const paged = pagedField ? res[pagedField] : res
      const totalcount: number = isArrayResult ? 0 : (paged[totalField] || 0)
      const resultItems: Recordable[] = isArrayResult ? res : (res[dataField] || [])

      // ========== 处理汇总数据 ==========
      sumSourceRef.value = res[sumField] || {}

      // ========== 计算当前页码 ==========
      // 当删除数据后当前页可能超出范围，需要自动跳转到最后一页
      let currPage = paged[pageField] || opt?.[pageField]
      if (!currPage && totalcount) {
        const currentTotalPage = Math.ceil(totalcount / pageSize)
        if (page > currentTotalPage) {
          currPage = currentTotalPage
        }
      }

      // ========== 更新数据源 ==========
      // 滚动模式：追加数据（用于无限滚动场景）
      // 普通模式：替换数据
      if (opt?.scrollMode) {
        dataSourceRef.value.push(...resultItems)
      }
      else {
        dataSourceRef.value = resultItems
      }

      setPagination({
        page: currPage || 1,
        itemCount: totalcount,
      })

      emit('fetch-success', {
        items: resultItems,
        totalcount,
      })

      return resultItems
    }
    catch (error) {
      console.error('fetch-error', error)
      emit('fetch-error', error)
      dataSourceRef.value = []
      setPagination({ itemCount: 0 })
    }
    finally {
      setLoading(false)
    }
  }

  /** 清空所有数据和状态 */
  function clear() {
    searchFilterRef.value = []
    searchOrderRef.value = []
    dataSourceRef.value = []
    sumSourceRef.value = {}
    setPagination({ page: 1, itemCount: 0 })
  }

  /** 设置表格数据源 */
  function setDataSource(data: Recordable[]) {
    dataSourceRef.value = data
  }

  /** 设置汇总数据 */
  function setSumSource(data: Recordable) {
    sumSourceRef.value = data
  }

  /** 获取当前筛选条件 */
  function getSearchFilter() {
    return searchFilterRef.value
  }

  /** 获取当前排序条件 */
  function getSearchOrder() {
    return searchOrderRef.value
  }

  /** 触发数据获取 */
  function fetch(opt?: FetchParams) {
    return remoteFetch(opt)
  }

  /**
   * 组件挂载后自动加载数据
   * @description 延迟 16ms 执行，确保组件已完成初始化
   */
  onMounted(() => {
    useTimeoutFn(() => {
      if (unref(propsRef).immediate) {
        fetch()
      }
    }, 16)
  })

  return {
    getDataSourceRef,
    getSumSourceRef,
    setDataSource,
    setSumSource,
    fetch,
    clear,
    getSearchFilter,
    getSearchOrder,
  }
}
