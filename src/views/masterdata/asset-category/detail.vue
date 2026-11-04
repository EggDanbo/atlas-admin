<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, useDetail } from '@/hooks/detail'
import { assetCategory as api } from '@/service/api/masterdata'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    code: null,
    name: null,
    fore: null,
    types: null,
    unit: null,
    life: null,
    methods: null,
    durable: null,
    realize: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  types: [{ required: true, message: '请选择分类属性', trigger: 'change' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'change' }],
  name: [{ required: true, message: '请输入分类名称', trigger: 'change' }],
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
  title: '资产分类',
  permission: { useTabPermission: true, permName: 'MDM_ASSET_CATEGORY' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types', 'methods'],
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_asset' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'MdmAssetCategoryDetail' }
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
        <n-form-item-gi :span="12" label="分类属性" path="types">
          <n-select
            v-model:value="formModel.types"
            placeholder="请选择"
            :options="dictOptions('basic_asset_types')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="分类名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="计量单位" path="unit">
          <n-input v-model:value="formModel.unit" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="编码前缀" path="fore">
          <n-input v-model:value="formModel.fore" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="使用年限" path="life">
          <n-input-number
            v-model:value="formModel.life"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧方法" path="methods">
          <n-select
            v-model:value="formModel.methods"
            placeholder="请选择"
            :options="dictOptions('basic_asset_method')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧月数" path="durable">
          <n-input-number
            v-model:value="formModel.durable"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="残值率" path="realize">
          <n-input-number
            v-model:value="formModel.realize"
            :precision="2"
            :show-button="false"
            clearable
          >
            <template #suffix>
              %
            </template>
          </n-input-number>
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
        <n-form-item-gi :span="12" label="分类属性">
          <n-input :value="dictLabel('basic_asset_types', formModel.types)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="分类名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="计量单位">
          <n-input v-model:value="formModel.unit" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="编码前缀">
          <n-input v-model:value="formModel.fore" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="使用年限">
          <n-input-number v-model:value="formModel.life" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧方法">
          <n-input :value="dictLabel('basic_asset_method', formModel.methods)" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧月数">
          <n-input-number v-model:value="formModel.durable" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="残值率">
          <n-input-number v-model:value="formModel.residue" placeholder="" :readonly="true" :show-button="false">
            <template #suffix>
              %
            </template>
          </n-input-number>
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
          types="masterdata/asset-category"
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
