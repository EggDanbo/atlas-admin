<script lang="ts" setup>
import { hoursToMinutes, minutesToHours } from 'date-fns'

const props = defineProps({
  value: [String, Number, Array] as PropType<null | number | string | string[]>,
  isFlexible: {
    type: Boolean,
    default: false,
  },
  type: {
    type: [Number, null],
    default: null,
  },
  time: {
    type: [Number, null],
    default: null,
  },
})

const emit = defineEmits(['on-action', 'update:value'])

const modalTitle = computed(() => {
  return props.isFlexible ? '打卡设置' : '休息日'
})

const modalRef = ref<any>(null)
const dataList = ref({
  checkin_method_type: 1,
  offwork_interval_time: 5,
})
const typeText = ref('交替打卡多次')
const timeText = ref('5分钟')
const radioOptions = ref([
  {
    value: 0,
    label: '交替打卡1次',
    text: '打卡上班-下班-更新下班，以最早最晚打卡计算工作时长',
  },
  {
    value: 1,
    label: '交替打卡多次',
    text: '打卡上班-下班-上班，依次交替，以多次交替上下班打卡计算时长',
  },
])
const timesOptions = ref<any>([])
const maxMin = 23 * 60 + 55
for (let i = 0; i <= maxMin; i += 5) {
  let labelText = `${i}分钟`
  if (i > 60) {
    const hours = minutesToHours(i)
    const min = i - hoursToMinutes(hours)
    labelText = `${hours}小时${min}分钟`
  }
  timesOptions.value.push({
    value: i,
    label: labelText,
  })
}

function open() {
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

function submit() {
  const type = dataList.value.checkin_method_type
  typeText.value = Number(type) === 0 ? '交替打卡1次' : Number(type) === 1 ? '交替打卡多次' : '仅记录打卡时间和位置'
  const time = dataList.value.offwork_interval_time
  if (time > 60) {
    const hours = minutesToHours(time)
    const min = time - hoursToMinutes(hours)
    timeText.value = `${hours}小时${min}分钟`
  }
  else {
    timeText.value = `${time}分钟`
  }

  close()
  emit('on-action', dataList.value)
}

defineExpose({ open, close })
</script>

<template>
  <div class="flex items-center">
    <n-button @click="open">
      设置
    </n-button>
    <p class="alter-default-text ml-4">
      打卡交替方式：{{ typeText }}；打卡间隔时间：{{ timeText }}
    </p>
  </div>

  <SpModal
    ref="modalRef"
    :title="modalTitle"
    width="750"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="location-list w-full pb-4">
        <div class="list-wrapper mt-4 flex">
          <div class="items-text h-[34px] flex items-center">
            打卡交替方式
          </div>
          <div class="items-content">
            <n-radio-group v-model:value="dataList.checkin_method_type" name="radiogroup">
              <div class="flex flex-col">
                <div
                  v-for="item in radioOptions"
                  :key="item.value"
                  class="h-[34px] flex items-center gap-3"
                >
                  <n-radio :value="item.value">
                    {{ item.label }}
                  </n-radio>
                  <p class="alter-default-text">
                    {{ item.text }}
                  </p>
                </div>
              </div>
            </n-radio-group>
          </div>
        </div>
        <div class="list-wrapper mt-6 flex">
          <div class="items-text h-[34px] flex items-center">
            打卡间隔时间
          </div>
          <div class="items-content">
            <div class="h-[34px] w-full flex items-center">
              <p>每次上班打卡</p>
              <n-select
                v-model:value="dataList.offwork_interval_time"
                :options="timesOptions"
                clearable
                style="width: 150px; margin: 0 6px"
              />
              <p>后可打下班卡</p>
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
</style>
