<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { addYears, format, subDays } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { OuterSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { insure as api } from '@/service/api/staff/protect'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    outer_id: null,
    outer_name: null,
    no: null,
    pcs: null,
    amount: null,
    date: Date.now(),
    start: null as number | null,
    expire: null as number | null,
    name: null,
    mobile: null,
    remark: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  outer_id: [{ required: true, message: '请选择保险公司', trigger: 'change' }],
  no: [{ required: true, message: '请输入保单号', trigger: 'change' }],
  pcs: [{ type: 'number', required: true, message: '请输入保单人数', trigger: 'change' }],
  amount: [{ type: 'number', required: true, message: '请输入保障金额', trigger: 'change' }],
  date: [{ type: 'number', required: true, message: '请选择登记日期', trigger: 'change' }],
  start: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
  expire: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
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
  title: '商业保险',
  permission: { useTabPermission: true, permName: 'DEMO_STAFF_PROTECT_INSURE' },
  canEdit: form => true,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    number: ['pcs', 'date', 'start', 'expire'],
    nullIfZero: ['outer_id'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      start: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
  }),
  beforeEdit: async () => {
    return true
  },
})

function handleCountExpire() {
  if (formModel.start) {
    formModel.expire = subDays(addYears(formModel.start, 1), 1).getTime()
  }
  else {
    formModel.expire = null
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffProtectInsureDetail' }
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
        <n-form-item-gi :span="12" label="登记日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保单号" path="no">
          <n-input v-model:value="formModel.no" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保单人数" path="pcs">
          <n-input-number
            v-model:value="formModel.pcs"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保障金额" path="amount">
          <n-input-number
            v-model:value="formModel.amount"
            :precision="0"
            :show-button="false"
            clearable
          >
            <template #suffix>
              万元
            </template>
          </n-input-number>
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="签订日期" path="start">
          <n-date-picker v-model:value="formModel.start" type="date" fast-month-select clearable @update:value="handleCountExpire" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="到期日期" path="expire">
          <n-date-picker v-model:value="formModel.expire" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="保险公司" path="outer_id">
          <OuterSelect
            v-model:value="formModel.outer_id"
            :options="formModel.outer_name"
            types="1"
            :multiple="false"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="联系人" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号" path="mobile">
          <n-input v-model:value="formModel.mobile" clearable />
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
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="登记日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保单号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保单人数">
          <n-input-number v-model:value="formModel.pcs" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="保障金额">
          <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false">
            <template #suffix>
              万元
            </template>
          </n-input-number>
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="签订日期">
          <n-input :value="formModel.transform?.start" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="到期日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="客户">
          <n-input v-model:value="formModel.outer_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="联系人">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
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
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="staff/protect/insure"
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
