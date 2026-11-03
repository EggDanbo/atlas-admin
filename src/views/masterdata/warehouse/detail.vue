<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { MemberPicker } from '@/components/SpTablePicker'
import { createTransformer, useDetail } from '@/hooks/detail'
import { unit as teamApi } from '@/service/api/access'
import { warehouse as api } from '@/service/api/masterdata'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const teamTreeOptions = ref<any>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree()
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    stoped: false,
    team_id: null,
    team_name: null,
    code: null,
    name: null,
    address: null,
    user_list: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  team_id: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  code: [{ required: true, message: '请输入货仓编码', trigger: 'change' }],
  name: [{ required: true, message: '请输入货仓名称', trigger: 'change' }],
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
  title: '货仓信息',
  permission: { useTabPermission: true, permName: 'MDM_WAREHOUSE' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    custom: {
      user_name: (val) => {
        const arr = val.map(q => q.label)
        return arr.length > 0 ? arr.toString() : null
      },
    },
  }),
  async beforeEdit() {
    await load()
    if (formModel.user_name && formModel.user_name.length > 0) {
      formModel.user_list = formModel.user_name.map(q => q.value)
    }
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'basic_store' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BasicStoreDetail' }
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
        <n-form-item-gi :span="8" label="货仓编码" path="code">
          <n-input v-model:value="formModel.code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="货仓名称" path="name">
          <n-input v-model:value="formModel.name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="货仓地址" path="address">
          <n-input v-model:value="formModel.address" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="管理单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="管理人" path="user_list">
          <MemberPicker
            v-model:value="formModel.user_list"
            v-model:options="formModel.user_name"
            :team_id="formModel.team_id"
            :disabled="!formModel.team_id"
            placeholder="请选择"
            multiple
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
        <n-form-item-gi :span="8" label="货仓编码">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="货仓名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="货仓地址">
          <n-input v-model:value="formModel.address" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="管理单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="管理人">
          <n-input :value="formModel.transform?.user_name" placeholder="" readonly="true" />
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
          types="masterdata/warehouse"
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
