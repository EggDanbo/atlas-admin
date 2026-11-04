<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { makeup as api } from '@/service/api/hr/attendance-apply'
import { useEnumStore } from '@/store/modules/enums'
import { viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()

const viewTableRef = ref<TableInstance | null>(null)

const logBizRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    opt_submit: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
    predict: null,
    status: null,
    remark: null,
    progress: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any }

const {
  isEdit,
  formModel,
  modalRef,
  exposed,
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
  title: '补卡申请',
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    number: ['date', 'checkin_date', 'checkin_time'],
    custom: {
      date: val => toDateLabel(val),
      checkin_date: val => toDateLabel(val),
      checkin_time: val => val ? format(Number(val), 'hh:mm') : null,
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
export default { name: 'HrApplyMakeupDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
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
            <n-form-item-gi :span="8" label="申请日期">
              <n-input v-model:value="formModel.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="派驻单位">
              <n-input v-model:value="formModel.outer_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="规则名称">
              <n-input v-model:value="formModel.group_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="规则类型">
              <n-input v-model:value="formModel.group_type" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="补卡日期">
              <n-input v-model:value="formModel.checkin_date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="补卡时间">
              <n-input v-model:value="formModel.checkin_time" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="异常">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="补卡原因">
              <n-input v-model:value="formModel.digest" placeholder="" readonly />
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
            <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list" />
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
          types="hr/attendance-apply/makeup"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
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
