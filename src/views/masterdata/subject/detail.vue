<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { subject as api } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

const requiretOptions = ref<any>([])

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    code: null,
    name: null,
    direction: null,
    types: null,
    cashes: false,
    period: false,
    cashflow_in: null,
    cashflow_out: null,
    assist: [] as string[] | null,
    require: [] as string[] | null,
    remark: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  code: [{ required: true, message: '请输入科目代码', trigger: 'change' }],
  name: [{ required: true, message: '请输入科目名称', trigger: 'change' }],
  direction: [{ required: true, message: '请选择借贷方向', trigger: 'change' }],
  types: [{ required: true, message: '请选择科目分类', trigger: 'change' }],
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
  title: '会计科目',
  permission: { useTabPermission: true, permName: 'MDM_SUBJECT' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['criterion', 'direction', 'types'],
    enum: {
      direction: 'basic_content_direction',
      types: 'basic_content_types',
    },
    custom: {
      cashes: val => val ? '是' : '否',
      period: val => val ? '是' : '否',
      assist: val => val.length > 0 ? val.toString() : null,
      require: val => val.length > 0 ? val.toString() : null,
    },
  }),
  async beforeEdit(data, options) {
    if (data.assist && data.assist.length > 0) {
      const arr = data.assist.filter(q => q)
      formModel.assist = arr.length > 0 ? arr : null
    }
    if (data.require && data.require.length > 0) {
      const arr = data.require.filter(q => q)
      formModel.require = arr.length > 0 ? arr : null
    }

    await handleAssist()

    return true
  },
})

async function handleAssist() {
  if (formModel.assist && formModel.assist.length > 0) {
    const list = enumStore.getEnumOptions('basic_content_assist', 'label').filter((q: any) => formModel.assist?.includes(q.value))
    requiretOptions.value = list
    const arr: any = formModel.require?.filter((item: any) => formModel.assist?.includes(item))
    formModel.require = arr
  }
  else {
    formModel.require = null
    requiretOptions.value = []
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_content' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'MdmSubjectDetail' }
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
        <n-form-item-gi :span="8" label="科目编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="科目名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借贷方向" path="direction">
          <n-select
            v-model:value="formModel.direction"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_content_direction')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="10" label="科目分类" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_content_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="现金等价物" path="cashes">
          <n-switch v-model:value="formModel.cashes">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="核算维度" path="assist">
          <n-select
            v-model:value="formModel.assist"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('basic_content_assist', 'label')"
            max-tag-count="responsive"
            multiple
            clearable
            @update:value="handleAssist"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="18" label="必录维度" path="require">
          <n-select
            v-model:value="formModel.require"
            placeholder="请选择"
            max-tag-count="responsive"
            multiple
            clearable
            :options="requiretOptions"
            :disabled="!formModel.assist || formModel.assist.length === 0"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="按期间核算" path="period">
          <n-switch v-model:value="formModel.period">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="科目说明" path="remark">
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
        <n-form-item-gi :span="8" label="科目编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="科目名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借贷方向">
          <n-input :value="formModel.transform?.direction" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="10" label="科目分类">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="现金等价物">
          <n-input :value="formModel.transform?.cashes" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="核算维度">
          <n-input :value="formModel.transform?.assist" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="18" label="必录维度">
          <n-input :value="formModel.transform?.require" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="按期间核算">
          <n-input :value="formModel.transform?.period" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="科目说明">
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
          types="masterdata/subject"
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
