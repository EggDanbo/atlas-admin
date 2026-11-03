import type { UseListPageOptions, UseListPageReturn } from './types'
import type { PrintInst } from '@/components/Print'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { getNestedValue } from '@/hooks/detail/utils'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
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
 *     format: 'organ/team',
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
    if (!api.export)
      return
    pageLoading.value = true
    const { isSuccess, data } = await api.export({
      ...buildFetchParams({ ids }),
      searchfilter: tableRef.value?.getSearchFilter(),
    } as Q).finally(() => pageLoading.value = false)
    if (!isSuccess)
      return
    location.href = data
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
    // Refs
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
