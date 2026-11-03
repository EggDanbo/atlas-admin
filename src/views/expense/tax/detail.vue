<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { add as lodashAdd, round } from 'xe-utils'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { LogProcess } from '@/components/Logs/process'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { OuterSelect, PenseContractSelect, UserSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { tax as api, query } from '@/service/api/expense'
import { roster } from '@/service/api/hr'
import { bankAccount, subject } from '@/service/api/masterdata'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { useUserStore } from '@/store/modules/user'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const userStore = useUserStore()
const enumStore = useEnumStore()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

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

const teamAllotOptions = ref<Recordable[]>([])
async function loadAllotTree() {
  const { isSuccess, data } = await teamApi.tree({
    stoped: false,
    all: true,
  })
  if (!isSuccess)
    return
  teamAllotOptions.value = data
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

const accountOptions = ref<Recordable[]>([])
async function loadAccountOptions() {
  const { isSuccess, data } = await bankAccount.tree({
    stoped: false,
  })
  if (!isSuccess)
    return
  accountOptions.value = data
}

const applyListOptions = ref<Recordable[]>([])
async function loadApplyList() {
  if (!formModel.team_id)
    return
  const { isSuccess, data } = await query.getApply({
    team_id: formModel.team_id,
  })
  if (!isSuccess)
    return
  applyListOptions.value = data
}

async function getUserInfo(id: string) {
  const { isSuccess, data } = await roster.getInfo({ id })
  if (isSuccess) {
    const list = data
    formModel.payee_id = list.id
    formModel.payee_name = list.name
    formModel.payee_bank = list.bank_code
    formModel.payee_open = list.bank_open
    formModel.payee_link = list.bank_link
  }
}

async function load() {
  await loadTeamTree()
  await loadAllotTree()
  await loadContentOptions()
  await loadAccountOptions()
  await loadApplyList()
}

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    opt_print: false,
    opt_submit: false,
    opt_return: false,
    team_id: null,
    team_name: null,
    user_id: null,
    user_name: null,
    date: Date.now(),
    title: null,
    digest: null,
    amount: null,
    contract_id: null,
    apply_id: null,
    remark: null,
    payee_id: null,
    payee_name: null,
    payee_bank: null,
    payee_open: null,
    payee_link: null,
    is_require: false,
    files: [],
    list: [],
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择申请单位', trigger: 'change' }],
    user_id: [{ required: true, message: '请选择申请人', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择申请日期', trigger: 'change' }],
    title: [{ required: true, message: '请输入申请标题', trigger: 'change' }],
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
    payee_id: [{ required: true, message: '请选择收款人', trigger: 'change' }],
    payee_bank: [{ required: true, message: '请输入收款账号', trigger: 'change' }],
    payee_open: [{ required: true, message: '请输入开户银行', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.list.length; i++) {
    rules[`list[${i}].digest`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].content_id`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  }

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
  title: '税费支付申请',
  permission: { useTabPermission: true, permName: 'EXP_CLAIM_TAX' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
  }),
  beforeEdit: async () => {
    if (Number(formModel.id) !== 0) {
      const userInfo = userStore.userInfo
      formModel.user_id = userInfo?.userid
      formModel.user_name = userInfo?.name
    }
    if (formModel.list.length === 0) {
      itemsAdd()
    }

    await load()
    return true
  },
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
})

function itemsAdd() {
  const def = {
    digest: null,
    invoice: null,
    content_id: null,
    amount: null,
    files: [],
    files_fp: [],
    allots: [],
  }
  formModel.list.push(def)
}

function itemsMoveUp(key) {
  if (Number(key) === 0)
    return
  const items = formModel.list;
  [items[key], items[key - 1]] = [items[key - 1], items[key]]
}

function itemsMoveDown(key) {
  if (Number(key) < formModel.list.length - 1) {
    const items = formModel.list;
    [items[key], items[key + 1]] = [items[key + 1], items[key]]
  }
}

function itemsCopy(key) {
  const items = formModel.list[key]
  const newItems = { ...items }
  formModel.list.splice(key + 1, 0, newItems)
}

function itemsRemove(key) {
  formModel.list.splice(key, 1)
}

function itemsAllotsAdd(keys) {
  const def = {
    team_id: null,
    amount: null,
  }
  formModel.list[keys].allots.push(def)
}

function itemsAllotsMoveUp(keys, key) {
  if (Number(key) === 0)
    return
  const items = formModel.list[keys].allots;
  [items[key], items[key - 1]] = [items[key - 1], items[key]]
}

function itemsAllotsMoveDown(keys, key) {
  if (Number(key) < formModel.list[keys].allots.length - 1) {
    const items = formModel.list[keys].allots;
    [items[key], items[key + 1]] = [items[key + 1], items[key]]
  }
}

function itemsAllotsCopy(keys, key) {
  const items = formModel.list[keys].allots[key]
  const newItems = { ...items }
  formModel.list[keys].allots.splice(key + 1, 0, newItems)
}

function itemsAllotsRemove(keys, key) {
  formModel.list[keys].allots.splice(key, 1)
}

async function handleProcess(opt: string) {
  processTypes.value = opt
  processRemark.value = null
  if (opt === '同意') {
    processTitle.value = '审批意见'
    await process()
  }
  else {
    processTitle.value = `${opt}原因`
    processModalRef.value?.open()
  }
}

async function process() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const list = [{ id: formModel.id, biz_class: 'Pense' }]

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
            biz_class: 'Pense',
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

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id })
  }
}

async function handleUserSelected(item: any, opt: string) {
  if (opt === 'user') {
    formModel.user_id = item.id
    formModel.user_name = item.label
  }
  else if (opt === 'payee') {
    formModel.payee_id = item.id
    formModel.payee_name = item.label
    await getUserInfo(formModel.payee_id)
  }
}

function handleOuterSelected(options: any) {
  formModel.payee_id = options.id
  formModel.payee_name = options.name
  formModel.payee_bank = options.account
  formModel.payee_open = options.deposit
  formModel.payee_link = options.relation
}

function handleAmountTotal() {
  const amount = formModel.list.map(q => q.amount).reduce((a, b) => lodashAdd(a, b))
  formModel.amount = amount.toFixed(2)
}

function handleAllotAmountTotal(keys) {
  const amount = formModel.list[keys].allots
    .map(q => q.amount)

    .reduce((a, b) => lodashAdd(a, b))
  formModel.list[keys].amount = round(amount, 2)
  handleAmountTotal()
}

async function handleTeamSelected(e, options) {
  if (e && options.id !== options.cuid) {
    formModel.require = '否'
    formModel.is_require = true
  }
  else {
    formModel.require = null
    formModel.is_require = false
  }

  formModel.apply_id = null
  applyListOptions.value = []
  await loadApplyList()
}

function itemsContentSelected(e, options) {
  for (const i in formModel.list) {
    const items = formModel.list[i]
    if (items.expense_id === e) {
      if (options.code.includes('005') || options.code.includes('006')) {
        items.isCar = true
        if (!items.vehicle)
          items.vehicle = null
      }
      else {
        items.isCar = false
        items.vehicle = null
      }
    }
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PensePayerDetail' }
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
        <n-form-item-gi :span="8" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="handleTeamSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请人" path="user_id">
          <UserSelect
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            :stoped="false"
            :permission="`${tabPermName}`"
            @change="handleUserSelected($event, 'user')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="付款合同" path="contract_id">
          <PenseContractSelect v-model:value="formModel.contract_id" :team_id="formModel.team_id" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="申请标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="申请事由" path="digest">
          <n-input v-model:value="formModel.digest" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="事前申请" path="apply_id">
          <n-select
            v-model:value="formModel.apply_id"
            :options="applyListOptions"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="申请金额" path="amount">
          <n-input-number v-model:value="formModel.amount" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="收款人" path="payee_id">
          <OuterSelect v-model:value="formModel.outer_id" types="1" @change="handleOuterSelected" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="收款账号" path="payee_bank">
          <n-input v-model:value="formModel.payee_bank" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开户银行" path="payee_open">
          <SpDict v-model:value="formModel.payee_open" name="开户银行" filterable tag clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="联行号" path="payee_link">
          <n-input v-model:value="formModel.payee_link" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi>
      </n-grid>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          报销明细
        </n-divider>
        <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="flex items-stretch">
            <div class="label-nums">
              <n-text strong>
                #{{ Number(key) + 1 }}
              </n-text>
            </div>

            <div class="detail-card-box-content">
              <n-grid :cols="24" :x-gap="24" :y-gap="24">
                <n-form-item-gi :span="24" label="摘要" :path="`list[${key}].digest`" label-width="80" :show-feedback="false">
                  <n-input v-model:value="item.digest" clearable />
                </n-form-item-gi>
                <n-form-item-gi :span="12" label="费用分类" :path="`list[${key}].content_id`" label-width="80" :show-feedback="false">
                  <SpCascader
                    v-model:value="item.content_id"
                    :options="contentTreeOptions"
                    placeholder="请选择"
                    value-field="id"
                    @update:value="itemsContentSelected"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="12" label="金额" :path="`list[${key}].amount`" label-width="80" :show-feedback="false">
                  <n-input-number
                    v-model:value="item.amount"
                    :precision="2"
                    :show-button="false"
                    clearable
                    @update:value="handleAmountTotal"
                  />
                </n-form-item-gi>
                <n-form-item-gi v-if="item.files_fp && item.files_fp.length > 0" :span="24" label="发票附件">
                  <Upload v-model:value="item.files_fp" :only-image="false" upload-title="上传发票" :disabled="true" />
                </n-form-item-gi>
                <n-form-item-gi :span="24" label="附件">
                  <Upload v-model:value="item.files" :only-image="false" upload-title="上传附件" />
                </n-form-item-gi>
              </n-grid>

              <div class="detail-card-sub-box flex flex-col" style="gap: 16px; margin-top: 16px; padding: 15px;">
                <n-divider title-placement="left" style="margin: 0;">
                  分摊明细
                </n-divider>
                <n-card v-for="(allot, allot_key) in item.allots" :key="allot_key" :content-style="{ padding: '0' }" class="detail-card-box">
                  <div class="flex items-stretch">
                    <div class="label-nums">
                      <n-text strong>
                        #{{ Number(allot_key) + 1 }}
                      </n-text>
                    </div>

                    <div class="detail-card-box-content">
                      <n-grid :cols="24" :x-gap="24" :y-gap="24">
                        <n-form-item-gi :span="16" label="分摊单位" :path="`list[${key}].allot[${allot_key}].team_id`" label-width="80" :show-feedback="false">
                          <SpCascader
                            v-model:value="allot.team_id"
                            :options="teamTreeOptions"
                            placeholder="请选择"
                            value-field="id"
                          />
                        </n-form-item-gi>
                        <n-form-item-gi :span="8" label="分摊金额" :path="`list[${key}].allot[${allot_key}].amount`" label-width="80" :show-feedback="false">
                          <n-input-number
                            v-model:value="allot.amount"
                            :precision="2"
                            :show-button="false"
                            clearable
                            @update:value="handleAllotAmountTotal(allot_key)"
                          />
                        </n-form-item-gi>
                      </n-grid>
                    </div>

                    <div class="menu-bar">
                      <div class="flex items-start justify-center gap-[10px]">
                        <n-button v-if="item.allots.length > 1" :disabled="Number(key) === 0" text @click="itemsAllotsMoveUp(key, allot_key)">
                          <template #icon>
                            <n-icon>
                              <Icon icon="ant-design:arrow-up-outlined" />
                            </n-icon>
                          </template>
                        </n-button>
                        <n-button v-if="item.allots.length > 1" :disabled="Number(key) === formModel.list.length - 1" text @click="itemsAllotsMoveDown(key, allot_key)">
                          <template #icon>
                            <n-icon>
                              <Icon icon="ant-design:arrow-down-outlined" />
                            </n-icon>
                          </template>
                        </n-button>
                        <n-button text @click="itemsAllotsCopy(key, allot_key)">
                          <template #icon>
                            <n-icon>
                              <Icon icon="ant-design:copy-outlined" />
                            </n-icon>
                          </template>
                        </n-button>
                        <n-button text @click="itemsAllotsRemove(key, allot_key)">
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

                <div v-if="item.allots.length === 0" style="padding: 20px 0">
                  <n-empty
                    description="未填写分摊明细时默认由申请部门全部承担"
                    :show-icon="false"
                  />
                </div>

                <div class="w-full flex">
                  <n-button dashed round size="small" class="w-full" @click="itemsAllotsAdd(key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:plus-outlined" />
                      </n-icon>
                    </template>
                    添加分摊明细
                  </n-button>
                </div>
              </div>
            </div>

            <div class="menu-bar">
              <div class="flex items-start justify-center gap-[10px]">
                <n-button v-if="formModel.list.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button v-if="formModel.list.length > 1" :disabled="Number(key) === formModel.list.length - 1" text @click="itemsMoveDown(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="itemsCopy(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:copy-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="itemsRemove(key)">
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
          <n-button tertiary round size="small" class="w-full" @click="itemsAdd()">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加报销明细
          </n-button>
        </div>
      </div>
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
            <n-form-item-gi :span="8" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请事由">
              <n-input v-model:value="formModel.digest" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="事前申请">
              <n-input v-model:value="formModel.apply_no" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="申请金额" path="amount">
              <n-input-number v-model:value="formModel.amount" placeholder="" :show-button="false" :readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="收款人">
              <n-input v-model:value="formModel.payee_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="收款账号">
              <n-input v-model:value="formModel.payee_bank" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="开户银行">
              <n-input v-model:value="formModel.payee_open" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="联行号">
              <n-input v-model:value="formModel.payee_link" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="备注">
              <n-input v-model:value="formModel.remark" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files && formModel.files.length > 0"
              :span="24"
              label="附件"
            >
              <Upload v-model:value="formModel.files" :disabled="true" />
            </n-form-item-gi>
          </n-grid>

          <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
            <n-divider title-placement="left" style="margin: 0;">
              报销申请明细
            </n-divider>
            <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
              <div class="flex items-stretch">
                <div class="label-nums">
                  <n-text strong>
                    #{{ Number(key) + 1 }}
                  </n-text>
                </div>

                <div class="detail-card-box-content">
                  <n-grid :cols="24" :x-gap="24" :y-gap="24">
                    <n-form-item-gi :span="24" label="摘要" label-width="80" :show-feedback="false">
                      <n-input v-model:value="item.digest" placeholder="" readonly />
                    </n-form-item-gi>
                    <n-form-item-gi :span="12" label="费用分类" label-width="80" :show-feedback="false">
                      <n-input v-model:value="item.expense_name" placeholder="" readonly />
                    </n-form-item-gi>
                    <n-form-item-gi :span="12" label="金额" label-width="80" :show-feedback="false">
                      <n-input-number v-model:value="item.amount" placeholder="" :show-button="false" :readonly="true" />
                    </n-form-item-gi>
                    <n-form-item-gi
                      v-if="item.files_fp && item.files_fp.length > 0"
                      :span="24"
                      label="发票附件"
                    >
                      <Upload
                        v-model:value="item.files_fp"
                        :only-image="false"
                        upload-title="上传附件"
                        :disabled="true"
                      />
                    </n-form-item-gi>
                    <n-form-item-gi
                      v-if="item.files && item.files.length > 0"
                      :span="24"
                      label="附件"
                    >
                      <Upload
                        v-model:value="item.files"
                        :only-image="false"
                        upload-title="上传附件"
                        :disabled="true"
                      />
                    </n-form-item-gi>
                  </n-grid>
                  <div style="padding: 20px" class="mt-3">
                    <n-divider title-placement="left">
                      分摊明细
                    </n-divider>
                    <n-grid v-for="(allot, allot_key) in item.allots" :key="allot_key" :cols="24" :x-gap="20">
                      <n-form-item-gi :span="16" label="分摊单位" label-width="80" :show-feedback="false">
                        <div class="w-full">
                          <n-input v-model:value="allot.team_name" placeholder="" readonly />
                        </div>
                      </n-form-item-gi>
                      <n-form-item-gi :span="8" label="分摊金额" label-width="80" :show-feedback="false">
                        <n-input-number v-model:value="allot.amount" placeholder="" :show-button="false" :readonly="true" />
                      </n-form-item-gi>
                    </n-grid>
                  </div>
                </div>
              </div>
            </n-card>
          </div>
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
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="expense/tax"
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
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('撤回')"
        >
          撤回
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('作废')"
        >
          作废
        </n-button>
      </n-flex>
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
        <n-radio-group v-if="processTypes === '同意'" v-model:value="processRemark">
          <n-space>
            <n-radio value="拟同意，提交">
              拟同意，提交
            </n-radio>
            <n-radio value="同意">
              同意
            </n-radio>
          </n-space>
        </n-radio-group>
        <n-input
          v-model:value="processRemark"
          type="textarea"
          :rows="5"
          clearable
          :readonly="processTypes === '同意' ? true : false"
        />
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

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
</template>
