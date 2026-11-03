<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { leaveRule as api } from '@/service/api/hr/attendance'
import { holiday as holidayApi } from '@/service/api/masterdata'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const vacationOptions = ref<any>([])
async function loadVacationOptions() {
  const { isSuccess, data } = await holidayApi.list()
  if (!isSuccess)
    return
  vacationOptions.value = data
}

async function load() {
  loadVacationOptions()
}

function createFormModel() {
  return {
    id: '0',
    team_name: null,
    code: null,
    mobile: null,
    name: null,
    card: null,
    types: null,
    position: null,
    add_date: null,
    vacation: [] as string[] | null,
    leave_max: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
}

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
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '请假设置',
  permission: { useTabPermission: true, permName: 'HR_ATTENDANCE_LEAVE' },
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    number: ['add_date'],
    custom: {
      add_date: val => val ? format(Number(val), 'yyyy-MM') : null,
      vacation: val => val.length > 0 ? val.toString() : null,
    },
  }),
  async beforeEdit() {
    if (formModel.vacation && formModel.vacation.length > 0) {
      const arr = formModel.vacation.filter(q => q)
      formModel.vacation = arr.length > 0 ? arr : null
    }
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
export default { name: 'StaffCheckinLeaveDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="960" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="假期类型" path="vacation">
          <n-select
            v-model:value="formModel.vacation"
            placeholder="请选择"
            max-tag-count="responsive"
            multiple
            clearable
            :options="vacationOptions"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="事假最大天数" path="leave_max">
          <n-tooltip trigger="focus">
            空或0默认20天
            <template #trigger>
              <n-input-number
                v-model:value="formModel.leave_max"
                :show-button="false"
                :precision="0"
                clearable
              />
            </template>
          </n-tooltip>
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
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="假期类型">
          <n-input :value="formModel.transform?.vacation" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="事假最大天数">
          <n-input-number v-model:value="formModel.leave_max" placeholder="" :precision="0" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="formModel.files && formModel.files.length > 0"
          :span="24"
          label="附件"
        >
          <Upload
            v-model:value="formModel.files"
            :only-image="false"
            upload-title="上传附件"
            :disabled="true"
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
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
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
