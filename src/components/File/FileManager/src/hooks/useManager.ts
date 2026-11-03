import { computed, reactive, ref, unref } from 'vue'

import { file as api } from '@/service/api/misc'

export function useManager() {
  const dataSource = ref<Service.PagedList<FileStorage.FileResourceResult>>()

  interface FilterModelType {
    page: number
    xid: any
    name: string
    mark: string
    hide: number
  }

  /** 筛选条件 */
  const filterModel = reactive<FilterModelType>({
    page: 1,
    xid: null,
    name: '',
    mark: '',
    hide: 0,
  })

  async function fetch() {
    const { isSuccess, data } = await api.search({ pagesize: 35, ...filterModel })
    if (!isSuccess)
      return
    dataSource.value = data
  }

  async function remove(rows: Recordable[]) {
    const { isSuccess } = await api.delete({
      list: rows.map(m => m.id),
      xid: filterModel.xid,
      mark: filterModel.mark,
    })
    if (!isSuccess)
      return false
    await fetch()
    return true
  }

  async function uploadFinish(data: any) {
    const { isSuccess } = await api.uploadFragmentFinish(data)
    if (!isSuccess)
      return
    await fetch()
  }

  const getDataModel = computed(() => {
    const { page, pagesize, totalcount, list } = unref(dataSource)!
    return {
      list: list || [],
      page: page || 1, // 当前页
      pageSize: pagesize || 35, // 分页大小
      itemCount: totalcount || 0,
    }
  })

  return { filterModel, getDataModel, fetch, remove, uploadFinish }
}
