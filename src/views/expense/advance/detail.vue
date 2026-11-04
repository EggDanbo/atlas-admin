<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { ExpenseContractPicker, MemberPicker } from '@/components/SpTablePicker'
import { dictLabel } from '@/dicts'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { advance as api, query } from '@/service/api/expense'
import { roster } from '@/service/api/hr'
import { bankAccount, subject } from '@/service/api/masterdata'
import { useUserStore } from '@/store/modules/user'
import { tenantStorage } from '@/utils/tenant'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const userStore = useUserStore()

const logBizRef = ref<OpenModal | null>(null)

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

const projectListOptions = ref<Recordable[]>([])
async function loadApplyList() {
  if (!formModel.team_id)
    return
  const { isSuccess, data } = await query.getApply({
    team_id: formModel.team_id,
  })
  if (!isSuccess)
    return
  projectListOptions.value = data
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
    amount: [{ type: 'number', required: true, message: '请选择申请金额', trigger: 'change' }],
    title: [{ required: true, message: '请输入申请标题', trigger: 'change' }],
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
    payee_bank: [{ required: true, message: '请输入收款账号', trigger: 'change' }],
    payee_open: [{ required: true, message: '请输入开户银行', trigger: 'change' }],
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
  title: '备用金申请',
  permission: { useTabPermission: true, permName: 'EXP_CLAIM_ADVANCE' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date', 'predict'],
    custom: {
      date: val => toDateLabel(val),
      predict: val => toDateLabel(val),
    },
  }),
  beforeEdit: async () => {
    if (Number(formModel.id) !== 0) {
      const userInfo = userStore.userInfo
      formModel.user_id = userInfo?.userid
      formModel.user_name = userInfo?.name
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

async function handleUserSelected(item: any, opt: string) {
  if (opt === 'user') {
    formModel.user_id = item.id
    formModel.user_name = item.label
    await getUserInfo(formModel.user_id)
  }
  else if (opt === 'payee') {
    formModel.payee_id = item.id
    formModel.payee_name = item.label
    await getUserInfo(formModel.payee_id)
  }
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
  projectListOptions.value = []
  await loadApplyList()
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'ExpenseClaimAdvanceDetail' }
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
        <n-form-item-gi :span="8" label="申请金额" path="amount">
          <n-input-number v-model:value="formModel.amount" :precision="2" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="预计归还日期" path="predict">
          <n-date-picker v-model:value="formModel.predict" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="所属项目" path="project_id">
          <n-select
            v-model:value="formModel.project_id"
            :options="projectListOptions"
            clearable
          />
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
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div class="stamp-text">
        {{ dictLabel('workflow_status', formModel.status) }}
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
            <n-form-item-gi :span="8" label="申请金额">
              <n-input-number v-model:value="formModel.amount" placeholder="" :show-button="false" :readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="预计归还日期">
              <n-input :value="formModel.transform?.predict" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="所属项目">
              <n-input v-model:value="formModel.project_name" placeholder="" readonly="true" />
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
          types="expense/advance"
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
