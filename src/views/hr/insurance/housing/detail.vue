<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { createTransformer, useDetail } from '@/hooks/detail'
import { housing as api } from '@/service/api/hr/insurance'
import { useEnumStore } from '@/store/modules/enums'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

function createFormModel() {
  return {
    id: '0',
    team_name: null,
    code: null,
    mobile: null,
    name: null,
    card: null,
    types: null,
    position: null,
    add_date: null,
    house_buy: null,
    house_date: null,
    house_code: null,
    house_base: null,
    files: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  house_buy: [{ required: true, message: '请选择是否购买', trigger: 'change' }],
}

const editRules = ref<any>(formRules)
function handleRules() {
  editRules.value = formRules
  if (formModel.house_buy && formModel.house_buy === '2') {
    editRules.value = {
      ...formRules,
      house_code: [{ required: true, message: '请输入公积金号', trigger: 'change' }],
      house_date: [{ type: 'number', required: true, message: '请选择购买日期', trigger: 'change' }],
      house_base: [{ type: 'number', required: true, message: '请输入基数', trigger: 'change' }],
    }
  }
  else {
    formModel.house_code = null
    formModel.house_date = null
    formModel.house_base = null
  }
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
  title: '公积金',
  permission: { useTabPermission: true, permName: 'HR_INSURANCE_HOUSING' },
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['house_buy'],
    number: ['add_date', 'house_date'],
    custom: {
      add_date: val => val ? format(Number(val), 'yyyy-MM') : null,
      house_date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      house_buy: 'staff_info_house',
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'staff_info' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrInsuranceHousingDetail' }
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
      :rules="editRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="是否购买" path="house_buy">
          <n-select
            v-model:value="formModel.house_buy"
            :options="enumStore.getEnumOptions('staff_info_house')"
            clearable
            @update:value="handleRules"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="购买日期" path="house_date">
          <n-date-picker v-model:value="formModel.house_date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="公积金号" path="house_code">
          <n-input v-model:value="formModel.house_code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="公积金基数" path="house_base">
          <n-tooltip trigger="focus">
            如果与默认缴费基数不同则填写当前人员缴费基数
            <template #trigger>
              <n-input-number
                v-model:value="formModel.house_base"
                :show-button="false"
                clearable
              />
            </template>
          </n-tooltip>
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
        {{ enumStore.getLabel('staff_info_house', formModel.house_buy) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="单位名称">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="工号">
          <n-input v-model:value="formModel.code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="姓名">
          <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="手机号码">
          <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="身份证号">
          <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="入职日期">
          <n-input :value="formModel.transform?.add_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="是否购买">
          <n-input :value="formModel.transform?.house_buy" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="购买日期">
          <n-input :value="formModel.transform?.house_date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="公积金号">
          <n-input v-model:value="formModel.house_code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="公积金基数">
          <n-input-number v-model:value="formModel.house_base" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="formModel.files && formModel.files.length > 0"
          :span="24"
          label="附件"
        >
          <Upload
            v-model:value="formModel.files"
            :only-image="false"
            upload-title="上传附件"
            :disabled="true"
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
          types="hr/insurance/housing"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
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
