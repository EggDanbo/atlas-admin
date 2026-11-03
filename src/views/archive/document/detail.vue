<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { document as api } from '@/service/api/archive'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    opt_submit: true,
    status: null as number | null,
    team_name: null,
    team_id: null,
    date: null,
    no: null,
    name: null,
    types: null,
    content: null,
    location: null,
    remark: null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  team_id: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  name: [{ required: true, message: '请填写档案名称', trigger: 'change' }],
  types: [{ required: true, message: '请选档案类型', trigger: 'change' }],
  date: [{ type: 'number', required: true, message: '请选择登记日期', trigger: 'change' }],
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
  title: '档案信息',
  permission: { useTabPermission: true, permName: 'DOC_DOCUMENT' },
  canEdit: form => form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

async function updateStatus() {
  btnLoading.value = true
  const { isSuccess } = await api.updateStatus({
    id: formModel.id,
    status: formModel.status === 0,
  }).finally(() => btnLoading.value = false)
  if (isSuccess) {
    toast.success('操作成功')

    emit('on-action', 'EDIT')
    modalRef.value.close()
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'paper_info' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'PaperInfoDetail' }
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
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="24" label="所属单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="登记日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" placeholder="请选择" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案编号" path="no">
          <n-input v-model:value="formModel.no" maxlength="30" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案名称" path="name">
          <n-input v-model:value="formModel.name" maxlength="30" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案类型" path="types">
          <SpDict v-model:value="formModel.types" name="档案类别" placeholder="请选择" filterable tag clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="档案内容" path="content">
          <n-input v-model:value="formModel.content" maxlength="50" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="档案位置" path="location">
          <n-input v-model:value="formModel.location" maxlength="50" clearable />
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
      <div class="stamp-text">
        {{ enumStore.getLabel('paper_info_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="24" label="所属单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="登记日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案编号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="档案类型">
          <n-input v-model:value="formModel.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="档案内容">
          <n-input v-model:value="formModel.content" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="档案位置">
          <n-input v-model:value="formModel.location" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" readonly />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="formModel.files && formModel.files.length > 0"
          :span="24"
          label="附件"
        >
          <Upload v-model:value="formModel.files" :disabled="true" />
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
        <n-button v-if="formModel.id !== '0'" :loading="btnLoading" @click="updateStatus">
          {{ formModel.status === 0 ? '归档' : '取消归档' }}
        </n-button>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="archive/document"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit() && formModel.opt_submit" type="primary" @click="edit(formModel.id)">
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
