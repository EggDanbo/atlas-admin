<script lang="ts" setup>
const props = defineProps({
  value: {
    type: Object,
  },
})

const emit = defineEmits(['on-action', 'update:value'])

const reissueData = ref<any>({
  enable: true,
  stuck_miner: false,
  later: false,
  flex_off: false,
  exception: false,
  ot: false,
  limit_day: null,
  limit_total: null,
  limit_end: null,
  remind: null,
  remind_same_month: 0,
  remind_next_month: 0,
})
const remindValue = ref(0)
const remindDateValue = ref<any>(null)

const limitDayOptions = ref<any>([
  {
    value: 0,
    label: '无限制',
  },
])
for (let i = 1; i <= 180; i++) {
  limitDayOptions.value.push({
    value: Number(i),
    label: `过去${i}天内`,
  })
}

const limitTotalOptions = ref<any>([
  {
    value: 0,
    label: '无限制',
  },
])
for (let i = 1; i < 100; i++) {
  limitTotalOptions.value.push({
    value: Number(i),
    label: `${i}次`,
  })
}

const limitEndOptions = ref<any>([
  {
    value: 0,
    label: '不设置',
  },
])
for (let i = 1; i < 29; i++) {
  limitEndOptions.value.push({
    value: Number(i),
    label: `下月${i}日`,
  })
}

const remindOptions = ref<any>([
  {
    value: 1,
    label: '提醒',
  },
  {
    value: 0,
    label: '不提醒',
  },
])
const remindDateOptions = ref<any>([])
for (let i = 15; i < 31; i++) {
  remindDateOptions.value.push({
    value: `same-${Number(i)}`,
    label: `当月${i}日`,
  })
}
for (let i = 1; i < 31; i++) {
  remindDateOptions.value.push({
    value: `next-${Number(i)}`,
    label: `次月${i}日`,
  })
}

function handleCheckBoxChecked() {
  if (reissueData.value.enable) {
    initReissueData()
  }
  else {
    emit('update:value', { enable: false })
  }
}

function handleRemindSelected(e) {
  if (e) {
    reissueData.value.remind = true
    remindDateValue.value = 'same-15'
    reissueData.value.remind_same_month = 15
    reissueData.value.remind_next_month = 0
  }
  else {
    reissueData.value.remind = false
    remindDateValue.value = null
    reissueData.value.remind_same_month = 0
    reissueData.value.remind_next_month = 0
  }
}

function initReissueData() {
  reissueData.value.enable = true
  reissueData.value.stuck_miner = true
  reissueData.value.later = true
  reissueData.value.flex_off = true
  reissueData.value.exception = true
  reissueData.value.ot = true
  reissueData.value.limit_day = 0
  reissueData.value.limit_total = 0
  reissueData.value.limit_end = 0
  reissueData.value.remind = true
  reissueData.value.remind_same_month = 15
  reissueData.value.remind_next_month = 0
  remindValue.value = 1
  remindDateValue.value = 'same-15'
}

watch(
  () => props.value,
  (value) => {
    const nums = value ? Number(Object.keys(value).length) : 0
    if (nums > 0) {
      reissueData.value = value

      if (reissueData.value.remind) {
        remindValue.value = 1
        if (reissueData.value.remind_same_month) {
          remindDateValue.value = `same-${reissueData.value.remind_same_month}`
        }
        else if (reissueData.value.remind_next_month) {
          remindDateValue.value = `next-${reissueData.value.remind_next_month}`
        }
      }
      else {
        remindValue.value = 0
        remindDateValue.value = null
        reissueData.value.remind_same_month = 0
        reissueData.value.remind_next_month = 0
      }
    }
    else {
      initReissueData()
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  () => reissueData.value,
  (value) => {
    emit('update:value', value)
  },
  {
    immediate: false,
    deep: false,
  },
)
</script>

<template>
  <div class="w-full">
    <div class="h-[34px] flex items-center">
      <n-checkbox v-model:checked="reissueData.enable" @update:checked="handleCheckBoxChecked">
        开启
      </n-checkbox>
    </div>

    <div v-if="reissueData.enable" class="form-list-wrapper">
      <dl class="form-list-item">
        <dd class="label">
          补卡类型
        </dd>
        <dd class="item-content">
          <n-space>
            <n-checkbox v-model:checked="reissueData.stuck_miner">
              缺卡/旷工
            </n-checkbox>
            <n-checkbox v-model:checked="reissueData.later">
              迟到
            </n-checkbox>
            <n-checkbox v-model:checked="reissueData.flex_off">
              早退
            </n-checkbox>
            <n-checkbox v-model:checked="reissueData.exception">
              其他异常
            </n-checkbox>
            <n-checkbox v-model:checked="reissueData.ot">
              加班
            </n-checkbox>
          </n-space>
        </dd>
      </dl>
      <dl class="form-list-item">
        <dd class="label">
          允许补卡时间限制
        </dd>
        <dd class="item-content">
          <n-select
            v-model:value="reissueData.limit_day"
            :options="limitDayOptions"
            style="width: 150px"
          />
        </dd>
      </dl>
      <dl class="form-list-item">
        <dd class="label">
          每月允许补卡次数
        </dd>
        <dd class="item-content">
          <n-select
            v-model:value="reissueData.limit_total"
            :options="limitTotalOptions"
            style="width: 150px"
          />
        </dd>
      </dl>
      <dl class="form-list-item">
        <dd class="label">
          每月补卡截止日期
        </dd>
        <dd class="item-content">
          <n-select
            v-model:value="reissueData.limit_end"
            :options="limitEndOptions"
            style="width: 150px"
          />
        </dd>
      </dl>
      <dl class="form-list-item">
        <dd class="label">
          补卡提醒
        </dd>
        <dd class="item-content">
          <n-space>
            <n-select
              v-model:value="remindValue"
              :options="remindOptions"
              style="width: 150px"
              @update:value="handleRemindSelected"
            />
          </n-space>
        </dd>
      </dl>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-list-wrapper {
  box-sizing: border-box;
  padding: 16px;
  background-color: rgba(5, 14, 26, 0.03);
  border: 1px solid rgba(6, 15, 26, 0.1);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  dl {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    dd {
      &.label {
        display: flex;
        align-items: center;
        width: 114px;
        height: 34px;
      }
      &.item-content {
        display: flex;
        align-items: center;
        width: calc(100% - 114px - 16px);
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .form-list-wrapper {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
