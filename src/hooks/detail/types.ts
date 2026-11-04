import type { FormInst } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'

// ============ 公共类型 ============

/** open 参数类型 */
export interface DetailParams {
  id?: string
  /** 操作类型（支持大小写） */
  opt?: 'view' | 'edit' | 'VIEW' | 'EDIT'
  [key: string]: any
}

/** 枚举转换配置 */
export interface EnumTransformItem {
  /** 枚举 key */
  key: string
  /** 匹配方式，默认 'value' */
  matchBy?: 'value' | 'name'
}

/** 字段转换配置 */
export interface FieldTransformConfig {
  /** 转为数字的字段（null/空字符串 → null） */
  number?: string[]
  /** 转为字符串的字段 */
  string?: string[]
  /** 0 转 null 的字段 */
  nullIfZero?: string[]
  /**
   * 枚举转换配置
   * 将字段值转换为枚举标签
   * @example
   * enum: {
   *   status: 'UserStatus',                          // 使用 value 匹配
   *   type: { key: 'UserType', matchBy: 'name' },    // 使用 name 匹配
   * }
   */
  enum?: Record<string, string | EnumTransformItem>
  /**
   * 自定义转换函数
   * @example
   * custom: {
   *   // 将时间戳转为日期字符串
   *   date: (val) => val ? dayjs(val).format('YYYY-MM-DD') : null,
   *   // 根据其他字段计算
   *   fullAddress: (val, data) => `${data.province}${data.city}${data.address}`,
   *   // 数组转字符串
   *   tags: (val) => Array.isArray(val) ? val.join(',') : val,
   * }
   */
  custom?: Record<string, (val: any, data: any) => any>
  /**
   * 枚举/自定义转换结果存放字段
   * 配置后，enum 和 custom 的转换结果会存到此字段中，不覆盖原始值
   * @example
   * // 配置
   * transformField: 'transform'
   * // 结果：formModel.gender = 1（原始值），formModel.transform.gender = '男'（转换值）
   */
  transformField?: string
}

/** 权限配置 */
export interface PermissionConfig {
  /** 新增权限（支持多个权限名） */
  add?: string | string[]
  /** 编辑权限（支持多个权限名） */
  edit?: string | string[]
}

/** Tab 权限配置（简化的权限配置） */
export interface TabPermissionConfig {
  /** 使用 Tab 权限（自动生成 `${permName}_ADD` 和 `${permName}_EDIT`） */
  useTabPermission: true
  /** 权限名（可选，默认从当前 Tab 获取） */
  permName?: string
}

/** 消息配置 */
export interface MessageConfig {
  /** 保存成功消息（默认：'保存成功'） */
  success?: string
  /** 无权限提示（默认：'无权限操作'） */
  noPermission?: string
}

/** 标题配置 */
export interface TitleConfig {
  /** 基础标题（可选，未配置的标题会尝试从 Tab 获取） */
  base?: string
  /** 查看标题（默认：`查看${base}`） */
  view?: string | ((data: any, params: DetailParams) => string)
  /** 新增标题（默认：`新增${base}`） */
  add?: string
  /** 编辑标题（默认：`编辑${base}`） */
  edit?: string | ((data: any, params: DetailParams) => string)
}

// ============ 选项类型 ============

/** 只读模式选项 */
export interface UseDetailReadonlyOptions<TForm extends Recordable> {
  /** API 服务对象（只读模式只需 get） */
  api: {
    get: (id: string) => Promise<Service.Result<TForm>>
  }
  /** 表单默认值工厂函数（用于推断 TForm 类型） */
  createFormModel: () => TForm
  /** ID 字段名（默认 'id'） */
  idField?: string
  /** 标题配置（可选，默认从当前 Tab 获取） */
  title?: string | TitleConfig
  /** 只读模式 */
  readonly: true
  /** 数据转换（API 响应 → 表单模型） */
  transform?: (data: any) => any
  /** 打开前回调（返回 false 阻止打开） */
  onBeforeOpen?: (params: DetailParams) => boolean | Promise<boolean>
  /** 打开后回调（可用于加载下拉选项等） */
  onOpen?: (params: DetailParams) => void | Promise<void>
}

/** 完整模式选项 */
export interface UseDetailFullOptions<TForm extends Recordable> {
  /** API 服务对象（get/create/update 均可选，按需配置） */
  api: {
    /** 获取详情（view/edit 模式需要） */
    get?: (id: string) => Promise<Service.Result<any>>
    /** 新增（create 模式需要） */
    create?: (data: Recordable) => Promise<Service.Result<string> | Service.Response>
    /** 更新（edit 模式需要） */
    update?: (data: Recordable) => Promise<Service.Response>
  }
  /** 表单默认值工厂函数（用于推断 TForm 类型） */
  createFormModel: () => TForm
  /** ID 字段名（默认 'id'） */
  idField?: string
  /** 标题配置（可选，默认从当前 Tab 获取） */
  title?: string | TitleConfig
  /** 权限配置（可选，不配置则不做权限检查） */
  permission?: PermissionConfig | TabPermissionConfig
  /** 只读模式 */
  readonly?: false
  /** 消息配置 */
  messages?: MessageConfig
  /** 判断是否为编辑模式（返回 true 调用 update，false 调用 create） */
  isUpdate?: (formModel: TForm, params: DetailParams) => boolean
  /** 数据转换（API 响应 → 表单模型） */
  transform?: (data: any) => any
  /** 提交前钩子（返回 false 阻止提交） */
  beforeSubmit?: (data: TForm, params: DetailParams) => boolean | Promise<boolean>
  /** 查看前钩子（返回 false 阻止打开）） */
  beforeView?: (data: TForm, params: DetailParams) => boolean | Promise<boolean>
  /** 新增和编辑前钩子（返回 false 阻止打开） */
  beforeEdit?: (data: TForm, params: DetailParams) => boolean | Promise<boolean>
  /** 提交成功回调 */
  onSuccess?: (action: 'add' | 'edit') => void | Promise<void>
  /** 打开前回调（返回 false 阻止打开） */
  onBeforeOpen?: (params: DetailParams, mode: 'view' | 'edit' | 'create') => boolean | Promise<boolean>
  /** 打开后回调（可用于加载下拉选项等） */
  onOpen?: (params: DetailParams, mode: 'view' | 'edit' | 'create') => void | Promise<void>
  /** 是否可编辑（用于 showEdit 判断，如禁用/停用状态） */
  canEdit?: (formModel: TForm) => boolean
  /**
   * view → edit 切换时是否跳过重新加载（默认 true）
   * - true: view 模式切换到 edit 时，复用已加载数据，不调用 API
   * - false: 每次切换到 edit 都重新调用 API 获取最新数据
   */
  skipEditReload?: boolean
}

// ============ 返回值类型 ============

/** 只读模式返回值 */
export interface UseDetailReadonlyReturn<TForm extends Recordable> {
  /** 只读模式（始终为 true） */
  isReadonly: ComputedRef<boolean>
  /** open 传入的参数 */
  params: Ref<DetailParams>
  /** 数据 */
  formModel: TForm
  /** 引用 */
  modalRef: Ref<any>
  /** 暴露给父组件的方法 */
  exposed: OpenModal
  /** 方法 */
  view: (id: string) => Promise<void>
  /** 刷新当前记录数据 */
  refresh: () => Promise<void>
  clearTabState: () => void
}

/** 完整模式返回值 */
export interface UseDetailFullReturn<TForm extends Recordable> {
  /** 是否编辑模式 */
  isEdit: Ref<boolean>
  /** 是否有权限 */
  hasPerm: Ref<boolean>
  /** 按钮加载状态 */
  btnLoading: Ref<boolean>
  /** 只读模式（始终为 false） */
  isReadonly: ComputedRef<boolean>
  /** open 传入的参数 */
  params: Ref<DetailParams>
  /** 数据 */
  formModel: TForm
  /** 引用 */
  formRef: Ref<FormInst | null>
  modalRef: Ref<any>
  /** 方法 */
  validForm: () => Promise<boolean>
  resetForm: () => void
  exposed: OpenModal
  showEdit: () => boolean
  submit: (closeOnSuccess?: boolean | MouseEvent) => Promise<void>
  view: (id: string) => Promise<void>
  edit: (id: string) => Promise<void>
  create: () => Promise<void>
  /** 刷新当前记录数据 */
  refresh: () => Promise<void>
  clearTabState: () => void
  updateModel: (data: TForm) => void
  /**
   * 审批完成后的收尾：收起详情弹窗并通知列表刷新。
   * 配合 BizApprovalActions 的 @done 使用，避免各页面重复实现。
   */
  finishApproval: () => void
}
