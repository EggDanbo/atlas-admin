<script lang="ts" setup>
import { hoursToSeconds, minutesToSeconds, secondsToHours, secondsToMinutes } from 'date-fns'
import { SpTimePicker } from '@/components/SpTimePicker'
import Location from './location.vue'
import WifiMac from './wifimac.vue'

const props = defineProps({
  value: Array,
})

const emit = defineEmits(['on-action', 'update:value'])

const modalRef = ref<any>(null)
const checkInTimeInfo = ref<any>([])
// 休息时间
const restTimeNums = ref<number>(0)
const restTimeAlert = ref({
  date: null as null | string,
  dateRange: [] as number[],
})
const restTimeData = ref<any>([])
const restTimeIsEdit = ref(false)

const errorAlert = computed(() => {
  return checkInTimeInfo.value.map((item, key) => {
    const result = { work: false, off_work: false }
    const firstItem = checkInTimeInfo.value[0]

    if (item.off_work_sec <= item.work_sec) {
      result.off_work = true
    }
    else if (item.off_work_sec > firstItem.work_sec + hoursToSeconds(24)) {
      result.off_work = true
    }
    if (Number(key) > 0) {
      const prevItem = checkInTimeInfo.value[Number(key) - 1]
      if (item.work_sec <= prevItem.off_work_sec) {
        result.work = true
      }
    }

    return result
  })
})

function open() {
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

function checkInTimeAdd() {
  const items = checkInTimeInfo.value
  if (items.length > 0) {
    const nums = items.length - 1
    const maxHours = secondsToHours(Number(items[nums].work_sec)) + 23
    const off_work_hours = secondsToHours(Number(items[nums].off_work_sec))
    let off_work_sec, work_sec

    if (off_work_hours >= maxHours) {
      work_sec = hoursToSeconds(maxHours) + minutesToSeconds(1)
      off_work_sec = hoursToSeconds(maxHours) + minutesToSeconds(2)
    }
    else {
      work_sec = Number(items[nums].off_work_sec) + hoursToSeconds(1)
      off_work_sec = Number(items[nums].off_work_sec) + hoursToSeconds(2)
    }

    items.push({
      work_sec,
      off_work_sec,
      earliest_work_sec: null,
      latest_work_sec: null,
      earliest_off_work_sec: null,
      latest_off_work_sec: null,
      rest_time: [],
    })

    emit('on-action', true)
  }
  else {
    items.push({
      work_sec: hoursToSeconds(9),
      off_work_sec: hoursToSeconds(17),
      earliest_work_sec: null,
      latest_work_sec: null,
      earliest_off_work_sec: null,
      latest_off_work_sec: null,
      rest_time: [],
    })
  }
}

function checkInTimeRemove(keys: string | number) {
  const items = checkInTimeInfo.value
  items.splice(keys, 1)
}

function restTimeModalShow(keys: string | number) {
  restTimeIsEdit.value = false
  restTimeNums.value = Number(keys)
  // 根据工作时间显示休息时间段提示内容
  const work_sec = checkInTimeInfo.value[keys].work_sec
  const off_work_sec = checkInTimeInfo.value[keys].off_work_sec
  const work_hours = secondsToHours(work_sec)
  const work_min = secondsToMinutes(work_sec - hoursToSeconds(work_hours))
  const off_work_hours = secondsToHours(off_work_sec)
  const off_work_min = secondsToMinutes(off_work_sec - hoursToSeconds(off_work_hours))
  const work_date = buildDateTextFormat(work_hours, work_min)
  const off_work_date = buildDateTextFormat(off_work_hours, off_work_min)
  restTimeAlert.value.date = `${work_date}-${off_work_date}`
  restTimeAlert.value.dateRange = [work_sec, off_work_sec]
  // 获取休息时间
  const restTime = checkInTimeInfo.value[keys].rest_time
  restTimeData.value = restTime.length > 0 ? restTime : []
  if (restTimeData.value.length === 0) {
    restTimeAdd()
  }
  else {
    restTimeIsEdit.value = true
  }
  open()
}

function restTimeAdd() {
  restTimeData.value.push({ rest_begin_time: null, rest_end_time: null })
}

function restTimeRemove(keys: string | number) {
  const items = restTimeData.value
  items.splice(keys, 1)
}

function restTimeCheck() {
  return false
}

function restTimeSave() {
  if (restTimeCheck())
    return
  const items = checkInTimeInfo.value[restTimeNums.value]
  items.rest_time = restTimeData.value
  close()
}

function restTimeClear() {
  const items = checkInTimeInfo.value[restTimeNums.value]
  items.rest_time = []
  close()
}

function restTimeShowText(arr: any) {
  const textArr: string[] = []
  if (arr.length > 0) {
    for (const i in arr) {
      const work_sec = arr[i].rest_begin_time
      const off_work_sec = arr[i].rest_end_time
      const work_hours = secondsToHours(work_sec)
      const work_min = secondsToMinutes(work_sec - hoursToSeconds(work_hours))
      const off_work_hours = secondsToHours(off_work_sec)
      const off_work_min = secondsToMinutes(off_work_sec - hoursToSeconds(off_work_hours))
      const work_date = buildDateTextFormat(work_hours, work_min)
      const off_work_date = buildDateTextFormat(off_work_hours, off_work_min)
      textArr.push(`${work_date}-${off_work_date}`)
    }
  }
  const text = textArr.join(';')
  return text
}

function handleTimePickerUpdate() {
  emit('on-action', true)
}

function buildDateTextFormat(h, m) {
  let hours
  if (h < 10) {
    hours = `0${h}`
  }
  else if (h > 23) {
    hours = `次日${h - 24 < 10 ? `0${h - 24}` : h - 24}`
  }
  else {
    hours = h
  }
  const min = m < 10 ? `0${m}` : m

  return `${hours}:${min}`
}

watch(
  () => props.value,
  (value) => {
    const arr: any = value || []
    checkInTimeInfo.value = value
    if (arr.length === 0) {
      checkInTimeAdd()
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

defineExpose({ open, close })
</script>

<template>
  <div class="w-full flex flex-col">
    <div
      v-for="(items, keys) in checkInTimeInfo"
      :key="keys"
      class="check_in_time_box w-full flex flex-col"
      :class="{ 'mt-4': Number(keys) > 0 }"
    >
      <div
        v-if="checkInTimeInfo.length > 1"
        class="header w-full flex items-center justify-between"
      >
        <div class="title">
          工作时段{{ Number(keys) + 1 }}
        </div>
        <div class="close-btn" @click="checkInTimeRemove(keys)">
          <n-icon size="10">
            <Icon icon="ant-design:close-outlined" />
          </n-icon>
        </div>
      </div>
      <div class="items-list w-full flex items-center gap-2.5">
        <p class="items-text">
          上班时间
        </p>
        <div style="width: 200px" :class="{ 'error-alert': errorAlert[keys].work }">
          <SpTimePicker
            v-model="items.work_sec"
            :min="Number(keys) > 0 ? checkInTimeInfo[Number(keys) - 1].off_work_sec : 0"
            clearable
            @change="handleTimePickerUpdate"
          />
          <p v-if="errorAlert[keys].work && Number(keys) > 0" class="error-alert-text">
            上班时间应晚于 工作时段{{ keys }} 下班时间
          </p>
        </div>
      </div>
      <div class="items-list mt-4 w-full flex items-center gap-2.5">
        <p class="items-text">
          下班时间
        </p>
        <div style="width: 200px" :class="{ 'error-alert': errorAlert[keys].off_work }">
          <SpTimePicker
            v-model="items.off_work_sec"
            :min="items.work_sec || 0"
            clearable
            @change="handleTimePickerUpdate"
          />
          <p v-if="errorAlert[keys].off_work" class="error-alert-text">
            下班时间不能早于上班时间或整体工作时间大于24小时
          </p>
        </div>
      </div>
      <div class="items-list mt-4 h-[34px] w-full flex items-center gap-2.5">
        <p class="items-text">
          休息时间
        </p>
        <div
          v-if="items.rest_time && items.rest_time.length > 0"
          class="h-[34px] flex items-center gap-3.5"
          style="padding: 0 2px"
        >
          <p>{{ restTimeShowText(items.rest_time) }}</p>
          <n-button text type="primary" @click="restTimeModalShow(keys)">
            修改
          </n-button>
        </div>
        <div v-else class="h-[34px] flex items-center gap-3.5" style="padding: 0 2px">
          <n-button text type="primary" @click="restTimeModalShow(keys)">
            添加
          </n-button>
          <p class="alert-default-text">
            休息时间不计入工作时长
          </p>
        </div>
      </div>
      <div class="items-list mt-4 w-full flex gap-2.5">
        <p class="items-text h-[34px] flex items-center">
          打卡位置
        </p>
        <div class="items-content">
          <Location v-model:value="items.checkin_location" :is-text="true" :is-small="true" />
        </div>
      </div>
      <div class="items-list mt-4 w-full flex gap-2.5">
        <p class="items-text h-[34px] flex items-center">
          打卡Wi-Fi
        </p>
        <div class="items-content">
          <WifiMac v-model:value="items.checkin_wifimac" :is-text="true" :is-small="true" />
        </div>
      </div>
    </div>
    <div class="mt-4">
      <n-button @click="checkInTimeAdd">
        <template #icon>
          <n-icon>
            <Icon icon="ant-design:plus-outlined" />
          </n-icon>
        </template>
        添加时间段
      </n-button>
    </div>
  </div>

  <SpModal
    ref="modalRef"
    title="休息时间"
    width="700"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <p class="alert-default-text">
        可在工作时间段 ({{ restTimeAlert.date }}) 设置多段休息时间，休息时间不计入工时
      </p>
      <div class="mt-[24px] w-full flex flex-col gap-3.5" style="padding-bottom: 24px">
        <div
          v-for="(items, keys) in restTimeData"
          :key="keys"
          class="items-list w-full flex items-center gap-2.5"
        >
          <p class="items-text">
            休息时间{{ restTimeData.length > 1 ? Number(keys) + 1 : '' }}
          </p>
          <div class="items-content flex items-center gap-2.5">
            <div style="width: 200px">
              <SpTimePicker
                v-model="items.rest_begin_time"
                :min="checkInTimeInfo[restTimeNums].work_sec"
                :max="checkInTimeInfo[restTimeNums].off_work_sec"
                placeholder="开始时间"
                clearable
              />
            </div>
            <p class="alert-default-text">
              -
            </p>
            <div style="width: 200px">
              <SpTimePicker
                v-model="items.rest_end_time"
                :min="checkInTimeInfo[restTimeNums].work_sec"
                :max="checkInTimeInfo[restTimeNums].off_work_sec"
                placeholder="结束时间"
                clearable
              />
            </div>
            <div class="flex items-center gap-2.5" style="padding-left: 12px">
              <n-button
                v-if="restTimeData.length === Number(keys) + 1"
                strong
                secondary
                circle
                size="small"
                @click="restTimeAdd"
              >
                <template #icon>
                  <n-icon size="12">
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
              </n-button>
              <n-button
                v-if="restTimeData.length > 1"
                strong
                secondary
                circle
                size="small"
                @click="restTimeRemove(keys)"
              >
                <template #icon>
                  <n-icon size="12">
                    <Icon icon="ant-design:delete-outlined" />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space :justify="restTimeIsEdit ? 'space-between' : 'end'">
        <n-button v-if="restTimeIsEdit" type="error" text @click="restTimeClear">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          清空休息时间
        </n-button>
        <n-space justify="end">
          <n-button @click="close">
            关闭
          </n-button>
          <n-button type="primary" @click="restTimeSave">
            确定
          </n-button>
        </n-space>
      </n-space>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
  .check_in_time_box {
  background-color: rgba(6, 15, 26, 0.05);
  padding: 12px 20px;
  font-size: 14px;
  .title {
    color: rgba(9, 17, 26, 0.4);
    line-height: 1;
    margin-bottom: 14px;
  }
  .close-btn {
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(6, 15, 26, 0.05);
    transition: all 0.2s linear;
    &:hover {
      background-color: rgba(6, 15, 26, 0.1);
    }
  }
}

.items-list {
  display: flex;
  align-items: flex-start;
  .items-text {
    height: 34px;
    display: flex;
    align-items: center;
    width: 80px;
  }
  .items-content {
    width: calc(100% - 80px);
  }
}

.alert-default-text {
  font-size: 13px;
  color: rgba(11, 18, 26, 0.6);
  line-height: 1;
}

.error-alert {
  ::v-deep(.n-base-selection) {
    .n-base-selection__border,
    .n-base-selection__state-border {
      border: 1px solid #fc5a4e !important;
    }
  }
  ::v-deep(.n-input-group-label) {
    background-color: #fc5a4e;
    color: #fff;

    .n-input-group-label__border {
      border: 1px solid #fc5a4e !important;
    }
  }
  &-text {
    font-size: 12px;
    color: #fc5a4e;
    line-height: 1;
    margin-top: 8px;
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
