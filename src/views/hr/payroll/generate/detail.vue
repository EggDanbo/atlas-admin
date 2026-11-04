<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { generate as api } from '@/service/api/hr/payroll'
import { tenantStorage } from '@/utils/tenant'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const { getPermission } = useTabbar()
const tabPermName = getPermission()

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

async function load() {
  await loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    user_id: null,
    user_name: null,
    start: null as number | null,
    expire: null as number | null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  start: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
  expire: [{ type: 'number', required: true, message: '请选择结束日期', trigger: 'change' }],
}

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  submit,
  edit,
  clearTabState,
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '工资考勤',
  permission: { useTabPermission: true, permName: 'HR_PAYROLL_GENERATE' },
  canEdit: form => form.current === 1,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['status'],
    number: ['user_add', 'start', 'expire'],
    custom: {
      user_add: val => val ? format(Number(val), 'yyyy-MM') : null,
      start: val => toDateLabel(val),
      expire: val => toDateLabel(val),
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrPayrollGenerateDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="140"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="单位部门">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="人员姓名">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="所在分队">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="职务">
          <n-input v-model:value="formModel.user_rank" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="入职日期">
          <n-input :value="formModel.transform?.user_add" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="当前工龄">
          <n-input-number v-model:value="formModel.user_year" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.user_post" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        考勤信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="开始日期" path="start">
          <n-date-picker v-model:value="formModel.start" type="date" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期" path="expire">
          <n-date-picker v-model:value="formModel.expire" type="date" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="应上班天数" path="work_day">
          <n-input-number v-model:value="formModel.work_day" :show-button="false" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="休息日天数" path="rest_day">
          <n-input-number v-model:value="formModel.rest_day" :show-button="false" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="实际上班天数" path="fact_day">
          <n-input-number
            v-model:value="formModel.fact_day"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="事假天数" path="case_day">
          <n-input-number
            v-model:value="formModel.case_day"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="病假天数" path="sick_day">
          <n-input-number
            v-model:value="formModel.sick_day"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="休假天数" path="fest_day">
          <n-input-number
            v-model:value="formModel.fest_day"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="缺勤天数" path="lack_day">
          <n-input-number
            v-model:value="formModel.lack_day"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="工作日加班时数" path="work_time">
          <n-input-number
            v-model:value="formModel.work_time"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="休息日加班时数" path="rest_time">
          <n-input-number
            v-model:value="formModel.rest_time"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="节假日加班时数" path="fest_time">
          <n-input-number
            v-model:value="formModel.fest_time"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="年假加班时数" path="self_time">
          <n-input-number
            v-model:value="formModel.self_time"
            :precision="1"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="绩效等级" path="caste">
          <n-select
            v-model:value="formModel.caste"
            placeholder="请选择"
            :options="dictOptions('staff_scale_caste', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
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
        {{ dictLabel('staff_salary_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="单位部门">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="人员姓名">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="所在分队">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="职务">
          <n-input v-model:value="formModel.user_rank" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="入职日期">
          <n-input :value="formModel.transform?.user_add" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="当前工龄">
          <n-input-number v-model:value="formModel.user_year" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.user_post" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        考勤信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="6" label="开始日期">
          <n-input :value="formModel.transform?.start" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="结束日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="绩效等级">
          <n-input v-model:value="formModel.caste" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="天数">
          <n-input-number v-model:value="formModel.days" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="应上班天数">
          <n-input-number v-model:value="formModel.work_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休息日天数">
          <n-input-number v-model:value="formModel.rest_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="实际上班天数">
          <n-input-number v-model:value="formModel.fact_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="事假天数">
          <n-input-number v-model:value="formModel.case_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="病假天数">
          <n-input-number v-model:value="formModel.sick_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休假天数">
          <n-input-number v-model:value="formModel.fest_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="缺勤天数">
          <n-input-number v-model:value="formModel.lack_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="工作日加班">
          <n-input-number v-model:value="formModel.work_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休息日加班">
          <n-input-number v-model:value="formModel.rest_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="节假日加班">
          <n-input-number v-model:value="formModel.fest_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="年休假加班">
          <n-input-number v-model:value="formModel.self_time" placeholder="" :readonly="true" :show-button="false" />
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
      </n-grid>
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
          types="hr/payroll/generate"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="!isEdit && formModel.opt_confirm" type="primary" @click="edit(formModel.id)">
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
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
