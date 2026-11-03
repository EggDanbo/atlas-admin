<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { LogProcess } from '@/components/Logs/process'
import { createTransformer, useDetail } from '@/hooks/detail'
import { vacation as api } from '@/service/api/staff/apply'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { useUserStore } from '@/store/modules/user'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()
const userStore = useUserStore()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    opt_submit: false,
    user_id: null,
    user_name: null,
    date: null,
    types: null,
    start: null,
    expire: null,
    days: null,
    times: null,
    digest: null,
    leave: null,
    address: null,
    contacts: null,
    remark: null,
    list: [] as any,
    files: [] as any,
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    types: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
    start: [{ type: 'number', required: true, message: '请选择开始日期', trigger: 'change' }],
    expire: [{ type: 'number', required: true, message: '请选择结束日期', trigger: 'change' }],
    digest: [{ required: true, message: '请输入请假原因', trigger: 'change' }],
  }

  return rules
})

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
  params,
  updateModel,
} = useDetail<FormModel>({
  api: {
    get() {
      return api.get({ ...params.value })
    },
    create() {
      return api.create({ ...formModel })
    },
    update() {
      return api.update({ ...formModel })
    },
  },
  createFormModel,
  title: '请假申请',
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['types'],
    number: ['date', 'start', 'expire'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      start: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      leave: val => val ? '是' : '否',
    },
    enum: {
      types: 'checkin_vacation_types',
    },
  }),
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
})

async function handleTypesChange() {
  // 调休假时长单位为小时，其他均为天
  formModel.unit = Number(formModel.types) === 2 ? '小时' : '天'

  // 0:事假,1:病假,2:调休假,3:年假,4:婚假,5:孕检假,6:产假,7:陪产假,8:丧假(直系),9:丧假(非直系)
  switch (Number(formModel.types)) {
    case 2:
    case 3:
    case 4:
    case 5:
    case 7: {
      const { isSuccess, data } = await api.getTimes({ types: formModel.types })
      if (isSuccess) {
        formModel.times = Number(data)
      }
      break
    }
  }
}

async function handleDateUpdate() {
  if (formModel.start && formModel.expire) {
    await getDetail()
  }
}

async function getDetail() {
  const { isSuccess, data } = await api.getDetail({
    user_id: userStore.userInfo?.userid,
    start: formModel.start,
    end: formModel.expire,
  })
  if (!isSuccess)
    return

  formModel.times = data.leave_time_fmt
  formModel.list = data.list
}

async function handleProcess(opt: string) {
  processTypes.value = opt
  processRemark.value = null
  if (opt === '同意') {
    processTitle.value = '审批意见'
    await process()
  }
  else {
    processTitle.value = `${opt}原因`
    processModalRef.value?.open()
  }
}

async function process() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const list = [{ id: formModel.id, biz_class: 'Checkin' }]

  btnLoading.value = true
  if (processTypes.value === '撤回') {
    const { isSuccess } = await approve.revoke({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else if (processTypes.value === '作废') {
    const { isSuccess } = await approve.invalid({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else {
    const { isSuccess } = await approve
      .process({
        list,
        status: processTypes.value,
        remark: processRemark.value,
      })
      .finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  toast.success('操作成功')
  processModalRef.value?.close()
  modalRef.value.close()
  emit('on-action', 'EDIT')
}

async function handleCancel() {
  toast.infoModal('确定取消审批吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await approve
        .cancel({
          list: [{
            id: formModel.id,
            biz_class: 'Checkin',
          }],
        })
        .finally(() => (btnLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      modalRef.value.close()
      emit('on-action', 'EDIT')
    },
  })
}

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id })
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffApplyVacationDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
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
        <n-form-item-gi :span="8" label="请假类型" path="types">
          <n-select
            v-model:value="formModel.types"
            :options="enumStore.getEnumOptions('checkin_vacation_types')"
            clearable
            @update:value="handleTypesChange"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="请假原因" path="digest">
          <n-input v-model:value="formModel.digest" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开始日期" path="start">
          <n-date-picker
            v-model:value="formModel.start"
            type="datetime"
            fast-month-select
            clearable
            @update:value="handleDateUpdate"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期" path="expire">
          <n-date-picker
            v-model:value="formModel.expire"
            type="datetime"
            fast-month-select
            clearable
            :disabled="!formModel.start"
            :default-calendar-start-time="formModel.start"
            @update:value="handleDateUpdate"
          />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.list.length === 0" :span="8" label="请假时长" path="days">
          <n-input-number v-model:value="formModel.days" :precision="1" :step="0.5">
            <template #suffix>
              天
            </template>
          </n-input-number>
        </n-form-item-gi>
        <n-form-item-gi v-else :span="8" label="请假时长" path="times">
          <n-input v-model:value="formModel.times" placeholder="" readonly />
        </n-form-item-gi>
        <!-- <n-form-item-gi :span="4" label="是否外出" path="leave">
          <n-switch v-model:value="formModel.leave">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="外出地点" path="address">
          <n-input v-model:value="formModel.address" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="外出联系人" path="contacts">
          <n-input v-model:value="formModel.contacts" clearable />
        </n-form-item-gi> -->
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi>
      </n-grid>

      <div v-if="formModel.list.length > 0" class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          请假明细
        </n-divider>
        <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="flex items-stretch">
            <div class="label-nums">
              <n-text strong>
                #{{ Number(key) + 1 }}
              </n-text>
            </div>

            <div class="detail-card-box-content">
              <n-grid :cols="24" :x-gap="24" :y-gap="24">
                <n-form-item-gi :span="12" label="请假日期" label-width="80" :show-feedback="false">
                  <n-input v-model:value="item.day" placeholder="" readonly="true" />
                </n-form-item-gi>
                <n-form-item-gi :span="12" label="请假时长" label-width="80" :show-feedback="false">
                  <n-input :value="item.is_work_day ? `请假${item.leave_time_fmt}` : '休息'" placeholder="" readonly="true" />
                </n-form-item-gi>
              </n-grid>
            </div>
          </div>
        </n-card>
      </div>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div class="stamp-text">
        {{ enumStore.getLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <n-layout-sider
          v-if="formModel.processes && formModel.processes.length > 0"
          show-trigger="bar"
          collapse-mode="transform"
          :collapsed-width="0"
          :width="256"
          :native-scrollbar="false"
        >
          <div class="mb-2 flex flex-col items-center justify-center gap-1">
            <n-qr-code :value="formModel.no || ''" :size="160" padding="0" />
            <span style="font-size: 20px">{{ formModel.no }}</span>
            <n-button
              quaternary
              round
              size="large"
              :type="formModel.opt_return ? 'warning' : 'info'"
              @click="handleLogs('process')"
            >
              点击查看流程日志
            </n-button>
          </div>
          <n-steps vertical class="p-2">
            <n-step
              v-for="item in formModel.processes"
              :key="item"
              :status="item.status === '不同意' ? 'error' : item.status ? 'process' : 'wait'"
            >
              <template #title>
                <span>{{ item.step_name }}</span>
              </template>
              <template #default>
                <p>
                  {{ item.audit_name }}<span v-if="item.status"> / {{ item.status }}</span>
                </p>
                <p v-if="item.remark">
                  {{ item.remark }}
                </p>
                <p>{{ item.audit_time }}</p>
              </template>
            </n-step>
          </n-steps>
        </n-layout-sider>
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="请假类型">
              <n-input :value="formModel.transform?.types" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="请假原因">
              <n-input v-model:value="formModel.digest" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="开始日期">
              <n-input :value="formModel.transform?.start" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="结束日期">
              <n-input :value="formModel.transform?.expire" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="请假时长">
              <n-input v-model:value="formModel.times" placeholder="" readonly />
            </n-form-item-gi>
            <!-- <n-form-item-gi :span="8" label="是否外出">
              <n-input :value="formModel.transform?.leave" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="外出地点">
              <n-input v-model:value="formModel.address" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="外出联系人">
              <n-input v-model:value="formModel.contacts" placeholder="" readonly />
            </n-form-item-gi> -->
            <n-form-item-gi :span="24" label="备注">
              <n-input v-model:value="formModel.remark" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files && formModel.files.length > 0"
              :span="24"
              label="附件"
            >
              <Upload v-model:value="formModel.files" :disabled="true" />
            </n-form-item-gi>
          </n-grid>

          <div v-if="formModel.list.length > 0" class="flex flex-col" style="gap: 16px; margin-top: 16px;">
            <n-divider title-placement="left" style="margin: 0;">
              请假明细
            </n-divider>
            <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
              <div class="flex items-stretch">
                <div class="label-nums">
                  <n-text strong>
                    #{{ Number(key) + 1 }}
                  </n-text>
                </div>

                <div class="detail-card-box-content">
                  <n-grid :cols="24" :x-gap="24" :y-gap="24">
                    <n-form-item-gi :span="12" label="请假日期" label-width="80" :show-feedback="false">
                      <n-input v-model:value="item.day" placeholder="" readonly="true" />
                    </n-form-item-gi>
                    <n-form-item-gi :span="12" label="请假时长" label-width="80" :show-feedback="false">
                      <n-input :value="item.is_work_day ? `请假${item.leave_time_fmt}` : '休息'" placeholder="" readonly="true" />
                    </n-form-item-gi>
                  </n-grid>
                </div>
              </div>
            </n-card>
          </div>
        </n-layout>
      </n-layout>
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
          types="staff/apply/vacation"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button
          v-if="showEdit() && formModel.opt_submit && !isApprove"
          type="primary"
          @click="edit(formModel.id)"
        >
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
        <!-- 审批 -->
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('同意')"
        >
          同意
        </n-button>
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('不同意')"
        >
          不同意
        </n-button>
        <n-button
          v-if="formModel.opt_cancel && isApprove"
          type="primary"
          :loading="btnLoading"
          @click="handleCancel"
        >
          取消
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('撤回')"
        >
          撤回
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('作废')"
        >
          作废
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="processModalRef"
    width="500"
    :title="processTitle"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-radio-group v-if="processTypes === '同意'" v-model:value="processRemark">
          <n-space>
            <n-radio value="拟同意，提交">
              拟同意，提交
            </n-radio>
            <n-radio value="同意">
              同意
            </n-radio>
          </n-space>
        </n-radio-group>
        <n-input
          v-model:value="processRemark"
          type="textarea"
          :rows="5"
          clearable
          :readonly="processTypes === '同意' ? true : false"
        />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="processModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="process">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
</template>
