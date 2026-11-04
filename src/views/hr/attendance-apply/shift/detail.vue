<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { MemberPicker } from '@/components/SpTablePicker'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { shift as api } from '@/service/api/hr/attendance-apply'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()

const logBizRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    opt_submit: false,
    opt_confirm: false,
    opt_cancel: false,
    status: null,
    team_name: null,
    user_name: null,
    swap_id: null,
    swap_name: null,
    no: null,
    date: null,
    checkin_date: null,
    checkin_back: null,
    digest: null,
    remark: null,
    files: [],
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    swap_id: [{ required: true, message: '请选择调班对象', trigger: 'change' }],
    checkin_date: [
      { type: 'number', required: true, message: '请选择调班日期', trigger: 'change' },
    ],
    checkin_back: [
      { type: 'number', required: true, message: '请选择还班日期', trigger: 'change' },
    ],
    digest: [{ required: true, message: '请输入调班原因', trigger: 'change' }],
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
  title: '调班申请',
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types'],
    number: ['date', 'start', 'expire'],
    custom: {
      date: val => toDateLabel(val),
      start: val => toDateLabel(val),
      expire: val => toDateLabel(val),
    },
    enum: {
      types: 'checkin_outside_types',
    },
  }),
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
})

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrApplyShiftDetail' }
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
        <n-form-item-gi :span="8" label="调班对象" path="swap_id">
          <MemberPicker
            v-model:value="formModel.swap_id"
            v-model:options="formModel.swap_name"
            :stoped="false"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="调班日期" path="checkin_date">
          <n-date-picker v-model:value="formModel.checkin_date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="还班日期" path="checkin_back">
          <n-date-picker v-model:value="formModel.checkin_back" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="调班原因" path="digest">
          <n-input v-model:value="formModel.digest" clearable />
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
        {{ enumStore.getLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="8" label="调班对象">
              <n-input v-model:value="formModel.swap_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="调班日期">
              <n-input :value="formModel.transform?.checkin_date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="还班日期">
              <n-input :value="formModel.transform?.checkin_back" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="调班原因">
              <n-input v-model:value="formModel.digest" placeholder="" readonly />
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
          types="hr/attendance-apply/shift"
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
          biz-class="Checkin"
          :is-approve="isApprove"
          :detail-mode="detailMode"
          @done="finishApproval"
        />
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
