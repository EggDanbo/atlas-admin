import type { UseListPageOptions, UseListPageReturn } from './types'
import type { PrintInst } from '@/components/BizPrint'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { getNestedValue } from '@/hooks/detail/utils'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { request } from '@/service/http'
import toast from '@/utils/toast'

/**
 * 列表页面通用 Hook
 *
 * 封装列表页面的通用逻辑：Refs 管理、权限检查、表格配置、导出打印、编辑回调等
 *
 * @template Q 查询模型类型
 * @template T 行数据类型
 *
 * @example
 * // 基本用法（分页 + 导出/打印）
 * function createQueryModel() {
 *   return {
 *     format: 'atlas/access/unit',
 *     filter: null as string | null,
 *     stoped: null as string | null,
 *   }
 * }
 * type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition
 *
 * const { tableRef, queryModel, gridOptions, handleEdit, handleExportOrPrint, ... } = useListPage<QueryModel>({
 *   api,                    // { search, export?, print? }
 *   detailRef,
 *   createQueryModel,
 *   columns: [
 *     { field: 'code', slots: { default: ({ row }) => [h('a', { onClick: () => handleEdit('view', row) }, row.code)] } },
 *     { isOperate: true, title: '操作', slots: { default: 'operate' } },
 *   ],
 * })
 *
 * @example
 * // 非分页模式（如角色管理）
 * const { ... } = useListPage<QueryModel>({
 *   api: { search: roleApi.list },  // 适配 API 方法名
 *   detailRef,
 *   createQueryModel: () => ({ format: '', name: null, kind: null }),
 *   columns: [...],
 *   gridOptions: {
 *     dataFormat: 'permit/role',
 *     pagination: false,
 *     showPageMode: false,
 *   },
 * })
 *
 * @example
 * // 嵌套 ID 字段（如用户角色）
 * const { handleEdit, getId } = useListPage<QueryModel>({
 *   api,
 *   detailRef,
 *   idField: 'role.id',  // 支持嵌套路径
 *   columns: [...],
 * })
 * // getId(row) 返回 row.role.id
 * // handleEdit('edit', row) 打开 { 'role.id': row.role.id, opt: 'edit' }
 *
 * @example
 * // 自定义编辑处理（覆盖默认 handleEdit）
 * const { handleEdit } = useListPage<QueryModel>({
 *   api,
 *   detailRef,
 *   customHandleEdit: (action, row, extra) => {
 *     if (action === 'copy') {
 *       detailRef.value?.open({ id: row.id, opt: 'edit', isCopy: true })
 *     } else {
 *       // 调用默认处理...
 *     }
 *   },
 * })
 */
export function useListPage<
  Q extends Service.SearchCondition = Service.SearchCondition,
  T extends Recordable = Recordable,
>(
  options: UseListPageOptions<Q, T>,
): UseListPageReturn<Q, T> {
  const {
    api,
    detailRef = ref(null),
    createQueryModel,
    columns = [],
    idField = 'id',
    rowClassName,
    cellClassName,
    beforeFetch,
    gridOptions: customGridOptions,
    customHandleEdit,
  } = options

  // === Refs 管理 ===
  const tableRef = ref<TableInstance>({} as TableInstance)
  const pageLoading = ref(false)
  const pdfSettingRef = ref<PrintInst | null>(null)
  const queryModel = reactive(createQueryModel()) as Q

  // === 权限计算 ===
  const { getCurrentTab, getPermission } = useTabbar()
  const { hasPermission } = usePermission()

  const currentTab = getCurrentTab()
  const tabPermName = getPermission(currentTab)
  const tabPermNameRef = ref(tabPermName)

  const hasPermAdd = hasPermission([`${tabPermName}_ADD`])
  const hasPermEdit = hasPermission([`${tabPermName}_EDIT`])
  const hasPermDele = hasPermission([`${tabPermName}_DELE`])
  const hasPermExport = hasPermission([`${tabPermName}_EXPORT`])
  const hasPermPrint = hasPermission([`${tabPermName}_PRINT`])

  // === 工具函数 ===
  /**
   * 默认导出实现
   *
   * 页面只声明了 search，导出就一直点不动。既然每张列表的 format 都写在
   * createQueryModel 里，导出地址可以由它推导，不必给二十多个 api 文件
   * 各补一个 export 方法。
   */
  async function defaultExport(params: Q) {
    const format = String((createQueryModel() as Recordable).format ?? '')
    if (!format)
      return { isSuccess: false, data: '' } as Service.Result<string>
    return request.Post<Service.Result<string>>(`${format.replace(/^atlas\//, '')}/export`, params)
  }

  function getId(row: T): string {
    return getNestedValue(row, idField) ?? row.id
  }

  /**
   * 请求参数构建：查询/导出/打印统一经过 beforeFetch，
   * 保证业务侧对查询模型的转换（如年份、日期格式化）在三个出口一致生效
   */
  function buildFetchParams(extra: Recordable = {}): Q {
    const merged = { ...extra, ...queryModel } as Q
    return (beforeFetch ? beforeFetch(merged) : merged) as Q
  }

  // === Grid 配置 ===
  const gridOptions = reactive<TableProps>({
    // 行样式
    rowClassName: rowClassName ?? (({ row }) => {
      if ((row as T).stoped)
        return 'row-warning'
      return null
    }),
    // 单元格样式
    cellClassName: cellClassName ?? (() => {
      return null
    }),
    dataFormat: (queryModel as Service.SearchCondition).format,
    columns: columns as TableColumn[],
    async fetchData(params) {
      const { isSuccess, data } = await api.search(buildFetchParams(params))
      return isSuccess ? data : []
    },
    resetData: () => Object.assign(queryModel, createQueryModel()),
    // 合并自定义配置
    ...customGridOptions,
  })

  // === editAction ===
  async function editAction(action: string) {
    const actionLower = action.toLowerCase()
    if (actionLower === 'add')
      await tableRef.value?.search()
    if (actionLower === 'edit')
      await tableRef.value?.refresh()
  }

  // === openDetail ===
  function openDetail(params?: Recordable) {
    detailRef.value?.open(params)
  }

  // === handleEdit ===
  function handleEdit(action: string, row?: T, extra?: Recordable) {
    // 支持自定义处理
    if (customHandleEdit) {
      customHandleEdit(action, row, extra)
      return
    }
    // 默认处理
    const actionLower = action.toLowerCase()
    if (actionLower === 'add') {
      detailRef.value?.open()
    }
    else if (actionLower === 'view' && row) {
      detailRef.value?.open({ [idField]: getId(row), ...extra })
    }
    else if (actionLower === 'edit' && row) {
      detailRef.value?.open({ [idField]: getId(row), opt: 'edit', ...extra })
    }
  }

  // === 导出 Excel ===
  async function handleExportExcel(ids: string[]) {
    const exportApi = api.export ?? defaultExport
    pageLoading.value = true
    const { isSuccess, data } = await exportApi({
      ...buildFetchParams({ ids }),
      searchfilter: tableRef.value?.getSearchFilter(),
    } as Q).finally(() => pageLoading.value = false)
    if (!isSuccess)
      return
    downloadFromUrl(data)
  }

  /**
   * 触发下载
   *
   * mock 返回的是 data URL。Chrome 明确禁止顶层导航到 data: 地址
   * （Not allowed to navigate top frame to data URL），原先用 location.href
   * 赋值会静默失败——点了导出没有任何反应，也不报错。
   * 用 a[download] 触发才不受这条限制；真实后端的 http 地址仍然直接跳转。
   */
  function downloadFromUrl(url: string) {
    if (!url.startsWith('data:')) {
      location.href = url
      return
    }
    const link = document.createElement('a')
    link.href = url
    // 文件名用页面标题，权限码当兜底：CRM_CUSTOMER_ARCHIVE.csv 发出去没人看得懂
    const title = currentTab?.meta?.title || tabPermName || 'export'
    link.download = `${title}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // === 打印 ===
  function handlePrint(key: string, ids: string[]) {
    if (!api.print) {
      toast.warning('未配置打印服务')
      return
    }
    pdfSettingRef.value?.show({
      name: `${(queryModel as any).format}/${key}`,
      direct: false,
      async callback(setting: any, print: any) {
        pageLoading.value = true
        const { isSuccess, data } = await api.print!({
          ...buildFetchParams({ print_setting: setting, ids }),
          searchfilter: tableRef.value?.getSearchFilter(),
        } as Q).finally(() => pageLoading.value = false)
        if (!isSuccess)
          return
        print(data)
      },
    })
  }

  // === handleExportOrPrint ===
  async function handleExportOrPrint(key: string, rows: T[]) {
    const execute = (selectedRows: T[]) => {
      const ids = selectedRows.map(getId)
      if (key === 'excel') {
        handleExportExcel(ids)
      }
      else {
        handlePrint(key, ids)
      }
    }

    if (rows.length > 0) {
      toast.infoModal('表格有选中的数据行，只输出选中的数据行吗？', {
        positiveText: '是',
        negativeText: '否',
        onPositiveClick: () => execute(rows),
        onNegativeClick: () => execute([]),
      })
    }
    else {
      execute([])
    }
  }

  // === refresh ===
  function refresh() {
    tableRef.value?.refresh()
  }

  return {
    tableRef: tableRef as any,
    pageLoading,
    pdfSettingRef,
    queryModel,
    gridOptions,

    // 权限
    tabPermName: tabPermNameRef,
    hasPermAdd,
    hasPermEdit,
    hasPermDele,
    hasPermExport,
    hasPermPrint,

    // 方法
    editAction,
    handleEdit,
    openDetail,
    handleExportOrPrint,
    refresh,
    getId,
  }
}
