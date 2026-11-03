import type { ComputedRef } from 'vue'
import type { PaginationProps } from '../types/pagination'

import type { TableProps } from '../types/table'

import { computed, ref, unref, watch } from 'vue'
import { isBoolean } from '@/utils/is'
import { DEFAULTPAGESIZE, PAGESIZES } from '../const'

export function usePagination(refProps: ComputedRef<TableProps>) {
  const configRef = ref<PaginationProps>({})
  const show = ref(true)

  watch(
    () => unref(refProps).pagination,
    (pagination) => {
      if (!isBoolean(pagination) && pagination) {
        configRef.value = {
          ...unref(configRef),
          ...pagination,
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const getPaginationInfo = computed((): boolean | PaginationProps => {
    const { pagination } = unref(refProps)
    if (!unref(show) || (isBoolean(pagination) && !pagination)) {
      return false
    }
    return pagination !== undefined
      ? {
          page: 1, // 当前页
          pageSize: DEFAULTPAGESIZE, // 分页大小
          pageSizes: PAGESIZES, // 每页条数
          itemCount: 0,
          showSizePicker: true,
          showQuickJumper: true,
          ...(isBoolean(pagination) ? {} : pagination),
          ...unref(configRef),
        }
      : false
  })

  function setPagination(info: Partial<PaginationProps>) {
    const paginationInfo = unref(getPaginationInfo)
    configRef.value = {
      ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
      ...info,
    }
  }

  function getPagination() {
    return unref(getPaginationInfo)
  }

  function getShowPagination() {
    return unref(show)
  }

  async function setShowPagination(flag: boolean) {
    show.value = flag
  }

  return { getPagination, getPaginationInfo, setShowPagination, getShowPagination, setPagination }
}
