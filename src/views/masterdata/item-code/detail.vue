<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { useDetail } from '@/hooks/detail'
import { itemCode as api, itemCategory as articleApi } from '@/service/api/masterdata'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const articleTreeOptions = ref<any>([])
async function loadArticleTreeOptions() {
  const { isSuccess, data } = await articleApi.tree()
  if (!isSuccess)
    return
  articleTreeOptions.value = data
}

async function load() {
  loadArticleTreeOptions()
}

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    article_id: null,
    article_name: null,
    name: null,
    brand: null,
    model: null,
    unit: null,
    least: null,
    life: null,
    pack: null,
    size: null,
    batch: null,
    remark: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  article_id: [{ required: true, message: '请选择库存分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入物品名称', trigger: 'change' }],
  unit: [{ required: true, message: '请输入最小计量单位', trigger: 'change' }],
  pack: [{ required: true, message: '请输入包装计量单位', trigger: 'change' }],
  size: [{ type: 'number', required: true, message: '请输入包装规格', trigger: 'change' }],
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
  title: '物品编码',
  permission: { useTabPermission: true, permName: 'MDM_ITEM_CODE' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_stock' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicStockDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
      :rules="formModel.stoped ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="库存分类" path="article_id">
          <SpCascader
            v-model:value="formModel.article_id"
            :options="articleTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="物品编码" path="code">
          <n-input v-model:value="formModel.code" placeholder="空时自动编码" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="物品名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="规格型号" path="model">
          <n-input v-model:value="formModel.model" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="品牌" path="brand">
          <n-input v-model:value="formModel.brand" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="包装计量单位" path="pack">
          <n-input v-model:value="formModel.pack" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="包装规格" path="size">
          <n-input-number
            v-model:value="formModel.size"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="采购批量" path="batch">
          <n-input-number
            v-model:value="formModel.batch"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最小计量单位" path="unit">
          <n-input v-model:value="formModel.unit" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最低库存" path="least">
          <n-input-number
            v-model:value="formModel.least"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保质期" path="life">
          <n-input-number
            v-model:value="formModel.life"
            :precision="2"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="详细内容" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
    >
      <div v-if="formModel.stoped" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="库存分类">
          <n-input v-model:value="formModel.article_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="物品编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="物品名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="规格型号">
          <n-input v-model:value="formModel.model" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="品牌">
          <n-input v-model:value="formModel.brand" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="包装计量单位">
          <n-input v-model:value="formModel.pack" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="包装规格">
          <n-input-number v-model:value="formModel.size" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="采购批量">
          <n-input-number v-model:value="formModel.batch" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最小计量单位">
          <n-input v-model:value="formModel.unit" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最低库存">
          <n-input-number v-model:value="formModel.least" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保质期">
          <n-input-number v-model:value="formModel.life" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="详细内容">
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
          types="masterdata/item-code"
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
