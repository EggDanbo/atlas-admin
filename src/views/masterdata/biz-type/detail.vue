<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { useDetail } from '@/hooks/detail'
import { bizType as api } from '@/service/api/masterdata'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    code: null,
    name: null,
    model: null,
    unit: null,
    rate: null,
    add: null,
    quota: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  code: [{ required: true, message: '请输入业务编码', trigger: 'change' }],
  name: [{ required: true, message: '请输入业务名称', trigger: 'change' }],
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
  title: '业务类型',
  permission: { useTabPermission: true, permName: 'MDM_BIZ_TYPE' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_product' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'MdmBizTypeDetail' }
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
        <n-form-item-gi :span="8" label="业务编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="业务名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="计量单位" path="unit">
          <n-input v-model:value="formModel.unit" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="规格型号" path="model">
          <n-input v-model:value="formModel.model" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="税率" path="rate">
          <n-input-number
            v-model:value="formModel.rate"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="附加税费" path="add">
          <n-input-number
            v-model:value="formModel.add"
            :precision="4"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="发票限额" path="quota">
          <n-input-number
            v-model:value="formModel.quota"
            :precision="2"
            :show-button="false"
            clearable
          />
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
        <n-form-item-gi :span="8" label="业务编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="业务名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="计量单位">
          <n-input v-model:value="formModel.unit" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="规格型号">
          <n-input v-model:value="formModel.model" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="税率">
          <n-input-number v-model:value="formModel.rate" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="附加税费">
          <n-input-number v-model:value="formModel.add" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="发票限额">
          <n-input-number v-model:value="formModel.quota" placeholder="" :readonly="true" :show-button="false" />
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
          types="masterdata/biz-type"
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
