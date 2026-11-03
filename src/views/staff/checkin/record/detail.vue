<script setup lang="ts">
import { Upload } from '@/components/File'
import { useDetail } from '@/hooks/detail'
import { record as api } from '@/service/api/staff/checkin'

function createFormModel() {
  return {
    id: '0',
    files: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const {
  formModel,
  modalRef,
  exposed,
  clearTabState,
} = useDetail<FormModel>({
  api,
  createFormModel,
  permission: { useTabPermission: true },
})

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffCheckinRecordDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="900" :before-close="clearTabState">
    <n-form
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="16" :show-feedback="false">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="24" label="所属单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="派驻单位">
              <n-input v-model:value="formModel.outer_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="人员名称">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="规则类型">
              <n-input v-model:value="formModel.group_type" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="规则名称">
              <n-input v-model:value="formModel.group_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="班次名称">
              <n-input v-model:value="formModel.schedule_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="班次描述">
              <n-input
                v-model:value="formModel.schedule_describe"
                placeholder=""
                readonly="true"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="打卡时间">
              <n-input v-model:value="formModel.checkin_time" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="打卡工作日">
              <n-input
                v-model:value="formModel.checkin_date_fmt"
                placeholder=""
                readonly="true"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="8" :show-feedback="false">
          <Upload
            v-model:value="formModel.face_pic"
            :max-number="1"
            :only-image="false"
            upload-title="人员照片"
            :disabled="true"
            :width="280"
            :height="286"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="上下班类型">
          <n-input v-model:value="formModel.work_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="上下班时间">
          <n-input v-model:value="formModel.work_sec" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="打卡类型">
          <n-input v-model:value="formModel.checkin_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="记录类型">
          <n-input v-model:value="formModel.record_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="法定日期类型">
          <n-input v-model:value="formModel.date_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="是否外勤">
          <n-input v-model:value="formModel.out_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="是否补卡">
          <n-input v-model:value="formModel.card_type" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="打卡设备异常">
          <n-input v-model:value="formModel.exception_device" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="打卡地点异常">
          <n-input v-model:value="formModel.exception_location" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡地点">
          <n-input v-model:value="formModel.location_title" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡地点详情">
          <n-input v-model:value="formModel.location_detail" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="打卡wifi">
          <n-input v-model:value="formModel.wifiname" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="打卡MAC">
          <n-input v-model:value="formModel.wifimac" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input
            v-model:value="formModel.notes"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider v-if="formModel.files && formModel.files.length > 0" title-placement="left">
        打卡图片
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi
          v-if="formModel.files && formModel.files.length > 0"
          :span="24"
          label="打卡图片"
        >
          <Upload v-model:value="formModel.files" :only-image="false" :disabled="true" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
