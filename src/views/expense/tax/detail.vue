<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { add as lodashAdd } from 'xe-utils'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { ExpenseContractPicker, MemberPicker, PartnerPicker } from '@/components/SpTablePicker'
import { createTransformer, toDateLabel, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { tax as api, query } from '@/service/api/expense'
import { roster } from '@/service/api/hr'
import { bankAccount, subject } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'
import { useUserStore } from '@/store/modules/user'
import { tenantStorage } from '@/utils/tenant'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const userStore = useUserStore()
const enumStore = useEnumStore()

const logBizRef = ref<OpenModal | null>(null)

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

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
  finishApproval,
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
      date: val => toDateLabel(val),
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

const { tableItemsAdd, tableItemsRemove, tableItemsMoveUp, tableItemsMoveDown, tableItemsCopy } = useTableItems(formModel)

/** 新增一行的默认值，与表单字段保持一致 */
function itemsAdd() {
  tableItemsAdd({ opt: 'list', def: { digest: null, content_id: null, amount: null, files: [], files_fp: [], allots: [] } })
}

function rowsChange(e, tref) {
  tref?.editRowEvent(e.row)
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
export default { name: 'ExpenseClaimTaxDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
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
          <MemberPicker
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
          <ExpenseContractPicker v-model:value="formModel.contract_id" :team_id="formModel.team_id" />
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
          <PartnerPicker v-model:value="formModel.outer_id" types="1" @change="handleOuterSelected" />
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

      <div class="mt-4">
        <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
          <template #operate="{ rowIndex }">
            <div class="flex items-center justify-right gap-[10px]">
              <n-button v-if="formModel.list.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:arrow-up-outlined" />
                  </n-icon>
                </template>
              </n-button>
              <n-button v-if="formModel.list.length > 1" :disabled="Number(rowIndex) === formModel.list.length - 1" text @click="tableItemsMoveDown({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:arrow-down-outlined" />
                  </n-icon>
                </template>
              </n-button>
              <n-button text @click="tableItemsCopy({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:copy-outlined" />
                  </n-icon>
                </template>
              </n-button>
              <n-button text @click="tableItemsAdd({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
              </n-button>
              <n-button text @click="tableItemsRemove({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:delete-outlined" />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </template>
          <template #digest_edit="{ row }">
            <n-input v-model:value="row.digest" clearable />
          </template>
          <template #content_default="{ row }">
            {{ row.expense_name }}
          </template>
          <template #content_edit="{ row }">
            <SpCascader
              v-model:value="row.content_id"
              :options="contentTreeOptions"
              placeholder="请选择"
              value-field="id"
              @update:value="itemsContentSelected"
            />
          </template>
          <template #amount_edit="{ row }">
            <n-input-number
              v-model:value="row.amount"
              :precision="2"
              :show-button="false"
              clearable
              @update:value="handleAmountTotal"
            />
          </template>
          <template #files_default="{ row }">
            <span v-if="row.files && row.files.length > 0">{{ row.files.length }} 个附件</span>
          </template>
          <template #files_edit="{ row }">
            <Upload v-model:value="row.files" :only-image="false" upload-title="上传附件" />
          </template>
        </SpTable>
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
        <BizProcessSider :model="formModel" />
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

          <div class="mt-4">
            <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list">
              <template #files_default="{ row }">
                <span v-if="row.files && row.files.length > 0">{{ row.files.length }} 个附件</span>
              </template>
            </SpTable>
          </div>
        </n-layout>
      </n-layout>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="logBizRef?.open({ xid: formModel.id })">
          操作日志
        </n-button>
        <BizDraftBox
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
        <BizApprovalActions
          :model="formModel"
          biz-class="Pense"
          :is-approve="isApprove"
          :detail-mode="detailMode"
          @done="finishApproval"
        />
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
