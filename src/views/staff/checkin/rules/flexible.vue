<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { CheckinGroup, CheckinLocation, CheckinSpeWorkDay, CheckinWifiMac } from './types'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format, hoursToSeconds, minutesToSeconds } from 'date-fns'
import printJS from 'print-js'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { SpTimePicker } from '@/components/SpTimePicker'
import { createTransformer, useDetail } from '@/hooks/detail'
import { team as teamApi } from '@/service/api/organ'
import { rules as api } from '@/service/api/staff/checkin'
import DayOff from './components/dayOff.vue'
import Location from './components/location.vue'
import Reissue from './components/reissue.vue'
import WifiMac from './components/wifimac.vue'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const checkinSpeWorkDayModalRef = ref<ModalInst | null>(null)

const checkBoxOptions = ref([
  {
    value: 1,
    text: '周一',
    disabled: false,
  },
  {
    value: 2,
    text: '周二',
    disabled: false,
  },
  {
    value: 3,
    text: '周三',
    disabled: false,
  },
  {
    value: 4,
    text: '周四',
    disabled: false,
  },
  {
    value: 5,
    text: '周五',
    disabled: false,
  },
  {
    value: 6,
    text: '周六',
    disabled: false,
  },
  {
    value: 0,
    text: '周日',
    disabled: false,
  },
])
const workDurationOptions = ref<any>([
  {
    value: -1,
    label: '不限制',
  },
])
for (let i = 0; i <= 48; i++) {
  const nums = i * 0.5
  if (nums >= 1) {
    workDurationOptions.value.push({
      value: hoursToSeconds(nums),
      label: `${nums}小时`,
    })
  }
}
// 特殊日期 —— 必须打卡日期
const checkinSpeWorkDayInfo = ref<any>({
  time: null,
  begin_time: null,
  end_time: null,
  checkin_time: [],
  notes: null,
})
// 时间类型
const checkinSpeWorkDayTimesType = ref(0)
const checkinSpeWorkDayTypes = ref('不重复')
const checkinSpeWorkDayTypesOptions = ref([
  {
    label: '不重复',
    value: '不重复',
  },
  {
    label: '每两周重复',
    value: '每两周重复',
  },
])
const checkinSpeWorkDayisEdit = ref(false)
const checkinSpeworkDayNums = ref(0)
// 特殊日期 —— 不用打卡日期
const isCheckinSpeOffDay = ref(false)

const optionOutRangeOptions = ref<any>([
  {
    value: 0,
    label: '不在公司范围内视为异常',
  },
  {
    value: 1,
    label: '不在公司范围内视为外勤',
  },
  {
    value: 2,
    label: '禁止不在公司范围内打卡',
  },
])
// 考勤提醒
const remindWorkOptions = ref([
  {
    value: 1,
    label: '准点',
  },
  {
    value: 2,
    label: '前5分钟',
  },
  {
    value: 3,
    label: '前10分钟',
  },
  {
    value: 4,
    label: '前15分钟',
  },
  {
    value: 5,
    label: '前20分钟',
  },
])
const remindOffWorkOptions = ref([
  {
    value: 1,
    label: '准点',
  },
  {
    value: 2,
    label: '后10分钟',
  },
  {
    value: 3,
    label: '后20分钟',
  },
  {
    value: 4,
    label: '后30分钟',
  },
  {
    value: 5,
    label: '后60分钟',
  },
])

const teamTreeOptions = ref<any>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({ stoped: true })
  if (isSuccess)
    teamTreeOptions.value = data
}
onMounted(() => loadTeamTree())

function createFormModel() {
  return {
    id: null,
    team_id: null,
    group_name: null,
    workdays: [1, 2, 3, 4, 5],
    standard_work_duration: hoursToSeconds(1.5),
    span_day_time: hoursToSeconds(5),
    checkin_spe_workdays: [] as CheckinSpeWorkDay[],
    checkin_location: [] as CheckinLocation[],
    checkin_wifimac: [] as CheckinWifiMac[],
    checkin_method_type: 1,
    offwork_interval_time: 300,
    use_face_detect: false,
    option_out_range: 0,
    remind_work: 3,
    remind_off_work: 1,
    reissue: {},
    sync_holidays: 0,
    period_date: null,
  } as CheckinGroup
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  group_name: [{ required: true, message: '请输入规则名称', trigger: 'change' }],
}

const {
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  params,
  submit,
  clearTabState,
} = useDetail<FormModel>({
  api: {
    create(data: Recordable) {
      return api.createFlexible({ ...data })
    },
    update(data: Recordable) {
      return api.updateFlexible({ ...data })
    },
    get() {
      return api.get({ ...params.value })
    },
  },
  createFormModel,
  title: '自由上下班规则',
  permission: { useTabPermission: true, permName: 'DEMO_STAFF_CHECKIN_RULES' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onOpen: () => {
    // 节假日同步模式;空值及存量布尔值（旧数据）统一转为数字
    const holiday = formModel.sync_holidays as unknown
    formModel.sync_holidays
      = holiday === true ? 2 : holiday === false || holiday == null ? 0 : Number(holiday)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['period_date', 'period_date_begin'],
  }),
})

async function print(opt: number) {
  btnLoading.value = true
  const { isSuccess, data } = await api.qrcode({ id: formModel.id, types: opt, print: true }).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return
  printJS({
    printable: data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

/**
 * 深拷贝工具函数
 */
const deepClone = (value: any) => JSON.parse(JSON.stringify(value))

function handleCheckinSpeWorkDayTimesType() {
  checkinSpeWorkDayInfo.value.time = null
  checkinSpeWorkDayInfo.value.begin_time = null
  checkinSpeWorkDayInfo.value.end_time = null
  checkinSpeWorkDayTypes.value = '不重复'
}

function checkinspeWorkDaySave() {
  let time_type
  if (checkinSpeWorkDayTimesType.value === 0) {
    if (checkinSpeWorkDayTypes.value === '每两周重复') {
      time_type = 2
    }
    else {
      time_type = 0
    }
  }
  else if (checkinSpeWorkDayTimesType.value === 1) {
    time_type = 1
  }

  const data = deepClone({ ...checkinSpeWorkDayInfo.value, time_type })
  if (isCheckinSpeOffDay.value) {
    if (!formModel.checkin_spe_offdays)
      return

    if (checkinSpeWorkDayisEdit.value) {
      formModel.checkin_spe_offdays[checkinSpeworkDayNums.value] = data
    }
    else {
      formModel.checkin_spe_offdays.push(data)
    }
  }
  else {
    if (!formModel.checkin_spe_workdays)
      return

    if (checkinSpeWorkDayisEdit.value) {
      formModel.checkin_spe_workdays[checkinSpeworkDayNums.value] = data
    }
    else {
      formModel.checkin_spe_workdays.push(data)
    }
  }

  checkinSpeWorkDayModalRef.value?.close()
  checkinSpeWorkDayisEdit.value = false
}

function checkinSpeOffDayModalShow() {
  isCheckinSpeOffDay.value = true
  checkinSpeWorkDayisEdit.value = false

  checkinSpeWorkDayInfo.value.time = Date.now()
  checkinSpeWorkDayInfo.value.notes = null
  checkinSpeWorkDayInfo.value.begin_time = null
  checkinSpeWorkDayInfo.value.end_time = null
  checkinSpeWorkDayInfo.value.checkin_time = []

  checkinSpeWorkDayModalRef.value?.open()
}

function checkinSpeOffDayModalEdit(keys: number) {
  if (!formModel.checkin_spe_offdays)
    return

  isCheckinSpeOffDay.value = true
  const data = deepClone({ ...formModel.checkin_spe_offdays[keys] })
  checkinSpeWorkDayInfo.value = data
  if (data.time_type === 0) {
    checkinSpeWorkDayTimesType.value = 0
  }
  else if (data.time_type === 1) {
    checkinSpeWorkDayTimesType.value = 1
  }
  else if (data.time_type === 2) {
    checkinSpeWorkDayTimesType.value = 0
    checkinSpeWorkDayTypes.value = '每两周重复'
  }

  checkinSpeWorkDayisEdit.value = true
  checkinSpeworkDayNums.value = keys

  checkinSpeWorkDayModalRef.value?.open()
}

function checkinSpeOffDayModalRemove(keys: number) {
  const items = formModel.checkin_spe_offdays
  if (items)
    items.splice(keys, 1)
}

function handleDayOff(options: any) {
  formModel.checkin_method_type = options.checkin_method_type
  formModel.offwork_interval_time = minutesToSeconds(options.offwork_interval_time)
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'StaffCheckinRulesFlexible' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
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
        <n-form-item-gi :span="24" label="规则名称" path="group_name">
          <n-input v-model:value="formModel.group_name" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡时间" :show-require-mark="true">
          <div class="w-full flex flex-col">
            <div class="check_in_time_box w-full flex flex-col">
              <div class="items-list w-full flex items-center gap-2.5">
                <p class="items-text">
                  工作日
                </p>
                <div class="items-content">
                  <n-checkbox-group v-model:value="formModel.workdays">
                    <n-space item-style="display: flex;">
                      <n-checkbox
                        v-for="(items, keys) in checkBoxOptions"
                        :key="keys"
                        :value="items.value"
                        :label="items.text"
                        :disabled="items.disabled"
                      />
                    </n-space>
                  </n-checkbox-group>
                </div>
              </div>
              <div class="items-list mt-4 w-full flex items-center gap-2.5">
                <div class="items-text">
                  工作时长
                </div>
                <div class="items-content flex items-center">
                  <n-select
                    v-model:value="formModel.standard_work_duration"
                    :options="workDurationOptions"
                    style="width: 100px"
                  />
                  <p class="alert-default-text ml-4">
                    超过工作时长将计算加班，选择「不限制」将影响加班计算
                  </p>
                </div>
              </div>
              <div class="items-list mt-4 w-full flex items-center gap-2.5">
                <div class="items-text">
                  打卡开始时间
                </div>
                <div class="items-content flex items-center">
                  <span>每天</span>
                  <div class="ml-2 mr-2 w-[150px]">
                    <SpTimePicker
                      v-model="formModel.span_day_time"
                      placeholder="开始时间"
                    />
                  </div>
                  <span>开始新的一天打卡</span>
                </div>
              </div>
            </div>
          </div>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="特殊日期">
          <div
            v-if="formModel.checkin_spe_offdays && formModel.checkin_spe_offdays.length > 0"
            class="w-full flex flex-col gap-3.5"
          >
            <div>
              <n-button @click="checkinSpeOffDayModalShow">
                添加无需打卡日期
              </n-button>
            </div>

            <div v-if="formModel.checkin_spe_offdays.length > 0" class="spe-days-list w-full">
              <div
                v-for="(items, keys) in formModel.checkin_spe_offdays"
                :key="keys"
                class="list-wrapper"
              >
                <dl>
                  <dd>
                    {{ format(Number(items.time), 'yyyy-MM-dd') }}
                  </dd>
                  <dd>
                    {{ items.notes }}
                  </dd>
                  <dd>
                    <div class="flex items-center justify-center">
                      <n-button text type="primary" @click="checkinSpeOffDayModalEdit(keys)">
                        编辑
                      </n-button>
                      <n-divider vertical />
                      <n-button text type="primary" @click="checkinSpeOffDayModalRemove(keys)">
                        删除
                      </n-button>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <n-space v-else>
            <n-button @click="checkinSpeOffDayModalShow">
              添加无需打卡日期
            </n-button>
          </n-space>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="节假日">
          <div>
            <div class="flex items-center">
              <n-checkbox
                :checked="formModel.sync_holidays !== 0"
                @update:checked="(v: boolean) => (formModel.sync_holidays = v ? 2 : 0)"
              >
                中国法定节假日不用打卡
              </n-checkbox>
            </div>
            <n-radio-group
              v-if="formModel.sync_holidays !== 0"
              v-model:value="formModel.sync_holidays"
              class="mt-2"
              size="small"
            >
              <n-space vertical>
                <n-radio :value="2">
                  法定节假日、调休期间不用打卡，补班日期需打卡
                </n-radio>
                <n-radio :value="1">
                  仅法定节假日不用打卡（如国庆 3 天法定假），调休期间、补班日期正常打卡
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡设置">
          <DayOff
            v-model:type="formModel.checkin_method_type"
            v-model:time="formModel.offwork_interval_time"
            :is-flexible="true"
            @on-action="handleDayOff"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="有效期">
          <n-date-picker
            v-model:value="formModel.period_date_begin"
            type="date"
            placeholder="生效开始日期"
            fast-month-select
            clearable
            style="width: 200px"
          />
          <span class="mx-2">至</span>
          <n-date-picker
            v-model:value="formModel.period_date"
            type="date"
            placeholder="截止有效期"
            fast-month-select
            clearable
            style="width: 200px"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="每日工作时长">
          <n-input-number
            v-model:value="formModel.daily_work_duration"
            :min="0"
            :max="86400"
            :step="1800"
            :disabled="formModel.daily_work_duration === 0"
            :format="
              (v: number | null) => (v !== null ? String(Math.round((v / 3600) * 10) / 10) : '')
            "
            :parse="(input: string) => Math.round(Number(input) * 3600)"
            style="width: 150px"
          >
            <template #suffix>
              小时
            </template>
          </n-input-number>
          <n-checkbox
            :checked="formModel.daily_work_duration === 0"
            class="ml-4"
            @update:checked="(v: boolean) => (formModel.daily_work_duration = v ? 0 : 28800)"
          >
            不限制
          </n-checkbox>
        </n-form-item-gi>
      </n-grid>

      <n-divider title-placement="left">
        打卡方式
      </n-divider>
      <n-grid>
        <n-form-item-gi :span="24" label="打卡位置">
          <Location v-model:value="formModel.checkin_location" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡Wi-Fi">
          <WifiMac v-model:value="formModel.checkin_wifimac" />
        </n-form-item-gi>
      </n-grid>

      <n-divider title-placement="left">
        补卡设置
      </n-divider>
      <n-grid>
        <n-form-item-gi :span="24" label="补卡申请">
          <Reissue v-model:value="formModel.reissue" />
        </n-form-item-gi>
      </n-grid>

      <n-divider title-placement="left">
        更多设置
      </n-divider>
      <n-grid>
        <n-form-item-gi :span="24" label="人脸识别">
          <n-switch v-model:value="formModel.use_face_detect" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="打卡必须拍照">
          <n-switch v-model:value="formModel.need_photo" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="范围外打卡">
          <n-radio-group v-model:value="formModel.option_out_range" name="optionOutRange">
            <div class="flex flex-col">
              <div
                v-for="(items, keys) in optionOutRangeOptions"
                :key="keys"
                class="h-[34px] flex items-center"
                style="line-height: 1"
              >
                <n-radio :value="items.value">
                  {{ items.label }}
                </n-radio>
              </div>
            </div>
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="考勤提醒">
          <div class="w-full flex items-center" style="gap: 5px; line-height: 1">
            <span>上班</span>
            <n-select
              v-model:value="formModel.remind_work"
              :options="remindWorkOptions"
              style="width: 130px"
            />
            <span>-</span>
            <span>下班</span>
            <n-select
              v-model:value="formModel.remind_off_work"
              :options="remindOffWorkOptions"
              style="width: 130px"
            />
          </div>
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
        <n-button-group>
          <n-button v-if="Number(formModel.id) !== 0" :loading="btnLoading" @click="print(0)">
            打卡二维码
          </n-button>
          <n-button v-if="Number(formModel.id) !== 0" :loading="btnLoading" @click="print(1)">
            顶班二维码
          </n-button>
        </n-button-group>
        <n-button
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

  <SpModal
    ref="checkinSpeWorkDayModalRef"
    title="无需打卡日期"
    width="700"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full pb-4">
        <div class="items-list flex items-center">
          <div class="items-text">
            添加方式
          </div>
          <div class="items-content">
            <n-radio-group
              v-model:value="checkinSpeWorkDayTimesType"
              @update:value="handleCheckinSpeWorkDayTimesType"
            >
              <n-space>
                <n-radio :value="0" name="checkinSpeWorkDayTimesType">
                  单个日期
                </n-radio>
                <n-radio :value="1" name="checkinSpeWorkDayTimesType">
                  时间段
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
        </div>
        <div class="items-list mt-4 flex items-center">
          <div class="items-text">
            选择日期
          </div>
          <div v-if="checkinSpeWorkDayTimesType === 0" class="items-content">
            <n-date-picker
              v-model:value="checkinSpeWorkDayInfo.time"
              type="date"
              fast-month-select
              clearable
              style="width: 200px"
            />
          </div>
          <div
            v-if="checkinSpeWorkDayTimesType === 1"
            class="items-content flex items-center gap-2.5"
          >
            <n-date-picker
              v-model:value="checkinSpeWorkDayInfo.begin_time"
              type="date"
              fast-month-select
              placeholder="开始日期"
              style="width: 200px"
            />
            <p>至</p>
            <n-date-picker
              v-model:value="checkinSpeWorkDayInfo.end_time"
              type="date"
              fast-month-select
              placeholder="结束日期"
              style="width: 200px"
            />
          </div>
        </div>
        <div v-if="checkinSpeWorkDayTimesType === 0" class="items-list mt-4 flex items-center">
          <div class="items-text">
            重复
          </div>
          <div class="items-content flex items-center gap-2.5">
            <n-select
              v-model:value="checkinSpeWorkDayTypes"
              :options="checkinSpeWorkDayTypesOptions"
              style="width: 200px"
            />
            <n-date-picker
              v-if="checkinSpeWorkDayTypes === '每两周重复'"
              v-model:value="checkinSpeWorkDayInfo.end_time"
              type="date"
              fast-month-select
              style="width: 200px"
              placeholder="选择截止日期"
            />
          </div>
        </div>

        <div class="items-list mt-4 flex items-center">
          <div class="items-text">
            特殊事由
          </div>
          <div class="items-content">
            <n-input v-model:value="checkinSpeWorkDayInfo.notes" clearable />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="checkinSpeWorkDayModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" @click="checkinspeWorkDaySave">
          确定
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>

<style lang="less" scoped>
  .check_in_time_box {
  background-color: rgba(6, 15, 26, 0.05);
  padding: 16px;
  font-size: 14px;
  .items-text {
    width: 100px;
  }
  .items-content {
    width: calc(100% - 100px);
  }
}

.alert-default-text {
  font-size: 13px;
  color: rgba(11, 18, 26, 0.6);
  line-height: 1;
}

.items-list {
  height: 34px;
}
.items-text {
  width: 82px;
  font-size: 14px;
  line-height: 1;
}
.items-content {
  width: calc(100% - 82px);
}

.table-list-wrapper {
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(6, 15, 26, 0.1);
  .table-list-title {
    width: 100%;
    display: flex;
    height: 32px;
    dl {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      background-color: rgba(5, 14, 26, 0.03);
      color: rgba(11, 18, 26, 0.6);
      padding: 0 16px;
      gap: 8px;
      dd {
        position: relative;
        line-height: 1;
        &::before {
          content: '';
          position: absolute;
          height: 14px;
          width: 1px;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(6, 15, 26, 0.1);
        }
        &:nth-child(1) {
          flex-basis: 180px;
          &::before {
            display: none;
          }
        }
        &:nth-child(2) {
          flex-basis: calc(100% - 180px);
        }
      }
    }
  }
  .table-list-content {
    width: 100%;
    display: flex;
    position: relative;
    padding: 16px;
    gap: 8px;
    align-items: center;
    background-color: #fff;
    color: rgba(14, 19, 25, 0.9);
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    &-item {
      &:nth-child(1) {
        flex-basis: 180px;
      }
      &:nth-child(2) {
        flex-basis: calc(100% - 180px - 80px);
      }
      &:nth-child(3) {
        flex-basis: 80px;
      }
    }
  }
  .table-list-bottom {
    display: flex;
    position: relative;
    height: 40px;
    align-items: center;
    justify-content: center;
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    dl {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      transition: all 0.3s ease-in-out;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 12px;
      &:hover {
        background-color: rgba(6, 15, 26, 0.05);
      }
      dd {
        display: flex;
        align-items: center;
        line-height: 1;
        &:nth-child(1) {
          color: #144384;
          span {
            line-height: 1;
            margin-left: 6px;
          }
        }
        &:nth-child(2) {
          color: rgba(11, 18, 26, 0.6);
          margin-left: 12px;
        }
      }
    }
  }
}

.checkin_date_desc {
  display: flex;
  height: 20px;
  align-items: center;
  font-size: 14px;
  margin-bottom: 4px;
  dd {
    line-height: 1;
    &.title {
      width: 100px;
      color: rgba(11, 18, 26, 0.6);
    }
    &.content {
      width: calc(100% - 100px);
      color: rgba(14, 19, 25, 0.9);
    }
  }
}

.gray-box-bg {
  background-color: rgba(6, 15, 26, 0.05);
}

.spe-days-list {
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(6, 15, 26, 0.1);
  .list-wrapper {
    dl {
      min-height: 32px;
      display: flex;
      width: 100%;
      align-items: center;
      padding: 6px 16px;
      gap: 16px;
      dd {
        &:nth-child(1) {
          flex-basis: 276px;
        }
        &:nth-child(2) {
          flex-basis: calc(100% - 276px - 80px - 32px);
        }
        &:nth-child(3) {
          flex-basis: 80px;
        }
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .check_in_time_box {
    background-color: rgba(0, 0, 0, 0.2);
  }
  .alert-default-text {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
