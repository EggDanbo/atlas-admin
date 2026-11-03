<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { cashflowItem as api } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    code: null,
    name: null,
    title: null,
    direction: null,
    content_debit: null,
    content_credit: null,
    remark: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  code: [{ required: true, message: '请输入项目编码', trigger: 'change' }],
  name: [{ required: true, message: '请输入项目名称', trigger: 'change' }],
  title: [{ required: true, message: '请选择现金流分组', trigger: 'change' }],
  direction: [{ required: true, message: '请选择现金流方向', trigger: 'change' }],
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
  title: '现金流项目',
  permission: { useTabPermission: true, permName: 'MDM_CASHFLOW_ITEM' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['direction', 'types'],
    enum: {
      direction: 'basic_cashflow_direction',
      types: 'basic_cashflow_types',
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_cashflow' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicCashflowDetail' }
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
        <n-form-item-gi :span="16" label="现金流分组" path="title">
          <n-select
            v-model:value="formModel.title"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_cashflow_group', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="项目编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="项目名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="现金流方向" path="direction">
          <n-select
            v-model:value="formModel.direction"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_cashflow_direction')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="对应借方科目" path="content_debit">
          <n-input v-model:value="formModel.content_debit" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="对应贷方科目" path="content_credit">
          <n-input v-model:value="formModel.content_credit" clearable />
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
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="现金流分组">
          <n-input v-model:value="formModel.title" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="项目编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="项目名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="现金流方向">
          <n-input :value="formModel.transform?.direction" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="对应借方科目">
          <n-input v-model:value="formModel.content_debit" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="对应贷方科目">
          <n-input v-model:value="formModel.content_credit" placeholder="" readonly="true" />
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
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="masterdata/cashflow-item"
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
