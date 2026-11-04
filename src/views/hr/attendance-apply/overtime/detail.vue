<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { add } from 'xe-utils'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { TeamPicker } from '@/components/SpTablePicker'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { overtime as api } from '@/service/api/hr/attendance-apply'
import { useUserStore } from '@/store/modules/user'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const userStore = useUserStore()

const tableRef = ref<TableInstance | null>(null)
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
    user_id: null,
    user_name: null,
    date: null,
    types: null,
    start: null,
    expire: null,
    times: null,
    digest: null,
    outer_id: null,
    outer_name: null,
    title: null,
    remark: null,
    list: [],
    files: [],
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    types: [{ required: true, message: '请选择加班计算类型', trigger: 'change' }],
    start: [{ type: 'number', required: true, message: '请选择开始时间', trigger: 'change' }],
    expire: [{ type: 'number', required: true, message: '请选择结束时间', trigger: 'change' }],
    digest: [{ required: true, message: '请输入请假原因', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.list.length; i++) {
    rules[`list[${i}].over_time`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
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
  title: '加班申请',
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types'],
    number: ['date', 'start', 'expire', 'times'],
    custom: {
      date: val => toDateLabel(val),
      start: val => toDateLabel(val),
      expire: val => toDateLabel(val),
    },
  }),
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
})

async function handleDateUpdate() {
  if (formModel.start && formModel.expire) {
    await getDeatil()
  }
}

async function getDeatil() {
  const { isSuccess, data } = await api.getDetail({
    user_id: userStore.userInfo?.userid,
    start: formModel.start,
    end: formModel.expire,
  })
  if (!isSuccess)
    return

  formModel.list = data.list
  handleOvertimeUpdate()
}

function handleOvertimeUpdate() {
  let totals = 0
  for (const i in formModel.list) {
    const item = formModel.list[i]
    totals = add(item.over_time, totals)
  }
  formModel.times = Number(totals)
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrApplyOvertimeDetail' }
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
        <n-form-item-gi :span="24" label="加班原因" path="digest">
          <n-input v-model:value="formModel.digest" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开始日期" path="start">
          <n-date-picker
            v-model:value="formModel.start"
            type="datetime"
            fast-month-select
            clearable
            @update:value="handleDateUpdate"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期" path="expire">
          <n-date-picker
            v-model:value="formModel.expire"
            type="datetime"
            fast-month-select
            clearable
            :disabled="!formModel.start"
            :default-calendar-start-time="formModel.start"
            @update:value="handleDateUpdate"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="加班时长" path="times">
          <n-input-number v-model:value="formModel.times" placeholder="" readonly :show-button="false">
            <template #suffix>
              小时
            </template>
          </n-input-number>
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="加班计算" path="types">
          <n-select v-model:value="formModel.types" :options="dictOptions('checkin_overtime_types')" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="派驻分队" path="outer_id">
          <TeamPicker
            v-model:value="formModel.outer_id"
            :options="formModel.outer_name"
            types="0"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi>
      </n-grid>

      <div v-if="formModel.list.length > 0" class="mt-4">
        <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list">
          <template #day_default="{ row }">
            {{ row.day }}<span v-if="row.day_type_fmt" class="ml-1 text-gray-400">（{{ row.day_type_fmt }}）</span>
          </template>
          <template #over_time_edit="{ row }">
            <n-input-number
              v-model:value="row.over_time"
              :show-button="false"
              :precision="1"
              clearable
              @update:value="handleOvertimeUpdate"
            >
              <template #suffix>
                小时
              </template>
            </n-input-number>
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
        {{ dictLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="加班原因">
              <n-input v-model:value="formModel.digest" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="开始日期">
              <n-input :value="formModel.transform?.start" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="结束日期">
              <n-input :value="formModel.transform?.expire" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="加班时长">
              <n-input-number v-model:value="formModel.times" placeholder="" readonly :show-button="false">
                <template #suffix>
                  小时
                </template>
              </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="加班计算">
              <n-input :value="dictLabel('checkin_overtime_types', formModel.types)" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="派驻分队">
              <n-input v-model:value="formModel.outer_name" placeholder="" readonly />
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

          <div v-if="formModel.list.length > 0" class="mt-4">
            <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list">
              <template #day_default="{ row }">
                {{ row.day }}<span v-if="row.day_type_fmt" class="ml-1 text-gray-400">（{{ row.day_type_fmt }}）</span>
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
          types="hr/attendance-apply/overtime"
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
