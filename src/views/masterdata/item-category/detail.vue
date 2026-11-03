<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { itemCategory as api } from '@/service/api/masterdata'
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
    types: [] as string[] | null,
    unit: null,
    life: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
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
  title: '物品分类',
  permission: { useTabPermission: true, permName: 'MDM_ITEM_CATEGORY' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    custom: {
      types: val => val.length > 0 ? val.toString() : null,
    },
  }),
  async beforeEdit() {
    if (formModel.types && formModel.types.length > 0) {
      const arr = formModel.types.filter(q => q)
      formModel.types = arr.length > 0 ? arr : null
    }
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_article' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicArticleDetail' }
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
        <n-form-item-gi :span="12" label="分类编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类属性" path="types">
          <n-select
            v-model:value="formModel.types"
            :options="enumStore.getEnumOptions('basic_article_types', 'label')"
            max-tag-count="responsive"
            multiple
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="最小计量单位" path="unit">
          <n-input v-model:value="formModel.unit" clearable />
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
        <n-form-item-gi :span="12" label="分类编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="分类属性">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="最小计量单位">
          <n-input v-model:value="formModel.unit" placeholder="" readonly="true" />
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
          types="masterdata/item-category"
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
