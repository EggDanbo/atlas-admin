<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { addYears, format, subDays } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { UserSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { team as teamApi } from '@/service/api/organ'
import { labor as api } from '@/service/api/staff/daily'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const updateRenewModalRef = ref<ModalInst | null>(null)
const updateRenewInfo = ref({
  start: null as number | null,
  year: null as number | null,
})

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
    current: 1,
    opt_confirm: false,
    opt_cancel: false,
    user_id: null,
    user_name: null,
    date: Date.now(),
    pcs: null,
    year: null,
    start: Date.now(),
    expire: null as number | null,
    remark: null,
    files_ldht: [],
    files_bcxy: [],
    files_zrz: [],
    files_bmxy: [],
    files_ygsc: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  user_id: [{ required: true, message: '请选择人员', trigger: 'change' }],
  date: [{ type: 'number', required: true, message: '请选择登记日期', trigger: 'change' }],
  pcs: [{ type: 'number', required: true, message: '请输入签订次数', trigger: 'change' }],
  start: [{ type: 'number', required: true, message: '请选择签订日期', trigger: 'change' }],
}

const editRules = ref<any>(formRules)
function handleRules() {
  editRules.value = formRules
  if (formModel.year && formModel.year !== 0) {
    editRules.value = {
      ...formRules,
      expire: [{ type: 'number', required: true, message: '请选择到期日期', trigger: 'change' }],
    }
    handleCountExpire()
  }
  else {
    formModel.expire = null
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
  title: '劳动合同',
  permission: { useTabPermission: true, permName: 'DEMO_STAFF_LABOR' },
  canEdit: form => form.current === 1,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['status'],
    nullIfZero: ['user_id'],
    number: ['date', 'start', 'expire'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM') : null,
      start: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      status: 'staff_labor_status',
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

function handleCountExpire() {
  if (formModel.year && formModel.year !== 0) {
    formModel.expire = subDays(addYears(formModel.start, formModel.year), 1).getTime()
  }
  else {
    formModel.expire = null
  }
}

function updateRenewModalShow() {
  if (!formModel.expire)
    return

  const pcs = Number(formModel.pcs)
  if (pcs === 1) {
    updateRenewInfo.value.year = 5
  }
  else if (pcs >= 2) {
    updateRenewInfo.value.year = 0
  }

  updateRenewInfo.value.start = subDays(formModel.expire, -1).getTime()
  updateRenewModalRef.value?.open()
}

async function updateRenew() {
  const expire = Number(updateRenewInfo.value.year) > 0
    ? subDays(addYears(Number(updateRenewInfo.value.start), Number(updateRenewInfo.value.year)), 1).getTime()
    : 0
  btnLoading.value = true
  const { isSuccess } = await api.updateRenew({
    id: formModel.id,
    year: updateRenewInfo.value.year,
    start: updateRenewInfo.value.start,
    expire,
  }).finally(() => btnLoading.value = false)
  if (isSuccess) {
    toast.success('操作成功')
    updateRenewModalRef.value?.close()
    modalRef.value.close()
    emit('on-action', 'edit')
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffDailyLaborDetail' }
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
        <n-form-item-gi :span="8" label="签订人" path="user_id">
          <UserSelect
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            :stoped="false"
            :permission="`${tabPermName}`"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="登记日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="签订日期" path="start">
          <n-date-picker
            v-model:value="formModel.start"
            type="date"
            fast-month-select
            clearable
            @update:value="handleCountExpire"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="签订次数" path="pcs">
          <n-input-number
            v-model:value="formModel.pcs"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同年限" path="year">
          <n-input-number
            v-model:value="formModel.year"
            :precision="0"
            :show-button="false"
            clearable
            placeholder="无年限请输入0或不填"
            @update:value="handleRules"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="到期日期" path="expire">
          <n-date-picker
            v-model:value="formModel.expire"
            type="date"
            fast-month-select
            clearable
            :disabled="formModel.year === 0"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="劳动合同">
          <Upload
            v-model:value="formModel.files_ldht"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="劳动合同补充协议">
          <Upload
            v-model:value="formModel.files_bcxy"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="责任状">
          <Upload
            v-model:value="formModel.files_zrz"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保密协议">
          <Upload
            v-model:value="formModel.files_bmxy"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="员工手册收阅确认书">
          <Upload
            v-model:value="formModel.files_ygsc"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
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
      <div class="stamp-text">
        {{ enumStore.getLabel('staff_labor_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="签订人">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="登记日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="签订日期">
          <n-input :value="formModel.transform?.start" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="签订次数">
          <n-input-number v-model:value="formModel.pcs" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="合同年限">
          <n-input-number v-model:value="formModel.year" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="到期日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="劳动合同">
          <Upload v-model:value="formModel.files_ldht" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="劳动合同补充协议">
          <Upload v-model:value="formModel.files_bcxy" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="责任状">
          <Upload v-model:value="formModel.files_zrz" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保密协议">
          <Upload v-model:value="formModel.files_bmxy" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="员工手册收阅确认书">
          <Upload v-model:value="formModel.files_ygsc" :only-image="false" :disabled="true" />
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
          types="staff/daily/labor"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit() && formModel.opt_confirm" type="primary" @click="edit(formModel.id)">
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
        <n-button
          v-if="formModel.opt_handle && !isEdit"
          type="primary"
          @click="updateRenewModalShow"
        >
          续签
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="updateRenewModalRef"
    title="合同续签"
    width="450"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="pt-4">
        <n-form
          label-placement="left"
          require-mark-placement="left"
          :label-width="80"
        >
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="16" label="签订日期">
              <n-date-picker v-model:value="updateRenewInfo.start" type="date" />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="续签年份">
              <div class="w-full flex flex-col gap-[10px]">
                <n-input-number v-model:value="updateRenewInfo.year" :show-button="false">
                  <template #suffix>
                    年
                  </template>
                </n-input-number>
                <n-alert type="info" :show-icon="false">
                  无限期请输入0
                </n-alert>
              </div>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateRenewModalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="updateRenew">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
