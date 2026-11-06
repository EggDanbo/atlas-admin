import type { RecordFormInst } from '@/components/SpRecordForm'
import type { TableColumn } from '@/components/SpTable'
import { NButton, NDivider } from 'naive-ui'
import { defineComponent, h, ref } from 'vue'
import { SpRecordForm } from '@/components/SpRecordForm'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { request } from '@/service/http'
import toast from '@/utils/toast'

interface UseRecordActionsOptions {
  /** 数据格式名，如 atlas/crm/customer/archive；同时用来推导增删改地址 */
  format: string
  /**
   * 保存/删除后刷新列表。
   * 这里收一个函数而不是表格 ref：操作列要在 useListPage 之前生成，
   * 那时 tableRef 还没解构出来，只能延迟到真正点击时再取。
   */
  refresh: () => void
  /** 不参与编辑的派生字段 */
  readonlyFields?: string[]
  /** 弹窗宽度 */
  width?: number
  /**
   * view 只给「查看」：折旧明细、工资表、月度考勤汇总这类数据由系统算出来，
   * 允许手改就等于允许把账做错。默认 full 提供增改删。
   */
  mode?: 'full' | 'view'
  /** 删除时用于提示的行名称字段，按顺序取第一个有值的 */
  nameFields?: string[]
  /**
   * 当前页数据，用于推断枚举字段的可选值。
   * 首次渲染时表格实例还没挂上，实现方要写成 tableRef.value?.getData?.() ?? []，
   * 少一个 ?. 就会在 setup 阶段抛错、整页白屏。
   */
  rows?: () => Recordable[]
}

/**
 * 列表页的增改查动作
 *
 * 重建后的模块都是纯列表页，缺的是「点一行能看见全部字段」「能改」「能加」。
 * 这套动作在每个台账页都一样，抽出来避免二十多个页面各写一遍操作列。
 *
 * 返回的 operateColumn 直接拼进 columns，RecordFormHost 放到模板任意位置即可。
 */
export function useRecordActions(options: UseRecordActionsOptions) {
  const recordRef = ref<RecordFormInst | null>(null)

  // 与 useListPage 同一套口径：当前 tab 的权限码 + _ADD/_EDIT/_DELE 后缀。
  // 不接权限的话，只读账号也能点到删除，这类问题在演示里看不出来、上线就出事
  const { getPermission } = useTabbar()
  const { hasPermission } = usePermission()
  const permName = getPermission()
  const canAdd = computed(() => hasPermission([`${permName}_ADD`]))
  const canEdit = computed(() => hasPermission([`${permName}_EDIT`]))
  const canDelete = computed(() => hasPermission([`${permName}_DELE`]))

  const modulePath = options.format.replace(/^atlas\//, '')

  function openView(row: Recordable) {
    recordRef.value?.open({ opt: 'view', row: { ...row } })
  }

  function openEdit(row: Recordable) {
    recordRef.value?.open({ opt: 'edit', row: { ...row } })
  }

  function openCreate() {
    recordRef.value?.open({ opt: 'create' })
  }

  function rowLabel(row: Recordable) {
    for (const field of options.nameFields ?? []) {
      if (row[field])
        return String(row[field])
    }
    return String(row.id ?? '')
  }

  async function handleRemove(row: Recordable) {
    toast.infoModal(`确定删除「${rowLabel(row)}」吗？`, {
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        const { isSuccess } = await request.Post<Service.Response>(`${modulePath}/delete`, { id: row.id })
        if (!isSuccess) {
          toast.error('删除失败')
          return
        }
        toast.success('已删除')
        options.refresh()
      },
    })
  }

  const viewOnly = options.mode === 'view'

  const operateColumn: TableColumn = {
    isOperate: true,
    title: '操作',
    width: viewOnly ? 70 : 148,
    align: 'center',
    fixed: 'right',
    slots: {
      default: ({ row }: { row: Recordable }) => {
        if (viewOnly)
          return h(NButton, { text: true, type: 'primary', onClick: () => openView(row) }, () => '查看')

        return h('div', { class: 'flex items-center justify-center' }, [
          h(NButton, { text: true, type: 'primary', onClick: () => openView(row) }, () => '查看'),
          h(NDivider, { vertical: true }),
          h(NButton, { text: true, type: 'primary', disabled: !canEdit.value, onClick: () => openEdit(row) }, () => '编辑'),
          h(NDivider, { vertical: true }),
          h(NButton, { text: true, type: 'primary', disabled: !canDelete.value, onClick: () => handleRemove(row) }, () => '删除'),
        ])
      },
    },
  }

  /** 表单弹窗宿主：用稳定组件包一层，避免模板里反复创建 vnode */
  const RecordFormHost = defineComponent({
    name: 'RecordFormHost',
    setup() {
      return () =>
        h(SpRecordForm, {
          ref: recordRef,
          format: options.format,
          readonlyFields: options.readonlyFields,
          width: options.width,
          rows: options.rows?.() ?? [],
          onSaved: () => options.refresh(),
        })
    },
  })

  return { operateColumn, RecordFormHost, openView, openEdit, openCreate, handleRemove, canAdd, canEdit, canDelete }
}
