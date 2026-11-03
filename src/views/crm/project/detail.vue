<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { FileManagerInst } from '@/components/BizFile'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import { add, multiply, round } from 'xe-utils'
import BizDraftBox from '@/components/BizDraftBox'
import { FileManager, Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { LogProcess } from '@/components/BizLogs/process'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { CustomerPicker, MemberPicker, TeamPicker } from '@/components/SpTablePicker'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { project as api } from '@/service/api/crm'
import { bizType, subject } from '@/service/api/masterdata'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import {
  alloctesGridOptions,
  alloctesViewGridOptions,
  expensesGridOptions,
  expensesViewGridOptions,
  incomesGridOptions,
  incomesViewGridOptions,
  scalesGridOptions,
  scalesViewGridOptions,
} from './columns'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const riseModalRef = ref<ModalInst | null>(null)
const riseDataList = ref<any>([])
const riseDataIndex = ref<number>(0)
const ratesOptions = ref<Recordable[]>([])

const incomesTableRef = ref<TableInstance | null>(null)
const incomesViewTableRef = ref<TableInstance | null>(null)
const expensesTableRef = ref<TableInstance | null>(null)
const expensesViewTableRef = ref<TableInstance | null>(null)
const scalesTableRef = ref<TableInstance | null>(null)
const scalesViewTableRef = ref<TableInstance | null>(null)
const alloctesTableRef = ref<TableInstance | null>(null)
const alloctesViewTableRef = ref<TableInstance | null>(null)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
    alone: true,
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

const roomTreeOptions = ref<Recordable[]>([])
async function loadRoomTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  roomTreeOptions.value = data
}

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await subject.tree({
    code: '5201',
    stoped: false,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

const productTreeOptions = ref<any>([])
async function loadProductOptions() {
  const { isSuccess, data } = await bizType.tree({
    stoped: false,
  })
  if (!isSuccess)
    return
  productTreeOptions.value = data
}

const scaleOptions = computed(() => {
  const items = formModel.scales.map((item) => {
    return {
      value: item.name,
      label: item.name,
    }
  })

  return items
})

async function load() {
  await loadTeamTree()
  await loadRoomTree()
  await loadContentOptions()
  await loadProductOptions()
}

const isApprove = ref<boolean>(false)
const modalMode = ref<string | null>(null)

const updateMonthsModalRef = ref<ModalInst | null>(null)
const updateMonthsValue = ref<any>(null)
const updateMonthsOpt = ref<string | null>(null)

const updateMonthsOptions = ref<Recordable[]>([])
function getUpdateMonthsOptions() {
  const months: any = []

  const startDate = new Date(formModel.indate)
  const endDate = new Date(formModel.expire)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')

    months.push({
      value: `${year}-${month}`,
      label: `${year}-${month}`,
    })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

const updateStartModalRef = ref<ModalInst | null>(null)
const updateStartValue = ref<string | null>(null)

const updateInvalidModalRef = ref<ModalInst | null>(null)
const updateInvalidInfo = ref({
  id: null as string | null,
  reason: null as string | null,
  files_zfsm: [] as any,
})

const updateExpireModalRef = ref<ModalInst | null>(null)
const updateExpireInfo = ref({
  id: null as string | null,
  expire: null as number | null,
  causes: null as string | null,
  amount: null as number | null,
  reason: null as string | null,
  files_zzxy: [] as any,
  files_zzsq: [] as any,
  files_jcxy: [] as any,
  files_jcsm: [] as any,
  files_jczj: [] as any,
  files_htyj: [] as any,
  files_qksm: [] as any,
  files_cns: [] as any,
  files_xctp: [] as any,
})
const causesOptions = ref<any>([
  {
    value: '双方终止',
    label: '双方终止',
  },
  {
    value: '单方终止',
    label: '单方终止',
  },
])

const fileMgrRef = ref<FileManagerInst>()

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    link_id: null,
    opt_return: false,
    opt_revoke: false,
    opt_submit: false,
    opt_affirm: false,
    opt_handle: false,
    opt_confirm: false,
    opt_cancel: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
    no: null,
    code: null,
    name: null,
    model: null,
    types: null,
    source: null,
    pattern: null,
    schedule: null,
    indate: null,
    revise: null,
    expire: null,
    months: null,
    reason: null,
    renew: null,
    times: null,
    pcs: null,
    amount: null,
    user_id: null,
    user_name: null,
    remark: null,
    scales: [],
    incomes: [],
    expenses: [],
    alloctes: [],
    files_htyj: [],
    files_gdht: [],
    files_cbys: [],
    files_yyzz: [],
    files_sfz: [],
    files_jht: [],
    files_bcxy: [],
    files_zmcl: [],
    files_zzxy: [],
    files_zzsq: [],
    files_jcxy: [],
    files_jcsm: [],
    files_jczj: [],
    files_qksm: [],
    files_xctp: [],
    files_cns: [],
    files_zfsm: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    // user_id: [{ required: true, message: '请选择负责人', trigger: 'change' }],
    name: [{ required: true, message: '请输入项目名称', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择登记日期', trigger: 'change' }],
    indate: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
    expire: [{ type: 'number', required: true, message: '请选择结束日期', trigger: 'change' }],
    types: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
    pattern: [{ required: true, message: '请选择业务模式', trigger: 'change' }],
    // amount: [{ type: 'number', required: true, message: '请输入项目总服务费', trigger: 'change' }],
    files_htyj: [{ type: 'array', required: true, message: '请上传合同原件', trigger: 'change' }],
    files_yyzz: [{ type: 'array', required: false, message: '请上传营业执照', trigger: 'change' }],
    // files_sfz: [{ type: 'array', required: false, message: '请上传身份证', trigger: 'change' }],
    // files_cbys: [{ type: 'array', required: false, message: '请上传成本预算表', trigger: 'change' }],
    // files_jht: [{ type: 'array', required: false, message: '请上传旧合同', trigger: 'change' }],
    // files_bcxy: [{ type: 'array', required: false, message: '请上传补充协议', trigger: 'change' }],
  }

  // if (Number(formModel.source) === 2) {
  //   if (Number(formModel.types) === 1) {
  //     rules.files_yyzz[0].required = true
  //   }
  //   else {
  //     rules.files_yyzz[0].required = true
  //     rules.files_sfz[0].required = true
  //     rules.files_cbys[0].required = true
  //   }
  // }
  // else if (Number(formModel.source) === 0 && formModel.source !== null) {
  //   if (Number(formModel.types) === 1) {
  //     rules.files_jht[0].required = true
  //   }
  //   else {
  //     rules.files_jht[0].required = true
  //     rules.files_cbys[0].required = true
  //   }
  // }
  // else if (Number(formModel.source) === 1 || Number(formModel.source) === 3) {
  //   if (Number(formModel.types) === 1) {
  //     rules.files_bcxy[0].required = true
  //   }
  //   else {
  //     rules.files_bcxy[0].required = true
  //     rules.files_cbys[0].required = true
  //   }
  // }

  // for (let i = 0; i < formModel.incomes.length; i++) {
  //   rules[`incomes[${i}].team_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].outer_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].product_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].invoice`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].payment`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].period`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].price`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`incomes[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  // }

  // for (let i = 0; i < formModel.expenses.length; i++) {
  //   rules[`expenses[${i}].team_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`expenses[${i}].content_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`expenses[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  // }

  // for (let i = 0; i < formModel.scales.length; i++) {
  //   rules[`scales[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`scales[${i}].salary`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  // }

  // for (let i = 0; i < formModel.alloctes.length; i++) {
  //   rules[`alloctes[${i}].team_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].branch_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].branch_address`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].pattern`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].position`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`alloctes[${i}].pcs`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  // }

  return rules
})

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  showEdit,
  submit,
  edit,
  clearTabState,
  params,
  updateModel,
} = useDetail<FormModel>({
  api: {
    get() {
      return api.get({ ...params.value })
    },
    create() {
      return api.create({ ...formModel })
    },
    update() {
      return api.update({ ...formModel })
    },
  },
  createFormModel,
  title: '项目管理',
  permission: { useTabPermission: true, permName: 'CRM_PROJECT' },
  canEdit: form => form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onBeforeOpen: (params, mode) => {
    isApprove.value = params.approve
    modalMode.value = mode

    return true
  },
  transform: createTransformer({
    nullIfZero: ['team_id', 'user_id'],
    string: ['types', 'pattern', 'paymetn'],
    number: ['date', 'pcs', 'amount', 'revise', 'expire', 'indate', 'insure'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      revise: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      indate: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      insure: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      types: 'trade_project_types',
      pattern: 'trade_project_pattern',
      paymetn: 'trade_project_payment',
    },
  }),
  beforeEdit: async () => {
    if (formModel.incomes.length > 0) {
      formModel.incomes.forEach((item: any) => {
        item.product_rate = Number(item.product_rate) ? Number(item.product_rate) : null
        item.product_add = Number(item.product_add) ? Number(item.product_add) : null
        item.paymnet = Number(item.paymnet) ? Number(item.paymnet) : null
        item.period = Number(item.period) ? Number(item.period) : null
        item.price = Number(item.price) ? Number(item.price) : null
        item.amount = Number(item.amount) ? Number(item.amount) : null
      })
    }

    if (formModel.expenses.length > 0) {
      formModel.expenses.forEach((item: any) => {
        item.amount = Number(item.amount) ? Number(item.amount) : null
      })
    }

    if (formModel.scales.length > 0) {
      formModel.scales.forEach((item: any) => {
        item.salary = Number(item.salary) ? Number(item.salary) : null
      })
    }

    if (formModel.alloctes.length > 0) {
      formModel.alloctes.forEach((item: any) => {
        item.pcs = Number(item.pcs) ? Number(item.pcs) : null
        item.van = Number(item.van) ? Number(item.van) : null
        item.price = Number(item.price) ? Number(item.price) : null
        item.amount = Number(item.amount) ? Number(item.amount) : null
        item.salary = Number(item.pcs) ? Number(item.salary) : null
      })
    }

    if (formModel.incomes.length === 0) {
      tableItemsAdd({
        opt: 'incomes',
      })
    }

    await load()
    return true
  },
  beforeView: (data) => {
    if (data.incomes.length !== 0) {
      data.incomes.forEach((item: any) => {
        item.transform = {}
        item.transform.invoice = enumStore.getLabel('trade_invoice_types', item.invoice, 'name')
        item.transform.payment = enumStore.getLabel('trade_project_payment', item.payment)
        item.transform.months = item.months && item.months.length > 0 ? item.months.toString() : null
      })
    }
    return true
  },
})

async function handleProcess(opt: string) {
  processTypes.value = opt
  processRemark.value = null
  if (opt === '同意') {
    processTitle.value = '审批意见'
  }
  else {
    processTitle.value = `${opt}原因`
  }
  processModalRef.value?.open()
}

async function process() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const list = [{ id: formModel.id, biz_class: 'Trade' }]

  btnLoading.value = true
  if (processTypes.value === '撤回') {
    const { isSuccess } = await approve.revoke({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else if (processTypes.value === '作废') {
    const { isSuccess } = await approve.invalid({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else {
    const { isSuccess } = await approve
      .process({
        list,
        status: processTypes.value,
        remark: processRemark.value,
      })
      .finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  toast.success('操作成功')
  processModalRef.value?.close()
  modalRef.value.close()
  emit('on-action', 'EDIT')
}

async function handleCancel() {
  toast.infoModal('确定取消审批吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await approve
        .cancel({
          list: [{
            id: formModel.id,
            biz_class: 'Trade',
          }],
        })
        .finally(() => (btnLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      modalRef.value.close()
      emit('on-action', 'EDIT')
    },
  })
}

function updateInvalidModalShow() {
  processTypes.value = '作废'

  updateInvalidInfo.value.id = formModel.id
  updateInvalidInfo.value.reason = formModel.reason
  updateInvalidInfo.value.files_zfsm = formModel.files_zfsm

  updateInvalidModalRef.value?.open()
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

function tableItemsCheck(opt: string) {
  return false
}

async function tableItemsAdd({ opt, key = 0 }: { opt: string, key?: number | string }) {
  const listNums = Number(key)
  const list: any = {}

  if (formModel[opt] && formModel[opt].length > 0) {
    if (await tableItemsCheck(opt))
      return
  }

  formModel[opt].splice(listNums + 1, 0, list)
}

function tableItemsRemove({ opt, key }: { opt: string, key: number | string }) {
  if (formModel[opt].length <= 1) {
    toast.info('不能少于一行')
    return
  }

  formModel[opt].splice(key, 1)
}

function tableItemsMoveUp({ opt, key }: { opt: string, key: number | string }) {
  const nuns = Number(key)
  if (nuns === 0)
    return
  const items = formModel[opt];
  [items[nuns], items[nuns - 1]] = [items[nuns - 1], items[nuns]]
}

function tableItemsMoveDown({ opt, key }: { opt: string, key: number | string }) {
  const nuns = Number(key)
  if (nuns < formModel[opt].length - 1) {
    const items = formModel[opt];
    [items[nuns], items[nuns + 1]] = [items[nuns + 1], items[nuns]]
  }
}

async function handleItemHeaderClick({ name, expanded }) {
  await nextTick()
  if (name === 'incomes' && expanded) {
    if (formModel.incomes.length === 0) {
      tableItemsAdd({
        opt: 'incomes',
      })
    }
  }
  if (name === 'expenses' && expanded) {
    if (formModel.expenses.length === 0) {
      tableItemsAdd({
        opt: 'expenses',
      })
    }
  }
  if (name === 'scales' && expanded) {
    if (formModel.scales.length === 0) {
      tableItemsAdd({
        opt: 'scales',
      })
    }
  }
  if (name === 'alloctes' && expanded) {
    if (formModel.alloctes.length === 0) {
      tableItemsAdd({
        opt: 'alloctes',
      })
    }
  }
}

function handleIncomesCustomSelected(row: Recordable, options: any) {
  row.outer_name = options.label
  row.outer_nature = options.nature
}

function handleIncomesPorductSelected(row: Recordable, options: Recordable) {
  row.product_name = options.label
  row.product_rate = options.rate
  row.product_add = options.add
}

function handleIncomesPaymentSelected(row: Recordable, options: Recordable) {
  row.payment_name = options.label
  if (row.payment === 2) {
    row.period = 1
    row.months = []
  }
}

function handleRiseVarSetModal(key) {
  const item = formModel.list[key]
  riseDataIndex.value = Number(key)

  riseDataList.value = []

  if (item.rise_var) {
    const arr = item.rise_var.split(';')
    if (arr.length > 1) {
      const rateArr = arr[0].split(',')
      const valueArr = arr[1].split(',')
      for (const i in rateArr) {
        riseDataList.value.push({
          rate: rateArr[i],
          value: Number(valueArr[i]),
        })
      }
    }
  }

  // if (riseDataList.value.length === 0) {
  //   riseDataListItemAdd()
  // }
  riseModalRef.value?.open()
}

function riseDataListItemAdd() {
  if (riseDataListItemCheck())
    return

  const def = {
    rate: null,
    value: null,
  }
  riseDataList.value.push(def)
}

function riseDataListItemMoveUp(key) {
  if (Number(key) === 0)
    return
  const items = riseDataList.value;
  [items[key], items[key - 1]] = [items[key - 1], items[key]]
}

function riseDataListItemMoveDown(key) {
  if (Number(key) < riseDataList.value.length - 1) {
    const items = riseDataList.value;
    [items[key], items[key + 1]] = [items[key + 1], items[key]]
  }
}

function riseDataListItemCopy(key) {
  const item = riseDataList.value[key]
  const newItem = { ...item }
  riseDataList.value.splice(key + 1, 0, newItem)
}

function riseDataListItemRemove(key) {
  // if (riseDataList.value.length > 1) {
  riseDataList.value.splice(key, 1)
  // }
  // else {
  //   toast.info('请填写浮动绩效工资')
  // }
}

function riseDataListItemCheck() {
  const hasError = riseDataList.value.some((item, index) => {
    if (!item.rate) {
      toast.error(`请选择 #${index + 1} 评级`)
      return true
    }
    // if (!item.value) {
    //   toast.error(`请输入 #${index + 1} 值`)
    //   return true
    // }
    return false
  })

  return hasError
}

function handleRiseSet() {
  if (riseDataListItemCheck())
    return

  const rateArr = riseDataList.value.map(q => q.rate)
  const valueArr = riseDataList.value.map(q => q.value)

  if (rateArr.length === 0) {
    formModel.list[riseDataIndex.value].rise_var = ''
  }
  else {
    formModel.list[riseDataIndex.value].rise_var = `${rateArr.join(',')};${valueArr.join(',')}`
  }

  riseModalRef.value?.close()
}

function handleAlloctesBranchSelected(key: string | number, options: any) {
  const item = formModel.alloctes[key]
  item.branch_address = options.address
}

function handleTeamSelected() {
  formModel.alloctes.forEach((item) => {
    item.team_id ??= formModel.team_id
  })
}

function handleDateSelected() {
  updateMonthsOptions.value = getUpdateMonthsOptions()
}

async function handleUpdateMonths() {
  if (!updateMonthsValue.value) {
    toast.error('请选择日期')
    return
  }

  if (updateMonthsOpt.value === 'input') {
    formModel.months = updateMonthsValue.value.sort((a, b) => a.localeCompare(b)).join(',')
    updateMonthsModalRef.value?.close()
  }
  else {
    formModel.months = updateMonthsValue.value.sort((a, b) => a.localeCompare(b)).join(',')

    btnLoading.value = true
    const { isSuccess } = await api
      .updateMonths({
        id: formModel.id,
        months: formModel.months,
      })
      .finally(() => (btnLoading.value = false))
    if (isSuccess) {
      toast.success('操作成功')
      updateMonthsModalRef.value?.close()
      emit('on-action', 'edit')
    }
  }
}

function updateStartModalShow() {
  updateStartValue.value = formModel.no
  updateStartModalRef.value?.open()
}

async function handleUpdateStart() {
  if (!updateStartValue.value) {
    toast.error('请输入合同编号')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .updateStart({
      id: formModel.id,
      no: updateStartValue.value,
    })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    updateStartModalRef.value?.close()
    modalRef.value.close()
    emit('on-action', 'edit')
  }
}

function updateExpireModalShow() {
  updateExpireInfo.value.id = formModel.id
  updateExpireInfo.value.expire = formModel.expire ? Number(formModel.expire) : null
  updateExpireInfo.value.causes = '单方终止'
  updateExpireInfo.value.amount = Number(formModel.amount.replace(',', ''))
  updateExpireInfo.value.reason = formModel.reason
  updateExpireInfo.value.files_zzxy = formModel.files_zzxy
  updateExpireInfo.value.files_zzsq = formModel.files_zzsq
  updateExpireInfo.value.files_htyj = formModel.files_htyj
  updateExpireInfo.value.files_qksm = formModel.files_qksm
  updateExpireInfo.value.files_cns = formModel.files_cns
  updateExpireInfo.value.files_xctp = formModel.files_xctp

  updateExpireModalRef.value?.open()
}

async function handleUpdateExpire() {
  btnLoading.value = true
  const { isSuccess } = await api
    .updateExpire({ ...updateExpireInfo.value })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    updateExpireModalRef.value?.close()
    modalRef.value.close()
    emit('on-action', 'edit')
  }
}

function updateFiles() {
  fileMgrRef.value?.show({
    xid: formModel.id,
    mark: '归档合同',
    canUpload: true,
    canRemove: true,
  })
}

function handleFileOk(items: Recordable[]) {
  console.log(items)
}

watch(
  () => formModel.alloctes,
  (value) => {
    if (value && value.length > 0) {
      let pcsSum: number = 0
      let priceSum: number = 0
      let laborSum: number = 0

      formModel.alloctes.forEach((q) => {
        if (q.price) {
          priceSum = add(priceSum, q.price)
        }
        if (q.pcs) {
          pcsSum = add(pcsSum, q.pcs)
        }
      })

      for (const i in formModel.alloctes) {
        if (formModel.alloctes[i].price && formModel.alloctes[i].pcs) {
          laborSum += multiply(formModel.alloctes[i].price, formModel.alloctes[i].pcs)
        }
      }

      formModel.price = priceSum
      formModel.pcs = pcsSum
      formModel.labor = round(laborSum, 2)
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id, name: 'trade_project' })
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'CrmProjectDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formModel.stoped ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="所属部门" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="roomTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="handleTeamSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="登记日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="项目类型" path="types">
          <n-select
            v-model:value="formModel.types"
            :options="enumStore.getEnumOptions('trade_project_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="项目名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="80" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同编号" path="no">
          <n-input v-model:value="formModel.no" maxlength="30" clearable />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.revise" :span="8" label="生效日期" path="revise">
          <n-date-picker v-model:value="formModel.revise" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi v-else :span="8" label="开始日期" path="indate">
          <n-date-picker
            v-model:value="formModel.indate"
            type="date"
            clearable
            fast-month-select
            @update:value="handleDateSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期" path="expire">
          <n-date-picker
            v-model:value="formModel.expire"
            type="date"
            clearable
            fast-month-select
            @update:value="handleDateSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="续约提醒" path="renew">
          <n-date-picker v-model:value="formModel.renew" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="业务模式" path="pattern">
          <n-select
            v-model:value="formModel.pattern"
            :options="enumStore.getEnumOptions('trade_project_pattern')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="履约保证金" path="ensure">
          <n-input-number
            v-model:value="formModel.ensure"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保证金到期日" path="insure">
          <n-date-picker v-model:value="formModel.insure" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="人数" path="pcs">
          <n-input-number
            v-model:value="formModel.pcs"
            :precision="1"
            :show-button="false"
            readonly
            placeholder=""
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="总服务费" path="amount">
          <n-input-number
            v-model:value="formModel.amount"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="负责人" path="user_id">
          <MemberPicker
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            :team_id="formModel.team_id"
            :disabled="!formModel.team_id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同原件" path="files_htyj">
          <Upload
            v-model:value="formModel.files_htyj"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="成本预算" path="files_cbys">
          <Upload
            v-model:value="formModel.files_cbys"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="Number(formModel.source) === 0"
          :span="8"
          label="营业执照"
          path="files_yyzz"
        >
          <Upload
            v-model:value="formModel.files_yyzz"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <!-- <n-form-item-gi
          v-if="Number(formModel.types) !== 2 && Number(formModel.source) === 0"
          :span="8"
          label="身份证"
          path="files_sfz"
        >
          <Upload
            v-model:value="formModel.files_sfz"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="Number(formModel.types) !== 2 && Number(formModel.source) === 2"
          :span="8"
          label="旧合同"
          path="files_jht"
        >
          <Upload
            v-model:value="formModel.files_jht"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="Number(formModel.types) !== 2 && (Number(formModel.source) === 1 || Number(formModel.source) === 3)"
          :span="8"
          label="补充协议"
          path="files_bcxy"
        >
          <Upload
            v-model:value="formModel.files_bcxy"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi>
        <n-form-item-gi v-if="Number(formModel.types) === 2" :span="8" label="证明材料" path="files_zmcl">
          <Upload
            v-model:value="formModel.files_zmcl"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
        </n-form-item-gi> -->
      </n-grid>

      <n-collapse arrow-placement="right" :default-expanded-names="['incomes']" @item-header-click="handleItemHeaderClick">
        <n-collapse-item title="收入明细" name="incomes">
          <SpTable ref="incomesTableRef" v-bind="incomesGridOptions" :data-source="formModel.incomes" @current-change="rowsChange($event, incomesTableRef)">
            <template #operate="{ rowIndex }">
              <div class="flex items-center justify-right gap-[10px]">
                <n-button v-if="formModel.incomes.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'incomes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button v-if="formModel.incomes.length > 1" :disabled="Number(rowIndex) === formModel.incomes.length - 1" text @click="tableItemsMoveDown({ opt: 'incomes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsAdd({ opt: 'incomes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:plus-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsRemove({ opt: 'incomes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </template>
            <template #team_default="{ row }">
              {{ row.team_name }}
            </template>
            <template #team_edit="{ row }">
              <SpCascader
                v-model:value="row.team_id"
                :options="teamTreeOptions"
                placeholder="请选择"
                value-field="id"
                @update:value="(_value, options) => row.team_name = options.label"
              />
            </template>
            <template #outer_default="{ row }">
              {{ row.outer_name }}
            </template>
            <template #outer_edit="{ row }">
              <CustomerPicker
                v-model:value="row.outer_id"
                :options="row.outer_name"
                :team_id="row.team_id"
                :disabled="!row.team_id"
                types="0"
                @change="(options) => handleIncomesCustomSelected(row, options)"
              />
            </template>
            <template #invoice_default="{ row }">
              {{ row.invoice_name }}
            </template>
            <template #invoice_edit="{ row }">
              <n-select
                v-model:value="row.invoice"
                :options="enumStore.getEnumOptions('trade_invoice_types', 'name')"
                clearable
                @update:value="(_value, options: Recordable) => row.invoice_name = options.label"
              />
            </template>
            <template #product_default="{ row }">
              {{ row.product_name }}
            </template>
            <template #product_edit="{ row }">
              <SpCascader
                v-model:value="row.product_id"
                :options="productTreeOptions"
                placeholder="请选择"
                value-field="id"
                @update:value="(_value, options) => handleIncomesPorductSelected(row, options)"
              />
            </template>
            <template #payment_default="{ row }">
              {{ row.payment_name }}
            </template>
            <template #payment_edit="{ row }">
              <n-select
                v-model:value="row.payment"
                :options="enumStore.getEnumOptions('trade_project_payment')"
                clearable
                @update:value="(_value, options) => handleIncomesPaymentSelected(row, options)"
              />
            </template>
            <template #period_edit="{ row }">
              <n-input-number
                v-model:value="row.period"
                :show-button="false"
                :precision="0"
                clearable
              />
            </template>
            <template #price_edit="{ row }">
              <n-input-number
                v-model:value="row.price"
                :show-button="false"
                :precision="2"
                clearable
              />
            </template>
            <template #amount_edit="{ row }">
              <n-input-number
                v-model:value="row.amount"
                :show-button="false"
                :precision="2"
                clearable
              />
            </template>
            <template #months_edit="{ row }">
              <n-select
                v-model:value="row.months"
                :options="updateMonthsOptions"
                max-tag-count="responsive"
                multiple
                clearable
              />
            </template>
          </SpTable>
        </n-collapse-item>
        <n-collapse-item title="费用明细" name="expenses">
          <SpTable ref="expensesTableRef" v-bind="expensesGridOptions" :data-source="formModel.expenses" @current-change="rowsChange($event, expensesTableRef)">
            <template #operate="{ rowIndex }">
              <div class="flex items-center justify-right gap-[10px]">
                <n-button v-if="formModel.expenses.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'expenses', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button v-if="formModel.expenses.length > 1" :disabled="Number(rowIndex) === formModel.expenses.length - 1" text @click="tableItemsMoveDown({ opt: 'expenses', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsAdd({ opt: 'expenses', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:plus-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsRemove({ opt: 'expenses', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </template>
            <template #team_default="{ row }">
              {{ row.team_name }}
            </template>
            <template #team_edit="{ row }">
              <SpCascader
                v-model:value="row.team_id"
                :options="teamTreeOptions"
                placeholder="请选择"
                value-field="id"
                @update:value="(_value, options) => row.team_name = options.label"
              />
            </template>
            <template #content_default="{ row }">
              {{ row.content_name }}
            </template>
            <template #content_edit="{ row }">
              <SpCascader
                v-model:value="row.content_id"
                :options="contentTreeOptions"
                placeholder="请选择"
                value-field="id"
                @update:value="(_value, options) => row.content_name = options.label"
              />
            </template>
            <template #amount_edit="{ row }">
              <n-input-number
                v-model:value="row.amount"
                :show-button="false"
                :precision="2"
                clearable
              />
            </template>
          </SpTable>
        </n-collapse-item>
        <n-collapse-item title="级别明细" name="scales">
          <SpTable ref="scalesTableRef" v-bind="scalesGridOptions" :data-source="formModel.scales" @current-change="rowsChange($event, scalesTableRef)">
            <template #operate="{ rowIndex }">
              <div class="flex items-center justify-right gap-[10px]">
                <n-button v-if="formModel.scales.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'scales', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button v-if="formModel.scales.length > 1" :disabled="Number(rowIndex) === formModel.scales.length - 1" text @click="tableItemsMoveDown({ opt: 'scales', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsAdd({ opt: 'scales', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:plus-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsRemove({ opt: 'scales', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </template>

            <template #name_edit="{ row }">
              <SpDict v-model:value="row.name" name="工资级别" clearable />
            </template>
            <template #salary_edit="{ row }">
              <n-input-number v-model:value="row.salary" :precision="2" :show-button="false" clearable />
            </template>
            <template #bases_edit="{ row }">
              <n-input-number v-model:value="row.bases" :precision="2" :show-button="false" clearable />
            </template>
            <template #grade_edit="{ row }">
              <n-input-number v-model:value="row.grade" :precision="2" :show-button="false" clearable />
            </template>
            <template #posts_edit="{ row }">
              <n-input-number v-model:value="row.posts" :precision="2" :show-button="false" clearable />
            </template>
            <template #dine_fix_edit="{ row }">
              <n-input-number v-model:value="row.dine_fix" :precision="2" :show-button="false" clearable />
            </template>
            <template #dine_day_edit="{ row }">
              <n-input-number v-model:value="row.dine_day" :precision="2" :show-button="false" clearable />
            </template>
            <template #heats_edit="{ row }">
              <n-input-number v-model:value="row.heats" :precision="2" :show-button="false" clearable />
            </template>
            <template #rise_fix_edit="{ row }">
              <n-input-number v-model:value="row.rise_fix" :precision="2" :show-button="false" clearable />
            </template>
            <template #rise_var_edit="{ row, rowIndex }">
              <n-input-group>
                <n-input v-model:value="row.rise_var" placeholder="" readonly />
                <n-button secondary @click="handleRiseVarSetModal(rowIndex)">
                  设置
                </n-button>
              </n-input-group>
            </template>
            <template #hour_on_edit="{ row }">
              <n-input-number v-model:value="row.hour_on" :precision="2" :show-button="false" clearable />
            </template>
            <template #hour_off_edit="{ row }">
              <n-input-number v-model:value="row.hour_off" :precision="2" :show-button="false" clearable />
            </template>
            <template #hour_ext_edit="{ row }">
              <n-input-number v-model:value="row.hour_ext" :precision="2" :show-button="false" clearable />
            </template>
            <template #hour_add_edit="{ row }">
              <n-input-number v-model:value="row.hour_add" :precision="2" :show-button="false" clearable />
            </template>
            <template #hour_fix_edit="{ row }">
              <n-input-number v-model:value="row.hour_fix" :precision="2" :show-button="false" clearable />
            </template>
            <template #times_edit="{ row }">
              <n-input-number v-model:value="row.times" :precision="1" :show-button="false" clearable />
            </template>
            <template #extra_edit="{ row }">
              <n-input-number v-model:value="row.extra" :precision="2" :show-button="false" clearable />
            </template>
            <template #skill_edit="{ row }">
              <n-input-number v-model:value="row.skill" :precision="2" :show-button="false" clearable />
            </template>
            <template #other_edit="{ row }">
              <n-input-number v-model:value="row.other" :precision="2" :show-button="false" clearable />
            </template>
            <template #insure_edit="{ row }">
              <n-input-number v-model:value="row.insure" :precision="2" :show-button="false" clearable />
            </template>
            <template #social_edit="{ row }">
              <n-input-number v-model:value="row.social" :precision="2" :show-button="false" clearable />
            </template>
            <template #house_edit="{ row }">
              <n-input-number v-model:value="row.house" :precision="2" :show-button="false" clearable />
            </template>
            <template #remark_edit="{ row }">
              <n-input v-model:value="row.remark" clearable />
            </template>
          </SpTable>
        </n-collapse-item>
        <n-collapse-item title="岗位明细" name="alloctes">
          <SpTable ref="alloctesTableRef" v-bind="alloctesGridOptions" :data-source="formModel.alloctes" @current-change="rowsChange($event, alloctesTableRef)">
            <template #operate="{ rowIndex }">
              <div class="flex items-center justify-right gap-[10px]">
                <n-button v-if="formModel.alloctes.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'alloctes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button
                  v-if="formModel.alloctes.length > 1"
                  :disabled="Number(rowIndex) === formModel.alloctes.length - 1"
                  text
                  @click="tableItemsMoveDown({ opt: 'alloctes', key: rowIndex })"
                >
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsAdd({ opt: 'alloctes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:plus-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="tableItemsRemove({ opt: 'alloctes', key: rowIndex })">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </template>

            <template #team_default="{ row }">
              {{ row.team_name }}
            </template>
            <template #team_edit="{ row }">
              <SpCascader
                v-model:value="row.team_id"
                :options="teamTreeOptions"
                placeholder="请选择"
                value-field="id"
                @update:value="(_value, options) => row.team_name = options.label"
              />
            </template>
            <template #branch_default="{ row }">
              {{ row.branch_name }}
            </template>
            <template #branch_edit="{ row, index }">
              <TeamPicker
                v-model:value="row.branch_id"
                :options="row.branch_name"
                :team_id="row.team_id"
                :disabled="!row.team_id"
                @change="(options) => handleAlloctesBranchSelected(index, options)"
              />
            </template>

            <template #position_edit="{ row }">
              <SpDict v-model:value="row.position" name="岗位" clearable />
            </template>

            <template #pcs_edit="{ row }">
              <n-input-number v-model:value="row.pcs" :precision="1" :show-button="false" clearable />
            </template>

            <template #van_edit="{ row }">
              <n-input-number v-model:value="row.van" :precision="1" :show-button="false" clearable />
            </template>

            <template #amount_edit="{ row }">
              <n-input-number v-model:value="row.amount" :precision="2" :show-button="false" clearable />
            </template>

            <template #scale_edit="{ row }">
              <n-select v-model:value="row.scale" value-field="label" :options="scaleOptions" clearable />
            </template>

            <template #salary_edit="{ row }">
              <n-input-number v-model:value="row.salary" :precision="2" :show-button="false" clearable />
            </template>
          </SpTable>
        </n-collapse-item>
      </n-collapse>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div class="stamp-text">
        {{ enumStore.getLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <n-layout-sider
          v-if="formModel.processes && formModel.processes.length > 0"
          show-trigger="bar"
          collapse-mode="transform"
          :collapsed-width="0"
          :width="256"
          :native-scrollbar="false"
        >
          <div class="mb-2 flex flex-col items-center justify-center gap-1">
            <n-qr-code :value="formModel.no || ''" :size="160" padding="0" />
            <span style="font-size: 20px">{{ formModel.no }}</span>
            <n-button
              quaternary
              round
              size="large"
              :type="formModel.opt_return ? 'warning' : 'info'"
              @click="handleLogs('process')"
            >
              点击查看流程日志
            </n-button>
          </div>
          <n-steps vertical class="p-2">
            <n-step
              v-for="item in formModel.processes"
              :key="item"
              :status="item.status === '不同意' ? 'error' : item.status ? 'process' : 'wait'"
            >
              <template #title>
                <span>{{ item.step_name }}</span>
              </template>
              <template #default>
                <p>
                  {{ item.audit_name }}<span v-if="item.status"> / {{ item.status }}</span>
                </p>
                <p v-if="item.remark">
                  {{ item.remark }}
                </p>
                <p>{{ item.audit_time }}</p>
              </template>
            </n-step>
          </n-steps>
        </n-layout-sider>
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="8" label="所属单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="登记日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="项目类型">
              <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="合同编号">
              <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="项目名称">
              <n-input v-model:value="formModel.name" placeholder="" readonly>
                <template #suffix>
                  {{ formModel.source }}
                </template>
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi v-if="formModel.revise" :span="8" label="生效日期">
              <n-input :value="formModel.transform.revise" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi v-else :span="8" label="开始日期">
              <n-input :value="formModel.transform?.indate" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="结束日期">
              <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="续约提醒">
              <n-input v-model:value="formModel.renew" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="业务模式">
              <n-input :value="formModel.transform?.pattern" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="履约保证金">
              <n-input-number v-model:value="formModel.ensure" placeholder="" :readonly="true" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="保证金到期日">
              <n-input :value="formModel.transform?.insure" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="人数">
              <n-input-number v-model:value="formModel.pcs" placeholder="" :readonly="true" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="总服务费">
              <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="负责人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi v-if="formModel.reason" :span="24" label="终止原因">
              <n-input
                v-model:value="formModel.reason"
                type="textarea"
                :rows="3"
                placeholder=""
                readonly="true"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="备注">
              <n-input
                v-model:value="formModel.remark"
                type="textarea"
                :rows="3"
                placeholder=""
                readonly="true"
              />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_htyj && formModel.files_htyj.length > 0"
              :span="8"
              label="合同原件"
            >
              <Upload v-model:value="formModel.files_htyj" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_gdht && formModel.files_gdht.length > 0"
              :span="8"
              label="归档合同"
            >
              <Upload v-model:value="formModel.files_gdht" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_cbys && formModel.files_cbys.length > 0"
              :span="8"
              label="成本预算"
            >
              <Upload v-model:value="formModel.files_cbys" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_yyzz && formModel.files_yyzz.length > 0"
              :span="8"
              label="营业执照"
            >
              <Upload v-model:value="formModel.files_yyzz" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_sfz && formModel.files_sfz.length > 0"
              :span="8"
              label="身份证"
            >
              <Upload v-model:value="formModel.files_sfz" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_jht && formModel.files_jht.length > 0"
              :span="8"
              label="旧合同"
            >
              <Upload v-model:value="formModel.files_jht" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_bcxy && formModel.files_bcxy.length > 0"
              :span="8"
              label="补充协议"
            >
              <Upload v-model:value="formModel.files_bcxy" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_zmcl && formModel.files_zmcl.length > 0"
              :span="8"
              label="证明材料"
            >
              <Upload v-model:value="formModel.files_zmcl" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_zzxy && formModel.files_zzxy.length > 0"
              :span="8"
              label="终止协议"
            >
              <Upload v-model:value="formModel.files_zzxy" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_zzsq && formModel.files_zzsq.length > 0"
              :span="8"
              label="客户出具申请书"
            >
              <Upload v-model:value="formModel.files_zzsq" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_jcxy && formModel.files_jcxy.length > 0"
              :span="8"
              label="解除协议通知书"
            >
              <Upload v-model:value="formModel.files_jcxy" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_jcsm && formModel.files_jcsm.length > 0"
              :span="8"
              label="纠察出具事实情况说明"
            >
              <Upload v-model:value="formModel.files_jcsm" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_jczj && formModel.files_jczj.length > 0"
              :span="8"
              label="中队负责人通知对方的证据"
            >
              <Upload v-model:value="formModel.files_jczj" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_qksm && formModel.files_qksm.length > 0"
              :span="8"
              label="情况说明"
            >
              <Upload v-model:value="formModel.files_qksm" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_cns && formModel.files_cns.length > 0"
              :span="8"
              label="承诺书"
            >
              <Upload v-model:value="formModel.files_cns" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_xctp && formModel.files_xctp.length > 0"
              :span="24"
              label="现场图片"
            >
              <Upload v-model:value="formModel.files_xctp" :only-image="false" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files_zfsm && formModel.files_zfsm.length > 0"
              :span="24"
              label="作废说明"
            >
              <Upload v-model:value="formModel.files_zfsm" :only-image="false" :disabled="true" />
            </n-form-item-gi>
          </n-grid>

          <n-collapse arrow-placement="right" :default-expanded-names="['incomes']">
            <n-collapse-item title="收入明细" name="incomes">
              <SpTable ref="incomesViewTableRef" v-bind="incomesViewGridOptions" :data-source="formModel.incomes">
                <template #payment_default="{ row }">
                  {{ enumStore.getLabel('trade_project_payment', row.payment) }}
                </template>
              </SpTable>
            </n-collapse-item>
            <n-collapse-item title="费用明细" name="expenses">
              <SpTable ref="expensesViewTableRef" v-bind="expensesViewGridOptions" :data-source="formModel.expenses" />
            </n-collapse-item>
            <n-collapse-item title="级别明细" name="scales">
              <SpTable ref="scalesViewTableRef" v-bind="scalesViewGridOptions" :data-source="formModel.scales" />
            </n-collapse-item>
            <n-collapse-item title="岗位明细" name="alloctes">
              <SpTable ref="alloctesViewTableRef" v-bind="alloctesViewGridOptions" :data-source="formModel.alloctes" />
            </n-collapse-item>
          </n-collapse>
        </n-layout>
      </n-layout>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="crm/project"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button
          v-if="showEdit() && formModel.opt_submit && !isApprove"
          type="primary"
          @click="edit(formModel.id)"
        >
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
        <n-button
          v-if="formModel.opt_affirm && !isEdit"
          type="primary"
          :loading="btnLoading"
          @click="updateStartModalShow"
        >
          盖章
        </n-button>
        <n-button
          v-if="formModel.opt_handle && !isEdit"
          type="primary"
          :loading="btnLoading"
          @click="updateFiles"
        >
          归档
        </n-button>
        <n-button
          v-if="formModel.opt_finish && !isEdit"
          type="error"
          :loading="btnLoading"
          @click="updateExpireModalShow"
        >
          终止
        </n-button>
        <!-- 审批 -->
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('同意')"
        >
          同意
        </n-button>
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('不同意')"
        >
          不同意
        </n-button>
        <n-button
          v-if="formModel.opt_cancel && isApprove"
          type="primary"
          :loading="btnLoading"
          @click="handleCancel"
        >
          取消
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && modalMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('撤回')"
        >
          撤回
        </n-button>
        <n-button
          v-if="formModel.opt_handle && !isEdit"
          type="primary"
          :loading="btnLoading"
          @click="updateInvalidModalShow"
        >
          作废
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="riseModalRef" title="浮动绩效设置" width="900" :mask="true" :draggable="true">
    <template #default>
      <div class="w-full flex flex-col gap-[15px]">
        <n-card v-for="(item, key) in riseDataList" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="flex items-stretch">
            <div class="label-nums">
              <n-text strong>
                #{{ Number(key) + 1 }}
              </n-text>
            </div>

            <div class="detail-card-box-content">
              <n-form
                label-placement="left"
                require-mark-placement="left"
                :label-width="60"
              >
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="12" label="评级" :show-feedback="false" :show-require-mark="true">
                    <n-select v-model:value="item.rate" :options="ratesOptions" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="12" label="值" :show-feedback="false" :show-require-mark="true">
                    <n-input-number v-model:value="item.value" :show-button="false" clearable />
                  </n-form-item-gi>
                </n-grid>
              </n-form>
            </div>

            <div class="menu-bar">
              <div class="flex items-start justify-center gap-[10px]">
                <n-button v-if="riseDataList.length > 1" :disabled="Number(key) === 0" text @click="riseDataListItemMoveUp(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button
                  v-if="riseDataList.length > 1"
                  :disabled="Number(key) === riseDataList.length - 1"
                  text
                  @click="riseDataListItemMoveDown (key)"
                >
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="riseDataListItemCopy(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:copy-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="riseDataListItemRemove(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </n-card>
        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="riseDataListItemAdd">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增
          </n-button>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="riseModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleRiseSet">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="updateMonthsModalRef"
    title="排除月份"
    width="450"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex items-center justify-center pb-6 pt-1">
        <n-select
          v-model:value="updateMonthsValue"
          :options="updateMonthsOptions"
          max-tag-count="responsive"
          clearable
          multiple
          style="width: 100%"
        />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateMonthsModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleUpdateMonths">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="processModalRef"
    width="500"
    :title="processTitle"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-input v-model:value="processRemark" type="textarea" :rows="5" clearable />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="processModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="process">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="updateStartModalRef"
    title="合同盖章"
    width="450"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-input v-model:value="updateStartValue" clearable />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateStartModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleUpdateStart">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="updateInvalidModalRef"
    title="项目作废"
    width="720"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <n-form label-placement="left" require-mark-placement="left" :label-width="100">
        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi :span="22" label="作废原因">
            <n-input v-model:value="updateInvalidInfo.reason" type="textarea" :rows="3" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="22" label="附件" path="files_zfsm">
            <Upload
              v-model:value="updateInvalidInfo.files_zfsm"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateInvalidModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="process">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="updateExpireModalRef"
    title="项目终止"
    width="960"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <n-form label-placement="left" require-mark-placement="left" :label-width="100">
        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi :span="8" label="终止日期">
            <n-date-picker v-model:value="updateExpireInfo.expire" type="date" fast-month-select clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="终止起因">
            <n-select v-model:value="updateExpireInfo.causes" :options="causesOptions" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="终止时金额">
            <n-input-number
              v-model:value="updateExpireInfo.amount"
              :precision="2"
              :show-button="false"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="24" label="终止原因">
            <n-input v-model:value="updateExpireInfo.reason" type="textarea" :rows="3" clearable />
          </n-form-item-gi>
          <n-form-item-gi
            v-if="updateExpireInfo.causes && updateExpireInfo.causes === '双方终止'"
            :span="11"
            label="终止协议"
            path="files_zzxy"
          >
            <Upload
              v-model:value="updateExpireInfo.files_zzxy"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi
            v-if="updateExpireInfo.causes && updateExpireInfo.causes === '双方终止'"
            :span="11"
            label="客户出具申请书"
            path="files_zzsq"
          >
            <Upload
              v-model:value="updateExpireInfo.files_zzsq"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi
            v-if="updateExpireInfo.causes && updateExpireInfo.causes === '单方终止'"
            :span="11"
            label="解除协议通知书"
            path="files_jcxy"
          >
            <Upload
              v-model:value="updateExpireInfo.files_jcxy"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi
            v-if="updateExpireInfo.causes && updateExpireInfo.causes === '单方终止'"
            :span="11"
            label="纠察出具事实情况说明"
            path="files_jcsm"
          >
            <Upload
              v-model:value="updateExpireInfo.files_jcsm"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi
            v-if="updateExpireInfo.causes && updateExpireInfo.causes === '单方终止'"
            :span="11"
            label="中队负责人通知对方的证据"
            path="files_jczj"
          >
            <Upload
              v-model:value="updateExpireInfo.files_jczj"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="11" label="合同原件" path="files_htyj">
            <Upload
              v-model:value="updateExpireInfo.files_htyj"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="11" label="情况说明" path="files_qksm">
            <Upload
              v-model:value="updateExpireInfo.files_qksm"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="11" label="承诺书" path="files_cns">
            <Upload
              v-model:value="updateExpireInfo.files_cns"
              :max-number="1"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="22" label="现场图片" path="files_xctp">
            <Upload
              v-model:value="updateExpireInfo.files_xctp"
              :only-image="false"
              upload-title="上传附件"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateExpireModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleUpdateExpire">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
  <FileManager ref="fileMgrRef" @on-ok="handleFileOk" />
</template>
