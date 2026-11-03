<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { carryover as api } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    name: null,
    types: null,
    source: null,
    content_out: null,
    content_in: null,
    remark: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  name: [{ required: true, message: '请输入结转名称', trigger: 'change' }],
  types: [{ required: true, message: '请选择结转类型', trigger: 'change' }],
  source: [{ required: true, message: '请选择数据来源', trigger: 'change' }],
  content_out: [{ required: true, message: '请输入转出科目', trigger: 'change' }],
  content_in: [{ required: true, message: '请输入转入科目', trigger: 'change' }],
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
  title: '结转模板',
  permission: { useTabPermission: true, permName: 'MDM_CARRYOVER' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['source', 'types'],
    enum: {
      source: 'basic_pattern_source',
      types: 'basic_pattern_types',
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_pattern' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'MdmCarryoverDetail' }
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
        <n-form-item-gi :span="24" label="结转名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="50" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="数据来源" path="source">
          <n-select
            v-model:value="formModel.source"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_pattern_source')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结转类型" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_pattern_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="转出科目" path="content_out">
          <n-input v-model:value="formModel.content_out" maxlength="255" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="转入科目" path="content_in">
          <n-input v-model:value="formModel.content_in" maxlength="30" clearable />
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
        <n-form-item-gi :span="24" label=" 结转名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label=" 数据来源">
          <n-input :value="formModel.transform?.source" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结转类型">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="转出科目">
          <n-input v-model:value="formModel.content_out" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="转入科目">
          <n-input v-model:value="formModel.content_in" placeholder="" readonly="true" />
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
          types="masterdata/carryover"
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
