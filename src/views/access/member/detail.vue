<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { member as api, unit as teamApi } from '@/service/api/access'
import { validMobileNumber } from '@/utils/rules'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    fiction: true,
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
    user_id: '0',
    stoped: '0',
    team_id: null,
    team_name: '',
    mobile_number: '',
    name: '',
    types: null,
    wkno: null,
    id_no: null,
    gender: null,
    position: null,
    user_pic: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  name: [{ required: true, message: '请填写姓名', trigger: 'change' }],
  types: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
  team_id: [{ required: true, message: '请选择单位', trigger: 'change' }],
  mobile_number: [{ required: true, validator: validMobileNumber, trigger: 'change' }],
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
  idField: 'user_id',
  permission: { useTabPermission: true },
  canEdit: form => form.stoped === '0',
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['gender'],
    string: ['gender', 'types'],
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.user_id, name: 'organ_user' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AccessMemberDetail' }
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
      :rules="formModel.stoped !== '0' ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped !== '0'"
    >
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="17">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="24" label="所属单位" path="team_id">
              <SpCascader
                v-model:value="formModel.team_id"
                :options="teamTreeOptions"
                placeholder="请选择"
                value-field="id"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="手机号码" path="mobile_number">
              <n-input
                v-model:value="formModel.mobile_number"
                :disabled="!hasPerm || formModel.stoped !== '0'"
                maxlength="11"
                clearable
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="姓名" path="name">
              <n-input v-model:value="formModel.name" maxlength="50" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="人员类型" path="types">
              <n-select
                v-model:value="formModel.types"
                placeholder="请选择"
                :options="dictOptions('organ_user_types')"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="工号" path="wkno">
              <n-input v-model:value="formModel.wkno" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="身份证号" path="id_no">
              <n-input v-model:value="formModel.id_no" maxlength="18" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="性别" path="gender">
              <n-select
                v-model:value="formModel.gender"
                placeholder="请选择"
                :options="dictOptions('organ_user_gender')"
                clearable
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="岗位" path="position">
              <n-input v-model:value="formModel.position" maxlength="50" clearable />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="7">
          <Upload
            v-model:value="formModel.user_pic"
            :max-number="1"
            :only-image="true"
            upload-title="人员照片"
            :disabled="!hasPerm || formModel.stoped !== '0'"
            :width="220"
            :height="230"
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
      <div v-if="formModel.stoped !== '0'" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="17">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="24" label="所属单位">
              <n-input :value="formModel.team_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="手机号码">
              <n-input :value="formModel.mobile_number" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="姓名">
              <n-input :value="formModel.name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="人员类型">
              <n-input :value="dictLabel('organ_user_types', formModel.types)" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="工号">
              <n-input :value="formModel.wkno" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="身份证号">
              <n-input :value="formModel.id_no" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="性别">
              <n-input :value="dictLabel('organ_user_gender', formModel.gender)" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="岗位">
              <n-input :value="formModel.position" placeholder="" readonly="true" />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="7">
          <Upload
            v-model:value="formModel.user_pic"
            :max-number="1"
            :only-image="true"
            upload-title="人员照片"
            :disabled="true"
            :width="220"
            :height="230"
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
          types="access/member"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.user_id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || formModel.stoped !== '0'"
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
