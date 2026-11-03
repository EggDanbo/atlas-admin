<script lang="ts" setup>
import { hoursToSeconds, minutesToSeconds, secondsToHours, secondsToMinutes } from 'date-fns'
import { SpTimePicker } from '@/components/SpTimePicker'

const props = defineProps({
  value: [Array] as PropType<any>,
  checkInTime: [Array] as PropType<any>,
  // 是否允许下班最晚打卡跨天到次日23:59;排班班次传true,固定班次保持"首段上班+24h"上限不变
  allowNextDay: { type: Boolean, default: false },
  // 是否允许上班最早打卡跨昨日;排班班次传true, 固定班不传(后端Verify兜底earliest>=0)
  allowPrevDay: { type: Boolean, default: false },
})

const emit = defineEmits(['on-action', 'update:value'])

const modalRef = ref<any>(null)
const checkInTimeDataList = ref<any>([])
// 可打卡时段
const periodRange = ref({
  error: false,
  text: '04:00 - 次日03:59',
})
const periodInfo = ref<any>([])

function open() {
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

function buildPeriodInfo(isChange?: boolean) {
  const checkInTime = checkInTimeDataList.value
  periodInfo.value = []

  for (const i in checkInTime) {
    const del = {
      work_date: null,
      off_work_date: null,
      earliest_work_sec: null,
      latest_work_sec: null,
      earliest_off_work_sec: null,
      latest_off_work_sec: null,
      dateRange: {
        earliest_work: [],
        latest_work: [],
        earliest_off_work: [],
        latest_off_work: [],
      },
      dateRangeText: {
        earliest_work: null,
        latest_work: null,
        earliest_off_work: null,
        latest_off_work: null,
      },
    }
    periodInfo.value[i] = del
  }

  for (const i in checkInTime) {
    const items = periodInfo.value[i]
    const {
      work_sec,
      off_work_sec,
      earliest_work_sec,
      latest_work_sec,
      earliest_off_work_sec,
      latest_off_work_sec,
    } = checkInTime[i]
    const work_hours = secondsToHours(work_sec)
    const work_min = secondsToMinutes(work_sec - hoursToSeconds(work_hours))
    const off_work_hours = secondsToHours(off_work_sec)
    const off_work_min = secondsToMinutes(off_work_sec - hoursToSeconds(off_work_hours))
    const work_date = buildDateTextFormat(work_hours, work_min)
    const off_work_date = buildDateTextFormat(off_work_hours, off_work_min)
    items.work_date = work_date
    items.off_work_date = off_work_date

    const isFirstItem = Number(i) === 0
    const isLastItem = Number(i) === checkInTime.length - 1

    // 上班时段(正常)
    if (earliest_work_sec && !isChange) {
      items.earliest_work_sec = earliest_work_sec
    }
    else {
      if (isFirstItem) {
        const firstWorkSec = work_sec - hoursToSeconds(4)
        if (firstWorkSec <= 0) {
          // allowPrevDay 下保留负值(跨前日); 否则抹零(固定班/旧行为)
          items.earliest_work_sec = props.allowPrevDay ? firstWorkSec : 0
        }
        else {
          items.earliest_work_sec = firstWorkSec
        }
      }
    }

    // 上班时段(迟到)
    if (latest_work_sec && !isChange) {
      items.latest_work_sec = latest_work_sec
    }
    else {
      items.latest_work_sec = off_work_sec - minutesToSeconds(1)
    }

    // 下班时段(早退)
    if (earliest_off_work_sec && !isChange) {
      items.earliest_off_work_sec = earliest_off_work_sec
    }
    else {
      items.earliest_off_work_sec = work_sec + minutesToSeconds(1)
    }

    // 下班时段(正常)
    if (latest_off_work_sec && !isChange) {
      items.latest_off_work_sec = latest_off_work_sec
    }
    else {
      if (isLastItem) {
        const latest_off_work_hours = off_work_hours + 4
        items.latest_off_work_sec = hoursToSeconds(latest_off_work_hours) - minutesToSeconds(1)
      }
    }

    // 根据工作时段来计算中间值
    if (isChange) {
      const prevChkItem = checkInTime[Number(i) - 1]
      const prevItem = periodInfo.value[Number(i) - 1]
      if (Number(i) > 0) {
        const midSeconds
          = prevChkItem.off_work_sec + Math.abs(work_sec - prevChkItem.off_work_sec) / 2
        prevItem.latest_off_work_sec = midSeconds - minutesToSeconds(1)
        items.earliest_work_sec = midSeconds + minutesToSeconds(1)
      }
    }
  }

  buildDateRange()
  buildPeriodRangeText()
  emit('update:value', periodInfo.value)
}

function buildDateRange() {
  const checkInTime = checkInTimeDataList.value

  for (const [index, items] of periodInfo.value.entries()) {
    const checkInTimeItem = checkInTime[index]
    const { work_sec, off_work_sec } = checkInTimeItem
    const work_hours = secondsToHours(work_sec)
    const work_min = secondsToMinutes(work_sec - hoursToSeconds(work_hours))
    const off_work_hours = secondsToHours(off_work_sec)
    const off_work_min = secondsToMinutes(off_work_sec - hoursToSeconds(off_work_hours))

    items.work_date = buildDateTextFormat(work_hours, work_min)
    items.off_work_date = buildDateTextFormat(off_work_hours, off_work_min)

    // 上班时段下拉范围
    if (Number(index) === 0) {
      items.dateRange.earliest_work = [props.allowPrevDay ? work_sec - hoursToSeconds(4) : hoursToSeconds(0), hoursToSeconds(work_hours) + minutesToSeconds(work_min)]
    }
    else {
      items.dateRange.earliest_work = [
        hoursToSeconds(work_hours - 1),
        hoursToSeconds(work_hours) + minutesToSeconds(work_min),
      ]
    }
    items.dateRange.latest_work = [hoursToSeconds(work_hours), hoursToSeconds(off_work_hours) + minutesToSeconds(off_work_min)]
    // 上班时段文字范围
    items.dateRangeText.earliest_work = `${buildSecondsToDateTextFormat(items.earliest_work_sec)}-${buildSecondsToDateTextFormat(work_sec)}`
    items.dateRangeText.latest_work = `${buildSecondsToDateTextFormat(work_sec + minutesToSeconds(1))}-${buildSecondsToDateTextFormat(items.latest_work_sec)}`

    // 下班时段下拉范围
    items.dateRange.earliest_off_work = [
      hoursToSeconds(work_hours),
      hoursToSeconds(off_work_hours) + minutesToSeconds(off_work_min),
    ]

    const isLastItem = Number(index) === checkInTime.length - 1
    if (isLastItem) {
      const firstItem = checkInTime[0]
      // 固定班次:下班最晚打卡不超过"首段上班+24h";排班班次(allowNextDay):允许跨天到次日23:59(48h)
      const maxH = props.allowNextDay ? 48 : secondsToHours(firstItem.work_sec) + 24
      let latest_off_work_hours = maxH
      if (latest_off_work_hours <= off_work_hours) {
        latest_off_work_hours = 48
      }

      items.dateRange.latest_off_work = [
        hoursToSeconds(off_work_hours),
        hoursToSeconds(latest_off_work_hours) - minutesToSeconds(1),
      ]

      if (secondsToHours(items.latest_off_work_sec) >= maxH) {
        items.latest_off_work_sec = hoursToSeconds(maxH) - minutesToSeconds(1)
      }
    }
    else {
      // 中间段:下班最晚打卡上限优先取下段上班最早打卡(:517 要求下段earliest_work > 本段latest_off),下段未配则用下班后1小时
      const nextItem = periodInfo.value[index + 1]
      const upperLimit = nextItem && nextItem.earliest_work_sec
        ? nextItem.earliest_work_sec
        : off_work_sec + hoursToSeconds(1)
      items.dateRange.latest_off_work = [
        hoursToSeconds(off_work_hours),
        upperLimit,
      ]
    }
    // 下班时段文字范围
    items.dateRangeText.earliest_off_work = `${buildSecondsToDateTextFormat(items.earliest_off_work_sec)}-${buildSecondsToDateTextFormat(off_work_sec - minutesToSeconds(1))}`
    items.dateRangeText.latest_off_work = `${buildSecondsToDateTextFormat(off_work_sec)}-${buildSecondsToDateTextFormat(items.latest_off_work_sec)}`
  }

  periodDateConflict()
}

function periodDateConflict() {
  const checkInTime = checkInTimeDataList.value

  for (const [index, item] of periodInfo.value.entries()) {
    const checkInTimeItem = checkInTime[index]
    const { work_sec, off_work_sec } = checkInTimeItem
    // 构造错误单位
    item.error = {
      earliest_work: false,
      latest_work: false,
      earliest_off_work: false,
      latest_off_work: false,
    }
    // 构造错误提示
    item.error_text = {
      work: null,
      off_work: null,
    }

    if (item.earliest_work_sec >= work_sec) {
      item.error.earliest_work = true
      item.error_text.work = `上班前打卡时间不能大于或等于${buildSecondsToDateTextFormat(work_sec)}`
    }
    else if (item.latest_work_sec <= work_sec + minutesToSeconds(1)) {
      item.error.latest_work = true
      item.error_text.work = `迟到时间范围不能小于${buildSecondsToDateTextFormat(work_sec + minutesToSeconds(1))}`
    }
    else if (item.latest_work_sec >= off_work_sec) {
      item.error.latest_work = true
      item.error_text.work = `上班打卡时间应早于下班时间(${buildSecondsToDateTextFormat(off_work_sec)})`
    }
    else if (item.earliest_off_work_sec <= work_sec) {
      item.error.earliest_off_work = true
      item.error_text.off_work = `早退时间范围不能小于${buildSecondsToDateTextFormat(work_sec + minutesToSeconds(1))}`
    }
    else if (item.latest_off_work_sec <= off_work_sec) {
      item.error.latest_off_work = true
      item.error_text.off_work = `下班打卡时间不能小于或等于${buildSecondsToDateTextFormat(off_work_sec)}`
    }

    // 多个工作时段的情况
    if (Number(index) > 0) {
      const prevItem = periodInfo.value[Number(index) - 1]
      if (item.earliest_work_sec <= prevItem.latest_off_work_sec) {
        item.error.earliest_work = true
        item.error_text.work = `上班前可打卡时间不能和其他工作时段的下班可打卡时间范围冲突`
      }
    }

    const firstPeriodItem = periodInfo.value[0]
    // 24h 窗口重叠校验: 末段下班打卡窗口不应与首段明日上班窗口重叠(防打卡歧义)。
    // allowPrevDay(earliest 跨前日, 如全天班双向跨天)时允许重叠, 由后端 PickAttribution 消歧, 跳过此校验。
    if (!props.allowPrevDay && item.latest_off_work_sec - hoursToSeconds(24) >= firstPeriodItem.earliest_work_sec) {
      item.error.latest_off_work = true
      item.error_text.off_work = '下班打卡时段应早于明日上班最早可打卡时间'
    }
  }
}

function periodRangeEdit() {
  checkInTimeDataList.value = props.checkInTime
  const { earliest_work_sec } = checkInTimeDataList.value[0]
  if (!earliest_work_sec) {
    buildPeriodInfo(true)
  }
  else {
    buildPeriodInfo()
  }

  modalRef.value?.open()
}

function submit() {
  if (hasPeriodError())
    return

  buildPeriodRangeText()
  modalRef.value?.close()
  emit('update:value', periodInfo.value)
}

// 有错误提示时不能提交
function hasPeriodError() {
  const periodList = periodInfo.value
  if (!Array.isArray(periodList))
    return false

  return periodList.some((item) => {
    if (!item?.error)
      return false
    const errObj = item.error
    return Object.values(errObj).some(Boolean)
  })
}

function buildDateTextFormat(h, m) {
  let hours
  if (h < 0) {
    hours = `昨日${24 + h < 10 ? `0${24 + h}` : 24 + h}`
  }
  else if (h < 10) {
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

function buildSecondsToDateTextFormat(sec) {
  // date-fns secondsToHours/secondsToMinutes 实为 Math.trunc(向零), 负数拆分错误 → sec<0 用 floor
  const h = sec < 0 ? Math.floor(sec / 3600) : secondsToHours(sec)
  const m = sec < 0 ? Math.floor((sec - hoursToSeconds(h)) / 60) : secondsToMinutes(sec - hoursToSeconds(h))

  let hours
  if (h < 0) {
    hours = `昨日${24 + h < 10 ? `0${24 + h}` : 24 + h}`
  }
  else if (h < 10) {
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

function buildPeriodRangeText() {
  const nums = periodInfo.value.length
  const start_date = buildSecondsToDateTextFormat(periodInfo.value[0].earliest_work_sec)
  const end_date = buildSecondsToDateTextFormat(periodInfo.value[nums - 1].latest_off_work_sec)
  periodRange.value.error = false
  periodRange.value.text = `${start_date} - ${end_date}`

  for (const [index, item] of checkInTimeDataList.value.entries()) {
    const { work_sec, off_work_sec } = item
    const periodItem = periodInfo.value[index]
    const { earliest_work_sec, latest_off_work_sec } = periodItem
    if (work_sec <= earliest_work_sec || off_work_sec >= latest_off_work_sec) {
      periodRange.value.error = true
      periodRange.value.text = '可打卡时段有误，请检查'
    }
    if (index > 0) {
      const prevItem = checkInTimeDataList.value[index - 1]
      const midSeconds = item.work_sec - prevItem.off_work_sec
      if (secondsToMinutes(midSeconds) < 5) {
        periodRange.value.error = true
        periodRange.value.text = '每个工作时段之间最好间隔5分钟'
      }
    }
  }
}

watch(
  () => props.checkInTime,
  (value) => {
    checkInTimeDataList.value = value
    const { earliest_work_sec } = checkInTimeDataList.value[0]
    if (!earliest_work_sec) {
      buildPeriodInfo(true)
    }
    else {
      buildPeriodInfo()
    }
  },
  {
    immediate: true,
  },
)

defineExpose({ open, close, buildPeriodInfo })
</script>

<template>
  <div class="h-[34px] w-full flex items-center gap-2.5">
    <p style="font-size: 14px; line-height: 1; margin: 0" :class="{ 'error-alert-text': periodRange.error }">
      {{ periodRange.text }}
    </p>
    <n-button text type="primary" @click="periodRangeEdit">
      修改
    </n-button>
  </div>

  <SpModal
    ref="modalRef"
    title="可打卡时段"
    width="700"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div
        v-for="(items, keys) in periodInfo"
        :key="keys"
        class="w-full flex flex-col gap-3.5"
        :class="{ 'mt-6': Number(keys) > 0 }"
      >
        <div v-if="periodInfo.length > 1" class="w-full flex" style="line-height: 1">
          工作时段{{ Number(keys) + 1 }}
        </div>
        <div class="w-full flex flex-col gap-4.5">
          <div class="w-full flex gap-4.5">
            <div class="items-text h-[34px] flex items-center" style="width: 152px">
              上班({{ items.work_date }})可打卡时段
            </div>
            <div class="items-content" style="width: calc(100% - 152px)">
              <div class="w-full flex items-center gap-2.5">
                <div style="width: 200px" :class="{ 'error-alert': items.error?.earliest_work }">
                  <SpTimePicker
                    v-model="items.earliest_work_sec"
                    :min="items.dateRange.earliest_work[0]"
                    :max="items.dateRange.earliest_work[1]"
                    clearable
                    @update:model-value="buildDateRange"
                  />
                </div>
                <p class="alert-default-text">
                  -
                </p>
                <div style="width: 200px" :class="{ 'error-alert': items.error?.latest_work }">
                  <SpTimePicker
                    v-model="items.latest_work_sec"
                    :min="items.dateRange.latest_work[0]"
                    :max="items.dateRange.latest_work[1]"
                    clearable
                    @update:model-value="buildDateRange"
                  />
                </div>
              </div>
              <p v-if="items.error_text?.work" class="alert-default-text error-alert-text mt-2">
                {{ items.error_text.work }}
              </p>
              <p v-else class="alert-default-text mt-2">
                {{ items.dateRangeText.earliest_work }}打卡为正常，{{
                  items.dateRangeText.latest_work
                }}打卡为迟到
              </p>
            </div>
          </div>
          <div class="w-full flex gap-4.5">
            <div class="items-text h-[34px] flex items-center" style="width: 152px">
              下班({{ items.off_work_date }})可打卡时段
            </div>
            <div class="items-content" style="width: calc(100% - 152px)">
              <div class="w-full flex items-center gap-2.5">
                <div style="width: 200px" :class="{ 'error-alert': items.error?.earliest_off_work }">
                  <SpTimePicker
                    v-model="items.earliest_off_work_sec"
                    :min="items.dateRange.earliest_off_work[0]"
                    :max="items.dateRange.earliest_off_work[1]"
                    clearable
                    @update:model-value="buildDateRange"
                  />
                </div>
                <p class="alert-default-text">
                  -
                </p>
                <div style="width: 200px" :class="{ 'error-alert': items.error?.latest_off_work }">
                  <SpTimePicker
                    v-model="items.latest_off_work_sec"
                    :min="items.dateRange.latest_off_work[0]"
                    :max="items.dateRange.latest_off_work[1]"
                    clearable
                    @update:model-value="buildDateRange"
                  />
                </div>
              </div>
              <p v-if="items.error_text?.off_work" class="alert-default-text error-alert-text mt-2">
                {{ items.error_text.off_work }}
              </p>
              <p v-else class="alert-default-text mt-2">
                {{ items.dateRangeText.earliest_off_work }}打卡为早退，{{
                  items.dateRangeText.latest_off_work
                }}打卡为正常
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button type="primary" @click="submit">
          确定
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
.alert-default-text {
  font-size: 12px;
  color: rgba(11, 18, 26, 0.6);
  line-height: 1;
}

.items-list {
  height: 34px;
}
.items-text {
  width: 100px;
  font-size: 14px;
  line-height: 1;
}
.items-content {
  width: calc(100% - 100px);
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
  .alert-default-text {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
