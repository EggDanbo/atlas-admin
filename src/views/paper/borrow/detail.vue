<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { LogProcess } from '@/components/Logs/process'
import { SpCascader } from '@/components/SpCascader'
import { UserSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { team as teamApi } from '@/service/api/organ'
import { borrow as api, info } from '@/service/api/paper'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

const borrowModalRef = ref<ModalInst | null>(null)
const confirmModalRef = ref<ModalInst | null>(null)
const confirmUser = ref<string | null>(null)
const confirmStates = ref<string | null>(null)
const confirmRemark = ref<string | null>(null)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

const paperListOptions = ref<Recordable[]>([])
async function loadPaperListOptions() {
  const { isSuccess, data } = await info.getList()
  if (isSuccess) {
    paperListOptions.value = data
  }
}

async function load() {
  await loadTeamTree()
  await loadPaperListOptions()
}

function createFormModel() {
  return {
    id: '0',
    opt_cancel: false,
    opt_confirm: false,
    opt_submit: false,
    team_id: null,
    team_name: null,
    no: null,
    user_id: null,
    user_name: null,
    date: Date.now(),
    title: null,
    types: null,
    digest: null,
    paper_id: null,
    paper_name: null,
    remark: null,
    list: [] as any,
    files: [] as any,
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择申请单位', trigger: 'change' }],
    user_id: [{ required: true, message: '请选择申请人', trigger: 'change' }],
    paper_id: [{ required: true, message: '请选择借阅档案', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择单据日期', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    types: [{ required: true, message: '请选择档案类型', trigger: 'change' }],
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
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
  title: '档案借阅',
  permission: { useTabPermission: true, permName: 'DEMO_PAPER_BORROW' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id', 'user_id', 'paper_id'],
    string: ['types'],
    number: ['date'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      types: 'paper_borrow_types',
    },
  }),
  beforeEdit: async () => {
    await load()
    return true
  },
  beforeView: () => {
    if (formModel.list && formModel.list.length > 0) {
      const items = formModel.list
      for (const i in items) {
        const item = items[i]
        if (item.enroll) {
          item.transform.enroll = format(Number(item.enroll), 'yyyy-MM-dd')
        }
      }
    }
    return true
  },
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

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

  const list = [{ id: formModel.id, biz_class: 'Paper' }]

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

function handleBorrow() {
  confirmUser.value = null
  borrowModalRef.value?.open()
}

async function borrow() {
  btnLoading.value = true
  const { isSuccess } = await api
    .handle({
      id: formModel.id,
      user_id: confirmUser.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  modalRef.value.close()
  borrowModalRef.value?.close()
  emit('on-action', 'EDIT')
}

function handleConfirm() {
  confirmUser.value = null
  confirmStates.value = null
  confirmRemark.value = null
  confirmModalRef.value?.open()
}

async function confirm() {
  btnLoading.value = true
  const { isSuccess } = await api
    .confirm({
      id: formModel.id,
      user_id: confirmUser.value,
      states: confirmStates.value,
      remark: confirmRemark.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  modalRef.value.close()
  confirmModalRef.value?.close()
  emit('on-action', 'EDIT')
}

async function handleCancel() {
  toast.infoModal('确定取消归还吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await api
        .cancel({
          id: formModel.id,
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

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PaperBorrowDetail' }
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
        <n-form-item-gi :span="12" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="申请人" path="user_id">
          <UserSelect
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            permission="DEMO_PAPER_BORROW"
            :team_id="formModel.team_id"
            :disabled="!formModel.team_id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="单据日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="借阅类型" path="types">
          <n-select v-model:value="formModel.types" :options="enumStore.getEnumOptions('paper_borrow_types')" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="借阅档案" path="team_id">
          <n-select v-model:value="formModel.paper_id" :options="paperListOptions" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="申请事由" path="digest">
          <n-input v-model:value="formModel.digest" type="textarea" :rows="3" clearable />
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
      <div v-if="formModel.status" class="stamp-text">
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
            <n-form-item-gi :span="16" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="单据日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="借阅类型">
              <n-input :value="formModel.transform?.types" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="借阅档案">
              <n-input v-model:value="formModel.paper_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请事由">
              <n-input v-model:value="formModel.digest" type="textarea" :rows="3" placeholder="" readonly />
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
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="paper/borrow"
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
        <n-button
          v-if="formModel.opt_borrow && !isApprove"
          type="primary"
          @click="handleBorrow"
        >
          借出
        </n-button>
        <n-button
          v-if="formModel.opt_handle && !isApprove"
          type="primary"
          @click="handleConfirm"
        >
          归还
        </n-button>
        <n-button
          v-if="formModel.opt_restore && !isApprove"
          type="primary"
          :loading="btnLoading"
          @click="handleCancel"
        >
          取消归还
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

  <SpModal
    ref="borrowModalRef"
    width="500"
    title="借阅处理"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex flex-col gap-[12px] pb-3 pt-3">
        <div class="w-full">
          <UserSelect
            v-model:value="confirmUser"
            :team_id="formModel.team_id"
            placeholder="接收人"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="borrowModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="borrow">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="confirmModalRef"
    width="500"
    title="借阅归还"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex flex-col gap-[12px] pb-3 pt-3">
        <div class="w-full">
          <UserSelect
            v-model:value="confirmUser"
            :team_id="formModel.team_id"
            placeholder="归还人"
          />
        </div>
        <div class="w-full">
          <n-select
            v-model:value="confirmStates"
            :options="enumStore.getEnumOptions('paper_borrow_states')"
            placeholder="归还状态"
            @update:value="confirmRemark = null"
          />
        </div>
        <div class="w-full">
          <n-input
            v-model:value="confirmRemark"
            type="textarea"
            :rows="5"
            clearable
            :readonly="Number(confirmStates) === 1 ? true : false"
            placeholder="归还说明"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="confirmModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="confirm">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
</template>
