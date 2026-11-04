<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { social as api } from '@/service/api/hr/insurance'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

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
    census: null,
    social_type: null,
    social_date: null,
    social_code: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  social_type: [{ required: true, message: '请选择参保类型', trigger: 'change' }],
}

const editRules = ref<any>(formRules)
function handleRules() {
  editRules.value = formRules
  if (formModel.social_type && !(formModel.social_type === '0' || formModel.social_type === '10')) {
    editRules.value = {
      ...formRules,
      social_code: [{ required: true, message: '请输入社保号', trigger: 'change' }],
      social_date: [{ type: 'number', required: true, message: '请选择参保日期', trigger: 'change' }],
    }
  }
  else {
    formModel.social_code = null
    formModel.social_date = null
  }
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
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '社会保险',
  permission: { useTabPermission: true, permName: 'HR_INSURANCE_SOCIAL' },
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types', 'status', 'social_type'],
    number: ['add_date', 'social_date'],
    custom: {
      add_date: val => val ? format(Number(val), 'yyyy-MM') : null,
      social_date: val => toDateLabel(val),
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'staff_info' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrInsuranceSocialDetail' }
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
      :rules="editRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分队名称">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="人员类型">
          <n-input :value="dictLabel('staff_info_types', formModel.types)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="状态">
          <n-input :value="dictLabel('staff_info_status', formModel.status)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="文化程度">
          <n-input v-model:value="formModel.extent" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="职务">
          <n-input v-model:value="formModel.ranks" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="上岗证号">
          <n-input v-model:value="formModel.license" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="离职日期">
          <n-input :value="formModel.transform?.end_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="户籍类型">
          <n-input v-model:value="formModel.census" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="籍贯">
          <n-input v-model:value="formModel.native" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="户口地址">
          <n-input v-model:value="formModel.location" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="参保类型" path="social_type">
          <n-select
            v-model:value="formModel.social_type"
            :options="dictOptions('staff_info_social')"
            clearable
            @update:value="handleRules"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="参保日期" path="social_date">
          <n-date-picker v-model:value="formModel.social_date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="社保号" path="social_code">
          <n-input v-model:value="formModel.social_code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="参保说明">
          <n-input v-model:value="formModel.social_text" clearable />
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
        {{ dictLabel('staff_info_social', formModel.social_type) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分队名称">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="人员类型">
          <n-input :value="dictLabel('staff_info_types', formModel.types)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="状态">
          <n-input :value="dictLabel('staff_info_status', formModel.status)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="文化程度">
          <n-input v-model:value="formModel.extent" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="职务">
          <n-input v-model:value="formModel.ranks" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="上岗证号">
          <n-input v-model:value="formModel.license" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="离职日期">
          <n-input :value="formModel.transform?.end_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="户籍类型">
          <n-input v-model:value="formModel.census" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="籍贯">
          <n-input v-model:value="formModel.native" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="户口地址">
          <n-input v-model:value="formModel.location" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="参保日期">
          <n-input :value="formModel.transform?.social_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="社保号">
          <n-input v-model:value="formModel.social_code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="参保说明">
          <n-input v-model:value="formModel.social_text" placeholder="" readonly="true" />
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
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="hr/insurance/social"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
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
