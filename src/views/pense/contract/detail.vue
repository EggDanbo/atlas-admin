<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { LogProcess } from '@/components/Logs/process'
import { SpCascader } from '@/components/SpCascader'
import { OuterSelect, TradeProjectSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { team as teamApi } from '@/service/api/organ'
import { contract as api } from '@/service/api/pense'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

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

async function load() {
  await loadTeamTree()
}

const isApprove = ref<boolean>(false)
const modalMode = ref<string | null>(null)

const updateExpireModalRef = ref<ModalInst | null>(null)
const updateExpireInfo = ref({
  id: null as string | null,
  expire: null as number | null,
})

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
    outer_id: null,
    outer_name: null,
    project_id: null,
    project_name: null,
    date: Date.now(),
    no: null,
    name: null,
    types: null,
    source: null,
    payment: null,
    indate: null,
    revise: null,
    expire: null,
    amount: null,
    ensure: null,
    content: null,
    remark: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    outer_id: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    name: [{ required: true, message: '请输入合同名称', trigger: 'change' }],
    code: [{ required: true, message: '请输入合同编码', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择登记日期', trigger: 'change' }],
    indate: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
    expire: [{ type: 'number', required: true, message: '请选择结束日期', trigger: 'change' }],
    types: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
    payment: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
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
  title: '合同管理',
  permission: { useTabPermission: true, permName: 'DEMO_PENSE_CONTRACT' },
  canEdit: form => !form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onBeforeOpen: (params, mode) => {
    isApprove.value = params.approve
    modalMode.value = mode

    return true
  },
  transform: createTransformer({
    string: ['types', 'source', 'payment'],
    nullIfZero: ['team_id', 'outer_id', 'project_id'],
    number: ['date', 'amount', 'ensure', 'revise', 'indate', 'expire'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      revise: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      indate: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      types: 'pense_contract_types',
      source: 'pense_contract_source',
      payment: 'pense_contract_payment',
    },
  }),
  beforeEdit: async () => {
    await load()
    return true
  },
})

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

// function updateInvalidModalShow() {
//   updateInvalidInfo.value.id = formModel.id
//   updateInvalidInfo.value.reason = formModel.reason
//   updateInvalidInfo.value.files_zfsm = formModel.files_zfsm

//   updateInvalidModalRef.value?.open()
// }

// async function handleUpdateInvalid() {
//   btnLoading.value = true
//   const { isSuccess } = await api
//     .updateInvalid({ ...updateInvalidInfo.value })
//     .finally(() => (btnLoading.value = false))
//   if (isSuccess) {
//     toast.success('操作成功')
//     updateInvalidModalRef.value?.close()
//     modalRef.value.close()
//     emit('on-action', 'edit')
//   }
// }

function updateExpireModalShow() {
  updateExpireInfo.value.id = formModel.id
  updateExpireInfo.value.expire = formModel.expire ? Number(formModel.expire) : null

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

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id })
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PenseContractDetail' }
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
        <n-form-item-gi :span="8" label="所属单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="登记日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同类型" path="types">
          <n-select
            v-model:value="formModel.types"
            :options="enumStore.getEnumOptions('pense_contract_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="合同名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="80" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同编号" path="no">
          <n-input v-model:value="formModel.no" maxlength="30" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="供应商" path="outer_id">
          <OuterSelect
            v-model:value="formModel.outer_id"
            :options="formModel.outer_name"
            types="1"
          />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.revise" :span="8" label="生效日期" path="revise">
          <n-date-picker v-model:value="formModel.revise" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi v-else :span="8" label="开始日期" path="indate">
          <n-date-picker v-model:value="formModel.indate" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="所属项目" path="project_id">
          <TradeProjectSelect v-model:value="formModel.project_id" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期" path="expire">
          <n-date-picker v-model:value="formModel.expire" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="支付方式" path="payment">
          <n-select
            v-model:value="formModel.payment"
            :options="enumStore.getEnumOptions('pense_contract_payment')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同金额" path="amount">
          <n-input-number
            v-model:value="formModel.amount"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同押金" path="ensure">
          <n-input-number
            v-model:value="formModel.ensure"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="合同内容" path="district">
          <n-input v-model:value="formModel.content" maxlength="255" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi v-if="Number(formModel.types) !== 2" :span="8" label="合同原件" path="files">
          <Upload
            v-model:value="formModel.files"
            :max-number="1"
            :only-image="false"
            upload-title="上传附件"
          />
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
            <n-form-item-gi :span="8" label="合同类型">
              <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="合同名称">
              <n-input v-model:value="formModel.name" placeholder="" readonly>
                <template #suffix>
                  {{ formModel.transform?.source }}
                </template>
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="合同编号">
              <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="供应商">
              <n-input v-model:value="formModel.outer_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi v-if="formModel.revise" :span="8" label="生效日期">
              <n-input :value="formModel.transform.revise" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi v-else :span="8" label="开始日期">
              <n-input :value="formModel.transform?.indate" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="所属项目">
              <n-input v-model:value="formModel.project_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="结束日期">
              <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="支付方式">
              <n-input :value="formModel.transform?.payment" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="合同金额">
              <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="合同押金">
              <n-input-number v-model:value="formModel.ensure" placeholder="" :readonly="true" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="合同内容">
              <n-input v-model:value="formModel.content" placeholder="" readonly="true" />
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
              v-if="formModel.files_htyj && formModel.files.length > 0"
              :span="24"
              label="附件"
            >
              <Upload v-model:value="formModel.files" :only-image="false" :disabled="true" />
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
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="pense/contract"
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
        <!-- <n-button
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
        </n-button> -->
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
    ref="updateExpireModalRef"
    title="合同终止"
    width="360"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-date-picker v-model:value="updateExpireInfo.expire" type="date" fast-month-select clearable />
      </div>
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
</template>
