<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { resume as api } from '@/service/api/hr'
import { useEnumStore } from '@/store/modules/enums'
import { rules } from '@/utils/rules'

import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

const updateReasonModalRef = ref<ModalInst | null>(null)
const updateReasonValue = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    status: null,
    states: true,
    card: null as string | null,
    name: null,
    birthday: null as string | null,
    age: null as string | null,
    gender: null as string | null,
    mobile: null,
    reason: null as string | null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'change' }],
  card: [{ required: true, message: '请输入身份证号', trigger: 'change' }],
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
  title: '人员简历',
  permission: { useTabPermission: true, permName: 'HR_RESUME' },
  canEdit: form => true,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['status', 'gender'],
    enum: {
      status: 'staff_resume_status',
      gender: 'organ_user_gender',
    },
  }),
})

function handleCardParse() {
  if (formModel.card && formModel.card.length === 18 && rules.isCertificateNumber.test(formModel.card)) {
    const year = formModel.card.slice(6, 10)
    const month = formModel.card.slice(10, 12)
    const day = formModel.card.slice(12, 14)
    formModel.birthday = `${year}-${month}-${day}`

    const today = new Date()
    const birth = new Date(Number(year), Number(month) - 1, Number(day))

    let age = today.getFullYear() - birth.getFullYear()
    if (
      today.getMonth() > birth.getMonth()
      || (today.getMonth() === birth.getMonth() && today.getDate() > birth.getDate())
    ) {
      age += 1
    }
    formModel.age = String(age)

    formModel.transform['gender'] = Number(formModel.card.slice(16, 17)) % 2 ? '男' : '女'
  }
  else {
    formModel.birthday = null
    formModel.age = null
    formModel.gender = null
  }
}

async function handleStates() {
  const { isSuccess } = await api.updateStates({
    id: formModel.id,
    states: !formModel.states,
  })
  // 调用失败则返回
  if (!isSuccess)
    return

  toast.success('操作成功')
  emit('on-action', 'edit')
  modalRef.value?.close()
}

async function handleUpdateReason() {
  updateReasonValue.value = null
  if (formModel.reason) {
    await updateRason(false)
  }
  else {
    updateReasonModalRef.value?.open()
  }
}

async function updateRason(isModal: boolean) {
  if (isModal && !updateReasonValue.value) {
    toast.error('请填写黑名单原因')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api.updateReason({
    id: formModel.id,
    reason: updateReasonValue.value,
  }).finally(() => btnLoading.value = false)

  if (isSuccess) {
    toast.success('操作成功')

    formModel.reason = updateReasonValue.value
    updateReasonModalRef.value?.close()
    emit('on-action', 'edit')
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'staff_resume' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffResumeDetail' }
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
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="姓名" path="name">
          <n-input v-model:value="formModel.name" maxlength="25" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号" path="mobile">
          <n-input v-model:value="formModel.mobile" maxlength="11" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="身份证号" path="card">
          <n-input
            v-model:value="formModel.card"
            maxlength="18"
            clearable
            @update:value="handleCardParse"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="性别">
          <n-input :value="formModel.transform?.gender" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="年龄">
          <n-input v-model:value="formModel.age" placeholder="年龄" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="黑名单原因" path="reason">
          <n-input v-model:value="formModel.reason" type="textarea" :rows="3" placeholder="" readonly />
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
        {{ enumStore.getLabel('staff_resume_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="性别">
          <n-input :value="formModel.transform?.gender" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="年龄">
          <n-input v-model:value="formModel.age" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="黑名单原因">
          <n-input
            v-model:value="formModel.reason"
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
          types="hr/resume"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />

        <n-button v-if="formModel.id !== '0'" type="error" :loading="btnLoading" @click="handleUpdateReason">
          {{ formModel.reason ? '取消黑名单' : '设为黑名单' }}
        </n-button>
        <n-button v-if="formModel.id !== '0'" type="warning" :loading="btnLoading" @click="handleStates">
          {{ formModel.states ? '申请解锁' : '锁定' }}
        </n-button>
        <n-button v-if="showEdit() && formModel.status !== '2'" type="primary" @click="edit(formModel.id)">
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

  <SpModal ref="updateReasonModalRef" width="600" title="黑名单原因">
    <div class="w-full flex">
      <n-input
        v-model:value="updateReasonValue"
        type="textarea"
        :rows="3"
        placeholder=""
      />
    </div>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="updateReasonModalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          :loading="btnLoading"
          @click="updateRason(true)"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
