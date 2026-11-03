<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { payrollItem as api } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

function createFormModel() {
  return {
    id: '0',
    field_name: null,
    field_type: null,
    title: null,
    head: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'change' }],
  field_name: [{ required: true, message: '请输入字段名称', trigger: 'change' }],
  field_type: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
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
  title: '工资项目',
  permission: { useTabPermission: true, permName: 'MDM_PAYROLL_ITEM' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['field_type'],
    enum: {
      field_type: 'basic_salary_types',
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_salary' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'MdmPayrollItemDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
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
        <n-form-item-gi v-if="Number(formModel.id) === 0" :span="12" label="字段名称" path="field_name">
          <n-input v-model:value="formModel.field_name" clearable />
        </n-form-item-gi>
        <n-form-item-gi v-if="Number(formModel.id) === 0" :span="12" label="字段类型" path="field_type">
          <n-select
            v-model:value="formModel.field_type"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_salary_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题组" path="head">
          <n-input v-model:value="formModel.head" clearable />
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
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <!-- <n-form-item-gi :span="12" label="字段名称">
          <n-input v-model:value="formModel.field_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="字段类型">
          <n-input :value="formModel.transform?.field_type" placeholder="" readonly="true" />
        </n-form-item-gi> -->
        <n-form-item-gi :span="24" label="标题">
          <n-input v-model:value="formModel.title" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题组">
          <n-input v-model:value="formModel.head" placeholder="" readonly="true" />
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
          types="masterdata/payroll-item"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || formModel.stoped"
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
