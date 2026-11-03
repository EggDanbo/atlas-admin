import type { FormInst } from 'naive-ui'
import type {
  DetailParams,
  PermissionConfig,
  UseDetailFullOptions,
  UseDetailFullReturn,
  UseDetailReadonlyOptions,
  UseDetailReadonlyReturn,
} from './types'
import type { OpenModal } from '@/components/SpModal'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { applyData, getNestedValue, resolveDynamicTitle, resolveTitle, safeCall } from './utils'

// 重新导出类型和工具函数，方便外部使用
export * from './types'
export { createTransformer } from './utils'

// ============ 只读模式实现 ============

function useDetailReadonly<TForm extends Recordable>(
  options: UseDetailReadonlyOptions<TForm>,
): UseDetailReadonlyReturn<TForm> {
  const { api, createFormModel, idField = 'id', transform, onBeforeOpen, onOpen } = options

  const { clearTabState, getCurrentTab, getTitle } = useTabbar()

  // 自动从 Tab 获取标题
  const currentTab = getCurrentTab()
  const tabTitle = getTitle(currentTab)

  // 解析标题（传入的 title.base 为空时使用 tab 标题）
  const titles = resolveTitle(options.title, tabTitle ?? '')

  const modalRef = ref<any>(null)
  const params = ref<DetailParams>({})
  const formModel = reactive(createFormModel()) as TForm
  const isReadonly = computed(() => true)

  /** 从参数中获取 ID（支持嵌套路径，如 'role.id'） */
  const getArgId = (args: any): string | undefined => {
    if (!args)
      return undefined
    // 尝试从 idField 获取（支持嵌套）
    const id = getNestedValue(args, idField)
    return id ?? args.id
  }

  async function view(id?: string) {
    if (!id)
      return
    const { isSuccess, data } = await api.get(id)
    if (!isSuccess)
      return

    applyData(formModel, createFormModel, data, transform)
    modalRef.value?.setProps({ title: resolveDynamicTitle(titles, 'view', data, params.value) })
    modalRef.value?.open()
  }

  async function refresh() {
    const id = getArgId(params.value)
    if (!id)
      return
    const { isSuccess, data } = await api.get(id)
    if (!isSuccess)
      return
    applyData(formModel, createFormModel, data, transform)
  }

  const exposed: OpenModal = {
    open: async (args?: any) => {
      params.value = args || {}

      // 打开前回调
      if (onBeforeOpen && !(await safeCall(onBeforeOpen, params.value))) {
        return
      }

      await view(getArgId(args))

      // 打开后回调
      await safeCall(onOpen, params.value)
    },
  }

  return {
    isReadonly,
    params,
    formModel,
    modalRef,
    exposed,
    view,
    refresh,
    clearTabState,
  }
}

// ============ 完整模式实现 ============

function useDetailFull<TForm extends Recordable>(
  options: UseDetailFullOptions<TForm>,
): UseDetailFullReturn<TForm> {
  const {
    api,
    createFormModel,
    idField = 'id',
    permission,
    messages,
    isUpdate,
    transform,
    beforeSubmit,
    beforeView,
    beforeEdit,
    onSuccess,
    onBeforeOpen,
    onOpen,
    canEdit,
    skipEditReload = true,
  } = options

  const message = useMessage()
  const { hasPermission } = usePermission()
  const { clearTabState, addTabState, getCurrentTab, getTitle, getPermission } = useTabbar()

  // 自动从 Tab 获取标题和权限名
  const currentTab = getCurrentTab()
  const tabTitle = getTitle(currentTab)
  const tabPermName = getPermission(currentTab)

  // 解析标题（传入的 title.base 为空时使用 tab 标题）
  const titles = resolveTitle(options.title, tabTitle ?? '')

  // 解析权限配置
  const resolvedPermission: PermissionConfig | undefined = (() => {
    if (!permission)
      return undefined
    // Tab 权限配置
    if ('useTabPermission' in permission && permission.useTabPermission) {
      const permName = permission.permName ?? tabPermName
      if (!permName)
        return undefined
      return {
        add: `${permName}_ADD`,
        edit: `${permName}_EDIT`,
      }
    }
    // 普通权限配置
    return permission as PermissionConfig
  })()

  // 状态
  const isEdit = ref(false)
  const hasPerm = ref(true)
  const btnLoading = ref(false)
  const params = ref<DetailParams>({})
  const isReadonly = computed(() => false)
  const isModalOpen = ref(false) // 追踪 Modal 是否打开

  // 数据模型
  const formModel = reactive(createFormModel()) as TForm

  /** 获取当前记录 ID（支持嵌套路径，如 'role.id'） */
  const getId = (): string | undefined => getNestedValue(formModel, idField)

  /** 从参数中获取 ID（支持嵌套路径，如 'role.id'） */
  const getArgId = (args: any): string | undefined => {
    if (!args)
      return undefined
    // 尝试从 idField 获取（支持嵌套）
    const id = getNestedValue(args, idField)
    return id ?? args.id
  }

  // 引用
  const formRef = ref<FormInst | null>(null)
  const modalRef = ref<any>(null)

  // 监听表单变化，标记 Tab 状态
  const { ignoreUpdates } = watchIgnorable(
    () => formModel,
    () => addTabState(),
    { deep: true },
  )

  /** 检查权限 */
  function checkPerm(perm?: string | string[]): boolean {
    if (!perm)
      return true
    const perms = Array.isArray(perm) ? perm : [perm]
    return hasPermission(perms)
  }

  /** 判断是否为更新操作 */
  function shouldUpdate(): boolean {
    if (isUpdate)
      return isUpdate(formModel as TForm, params.value)
    const currentId = getId()
    return !!(currentId && currentId !== '0')
  }

  /** 表单验证 */
  async function validForm(): Promise<boolean> {
    const form = unref(formRef)
    if (!form)
      return true
    try {
      await form.validate()
      return true
    }
    catch {
      return false
    }
  }

  /** 重置表单验证状态 */
  function resetForm() {
    formRef.value?.restoreValidation?.()
  }

  /** 重置表单数据 */
  function resetFormData() {
    const data = createFormModel()
    ignoreUpdates(() => {
      const transformed = transform ? transform(data) : data
      Object.assign(formModel, transformed)
    })
  }

  /** 保存数据 */
  async function save() {
    if (shouldUpdate()) {
      return api.update?.(formModel)
    }
    return api.create?.(formModel)
  }

  /** 提交表单 */
  async function submit(closeOnSuccess?: boolean | MouseEvent) {
    if (btnLoading.value)
      return
    // 支持 @click="submit" 直接绑定，忽略 MouseEvent
    const shouldClose = typeof closeOnSuccess === 'boolean' ? closeOnSuccess : true
    try {
      btnLoading.value = true
      if (!await validForm()) {
        btnLoading.value = false
        return
      }
      if (beforeSubmit && !(await safeCall(beforeSubmit, formModel as TForm, params.value))) {
        btnLoading.value = false
        return
      }

      const { isSuccess } = (await save()) || { isSuccess: false }

      if (isSuccess) {
        if (shouldClose) {
          modalRef.value?.close()
        }
        else {
          btnLoading.value = false
        }
        message.success(messages?.success || '保存成功')
        await safeCall(onSuccess, shouldUpdate() ? 'edit' : 'add')
      }
      else {
        // 保存失败，重置按钮状态（成功时由 onHide 回调重置）
        btnLoading.value = false
      }
    }
    catch {
      // 异常时重置按钮状态
      btnLoading.value = false
    }
  }

  /** 查看详情（只读） */
  async function view(id?: string) {
    if (!id)
      return

    // 如果有 api.get，从接口加载数据
    if (api.get) {
      const { isSuccess, data } = await api.get(id)
      if (!isSuccess)
        return

      if (beforeView && !(await safeCall(beforeView, data, params.value)))
        return

      ignoreUpdates(() => {
        applyData(formModel, createFormModel, data, transform)
      })

      isEdit.value = false
      btnLoading.value = false // 打开时重置
      modalRef.value?.setProps({
        title: resolveDynamicTitle(titles, 'view', data, params.value),
        onHide: () => {
          btnLoading.value = false
          isModalOpen.value = false
        },
      })
      modalRef.value?.open()
      isModalOpen.value = true
      return
    }

    // 没有 api.get，直接使用当前 formModel（数据通过 updateModel 传入）
    if (beforeView && !(await safeCall(beforeView, formModel, params.value)))
      return

    isEdit.value = false
    btnLoading.value = false
    modalRef.value?.setProps({
      title: resolveDynamicTitle(titles, 'view', formModel, params.value),
      onHide: () => {
        btnLoading.value = false
        isModalOpen.value = false
      },
    })
    modalRef.value?.open()
    isModalOpen.value = true
  }

  /** 新增 */
  async function create() {
    hasPerm.value = checkPerm(resolvedPermission?.add)
    if (!hasPerm.value) {
      message.info(messages?.noPermission || '无权限操作')
      return
    }

    resetFormData()

    if (beforeEdit && !(await safeCall(beforeEdit, formModel as TForm, params.value)))
      return

    isEdit.value = true
    btnLoading.value = false // 打开时重置
    modalRef.value?.setProps({
      title: resolveDynamicTitle(titles, 'add', formModel, params.value),
      onHide: () => {
        btnLoading.value = false
        isModalOpen.value = false
      },
    })
    modalRef.value?.open()
    isModalOpen.value = true
  }

  /** 编辑 */
  async function edit(id?: string) {
    if (!id)
      return
    hasPerm.value = checkPerm(resolvedPermission?.edit)
    if (!hasPerm.value) {
      message.info(messages?.noPermission || '无权限操作')
      return
    }
    // view → edit 切换时是否跳过加载（由 skipEditReload 控制，默认跳过）
    if (skipEditReload && !isEdit.value && isModalOpen.value && getId() === id) {
      if (beforeEdit && !(await safeCall(beforeEdit, formModel as TForm, params.value)))
        return

      isEdit.value = true
      btnLoading.value = false // 打开时重置
      modalRef.value?.setProps({
        title: resolveDynamicTitle(titles, 'edit', formModel, params.value),
        onHide: () => {
          btnLoading.value = false
          isModalOpen.value = false
        },
      })
      modalRef.value?.open()
      return
    }

    resetForm()

    // 如果没有 get 方法，跳过加载（数据通过 updateModel 传入）
    if (!api.get) {
      if (beforeEdit && !(await safeCall(beforeEdit, formModel as TForm, params.value)))
        return

      isEdit.value = true
      btnLoading.value = false
      modalRef.value?.setProps({
        title: resolveDynamicTitle(titles, 'edit', formModel, params.value),
        onHide: () => {
          btnLoading.value = false
          isModalOpen.value = false
        },
      })
      modalRef.value?.open()
      isModalOpen.value = true
      return
    }

    const { isSuccess, data } = await api.get(id)
    if (!isSuccess)
      return

    ignoreUpdates(() => {
      applyData(formModel, createFormModel, data, transform)
    })

    if (beforeEdit && !(await safeCall(beforeEdit, formModel as TForm, params.value)))
      return

    isEdit.value = true
    btnLoading.value = false // 打开时重置
    modalRef.value?.setProps({
      title: resolveDynamicTitle(titles, 'edit', data, params.value),
      onHide: () => {
        btnLoading.value = false
        isModalOpen.value = false
      },
    })
    modalRef.value?.open()
    isModalOpen.value = true
  }

  /** 更新模型 */
  function updateModel(data: TForm) {
    clearTabState()
    ignoreUpdates(() => {
      applyData(formModel, createFormModel, data, transform)
    })
  }

  /** 刷新当前记录数据（保持当前模式不变） */
  async function refresh() {
    const id = getId()
    if (!id || !api.get)
      return
    const { isSuccess, data } = await api.get(id)
    if (!isSuccess)
      return
    ignoreUpdates(() => {
      applyData(formModel, createFormModel, data, transform)
    })
  }

  /** 是否显示修改按钮 */
  function showEdit(): boolean {
    if (isEdit.value || params.value.opt || !checkPerm(resolvedPermission?.edit))
      return false
    return canEdit ? canEdit(formModel as TForm) : true
  }

  const exposed = {
    open: async (args?: any) => {
      resetForm()
      params.value = args || {}

      const id = getArgId(args)
      const opt = args?.opt?.toLowerCase()
      const mode = opt === 'edit' ? 'edit' : opt === 'view' ? 'view' : (id ? 'view' : 'create') as 'view' | 'edit' | 'create'

      // 打开前回调
      if (onBeforeOpen && !(await safeCall(onBeforeOpen, params.value, mode))) {
        return
      }

      // 执行操作
      if (mode === 'edit') {
        await edit(id)
      }
      else if (mode === 'view') {
        await view(id)
      }
      else {
        await create()
      }

      // 打开后回调
      await safeCall(onOpen, params.value, mode)
    },
  } as OpenModal

  return {
    isEdit,
    hasPerm,
    btnLoading,
    isReadonly,
    params,
    formModel,
    formRef,
    modalRef,
    validForm,
    resetForm,
    exposed,
    showEdit,
    submit,
    view,
    edit,
    create,
    clearTabState,
    updateModel,
    refresh,
  }
}

// ============ 主函数 ============

/**
 * 通用详情页 Hook
 *
 * 封装查看/编辑/新增的通用逻辑，支持自动权限检查、标题管理、表单验证等
 *
 * @example
 * // 基本用法（自动从 Tab 获取标题和权限）
 * const { formModel, exposed, submit, isEdit, ... } = useDetail({
 *   api: teamApi,
 *   createFormModel: () => ({ id: '', name: '', code: '' }),
 *   permission: { useTabPermission: true },
 *   onSuccess: (action) => emit('on-action', action),
 * })
 *
 * @example
 * // 手动指定标题和权限
 * const { ... } = useDetail({
 *   api: teamApi,
 *   createFormModel: () => ({ ... }),
 *   title: '单位',
 *   permission: { add: 'TEAM_ADD', edit: 'TEAM_EDIT' },
 *   messages: { success: '保存成功' },
 * })
 *
 * @example
 * // 标题配置（动态函数）
 * const { ... } = useDetail({
 *   api,
 *   createFormModel,
 *   title: {
 *     base: '角色',
 *     edit: (data, params) => params.isCopy ? '复制角色' : '编辑角色',
 *   },
 * })
 * // 调用：detailRef.value?.open({ id: '1', opt: 'edit', isCopy: true })  // 标题：复制角色
 *
 * @example
 * // 只读模式（仅查看）
 * const { formModel, exposed } = useDetail({
 *   api: { get: logApi.get },
 *   createFormModel: () => ({ ... }),
 *   title: '日志',
 *   readonly: true,
 * })
 *
 * @example
 * // 使用 createTransformer 进行数据转换
 * import { createTransformer } from '@/hooks/detail'
 *
 * const { formModel, ... } = useDetail({
 *   api,
 *   createFormModel,
 *   transform: createTransformer({
 *     string: ['gender'],
 *     number: ['age'],
 *     nullIfZero: ['level'],
 *     enum: { gender: 'UserGender' },
 *     custom: {
 *       birthday: (val) => val ? dayjs(val).format('YYYY-MM-DD') : null,
 *     },
 *   }),
 * })
 */

// 函数重载：完整模式（必须放在只读模式前面）
export function useDetail<TForm extends Recordable>(
  options: UseDetailFullOptions<TForm>,
): UseDetailFullReturn<TForm>

// 函数重载：只读模式
export function useDetail<TForm extends Recordable>(
  options: UseDetailReadonlyOptions<TForm>,
): UseDetailReadonlyReturn<TForm>

// 实现
export function useDetail<TForm extends Recordable>(
  options: UseDetailReadonlyOptions<TForm> | UseDetailFullOptions<TForm>,
): UseDetailReadonlyReturn<TForm> | UseDetailFullReturn<TForm> {
  return options.readonly === true
    ? useDetailReadonly(options as UseDetailReadonlyOptions<TForm>)
    : useDetailFull(options as UseDetailFullOptions<TForm>)
}
