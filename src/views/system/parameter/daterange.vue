<script lang="ts" setup>
import type { FormRules } from 'naive-ui'
import type { DateRangeValue } from '@/components/SpDateRange'
import { addDays, subMonths } from 'date-fns'
import { SpDateRange } from '@/components/SpDateRange'

// ─── 场景 1：纯日期模式 ───

const dateValue1 = ref<DateRangeValue>()
const dateValue1Eod = ref<DateRangeValue>()

// ─── 场景 2：datetime 模式 ───

const datetimeValue = ref<DateRangeValue>()
const datetimeHmmValue = ref<DateRangeValue>()
const datetime10to20Value = ref<DateRangeValue>()

// ─── 场景 3：月份选择模式 ───

const monthValue1 = ref<DateRangeValue>()
const monthValue1Eod = ref<DateRangeValue>()

// ─── 场景 4：年份选择模式 ───

const yearValue1 = ref<DateRangeValue>()
const yearValue1Eod = ref<DateRangeValue>()

// ─── 场景 5：快捷选择 ───

const shortcutValue = ref<DateRangeValue>()

// ─── 场景 6：范围约束 ───

const constrainedValue = ref<DateRangeValue>()
const minTs = subMonths(new Date(), 6).getTime()
const maxTs = addDays(new Date(), 30).getTime()

const workHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

// ─── 场景 7：表单集成 ───

const formValue = ref<DateRangeValue>()
const formDatetimeValue = ref<DateRangeValue>()
const formRef = ref()

const formRules: FormRules = {
  formValue: {
    required: true,
    trigger: ['change', 'blur'],
    validator(_rule, value: DateRangeValue) {
      if (!value || value[0] == null || value[1] == null)
        return new Error('请选择完整的日期范围')
      return true
    },
  },
  formDatetimeValue: {
    required: true,
    trigger: ['change', 'blur'],
    validator(_rule, value: DateRangeValue) {
      if (!value || value[0] == null || value[1] == null)
        return new Error('请选择完整的预约时段')
      return true
    },
  },
}

function handleFormSubmit() {
  formRef.value?.validate((errors: any) => {
    if (!errors)
      window.$message?.success('验证通过')
  })
}

/** 格式化时间戳显示 */
function formatTs(ts: number | string | null | undefined): string {
  if (ts == null)
    return 'null'
  const n = typeof ts === 'string' ? Number(ts) : ts
  if (Number.isNaN(n))
    return 'NaN'
  return new Date(n).toLocaleString('zh-CN')
}
</script>

<template>
  <n-card :bordered="false">
    <n-flex vertical :size="24">
      <!-- 场景 1：纯日期模式 -->
      <n-card title="1. 纯日期模式" size="small" embedded>
        <n-flex vertical :size="16">
          <n-flex vertical>
            <n-text depth="3">
              基本用法（endOfDay=true，结束为 23:59:59）
            </n-text>
            <SpDateRange v-model="dateValue1" type="date" />
            <n-text code>
              值: {{ formatTs(dateValue1?.[0]) }} ~ {{ formatTs(dateValue1?.[1]) }}
            </n-text>
          </n-flex>

          <n-flex vertical>
            <n-text depth="3">
              endOfDay=false（始终输出次日 00:00:00，用于后端 >= start AND &lt; end 左闭右开查询）
            </n-text>
            <SpDateRange v-model="dateValue1Eod" type="date" :end-of-day="false" />
            <n-text code>
              值: {{ formatTs(dateValue1Eod?.[0]) }} ~ {{ formatTs(dateValue1Eod?.[1]) }}
            </n-text>
          </n-flex>
        </n-flex>
      </n-card>

      <!-- 场景 2：datetime 模式 -->
      <n-card title="2. 日期 + 时间模式" size="small" embedded>
        <n-flex vertical :size="16">
          <n-flex vertical>
            <n-text depth="3">
              默认格式 HH:mm:ss
            </n-text>
            <SpDateRange v-model="datetimeValue" type="datetime" />
            <n-text code>
              值: {{ formatTs(datetimeValue?.[0]) }} ~ {{ formatTs(datetimeValue?.[1]) }}
            </n-text>
          </n-flex>
          <n-flex vertical>
            <n-text depth="3">
              自定义格式 HH:mm（只到分钟）
            </n-text>
            <SpDateRange v-model="datetimeHmmValue" type="datetime" time-format="HH:mm" />
            <n-text code>
              值: {{ formatTs(datetimeHmmValue?.[0]) }} ~ {{ formatTs(datetimeHmmValue?.[1]) }}
            </n-text>
          </n-flex>
          <n-flex vertical>
            <n-text depth="3">
              时间约束 10:00~20:00（time-hours 限制可选小时）
            </n-text>
            <SpDateRange
              v-model="datetime10to20Value"
              type="datetime"
              time-format="HH:mm"
              :time-hours="[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]"
            />
            <n-text code>
              值: {{ formatTs(datetime10to20Value?.[0]) }} ~ {{ formatTs(datetime10to20Value?.[1]) }}
            </n-text>
          </n-flex>
        </n-flex>
      </n-card>

      <!-- 场景 3：月份选择模式 -->
      <n-card title="3. 月份选择模式" size="small" embedded>
        <n-flex vertical :size="16">
          <n-flex vertical>
            <n-text depth="3">
              月份范围（endOfDay=true，结束为当月最后一天 23:59:59）
            </n-text>
            <SpDateRange v-model="monthValue1" type="month" />
            <n-text code>
              值: {{ formatTs(monthValue1?.[0]) }} ~ {{ formatTs(monthValue1?.[1]) }}
            </n-text>
          </n-flex>

          <n-flex vertical>
            <n-text depth="3">
              endOfDay=false（始终输出次月 1 日 00:00:00，用于 &lt; end 左闭右开查询）
            </n-text>
            <SpDateRange v-model="monthValue1Eod" type="month" :end-of-day="false" />
            <n-text code>
              值: {{ formatTs(monthValue1Eod?.[0]) }} ~ {{ formatTs(monthValue1Eod?.[1]) }}
            </n-text>
          </n-flex>
        </n-flex>
      </n-card>

      <!-- 场景 4：年份选择模式 -->
      <n-card title="4. 年份选择模式" size="small" embedded>
        <n-flex vertical :size="16">
          <n-flex vertical>
            <n-text depth="3">
              年份范围（endOfDay=true，结束为当年最后一天 23:59:59）
            </n-text>
            <SpDateRange v-model="yearValue1" type="year" />
            <n-text code>
              值: {{ formatTs(yearValue1?.[0]) }} ~ {{ formatTs(yearValue1?.[1]) }}
            </n-text>
          </n-flex>

          <n-flex vertical>
            <n-text depth="3">
              endOfDay=false（始终输出次年 1 月 1 日 00:00:00，用于 &lt; end 左闭右开查询）
            </n-text>
            <SpDateRange v-model="yearValue1Eod" type="year" :end-of-day="false" />
            <n-text code>
              值: {{ formatTs(yearValue1Eod?.[0]) }} ~ {{ formatTs(yearValue1Eod?.[1]) }}
            </n-text>
          </n-flex>
        </n-flex>
      </n-card>

      <!-- 场景 5：快捷选择（箭头悬浮触发） -->
      <n-card title="5. 快捷选择" size="small" embedded>
        <n-flex vertical>
          <n-text depth="3">
            传入 shortcuts prop 后，箭头图标悬浮显示快捷面板
          </n-text>
          <SpDateRange v-model="shortcutValue" type="date" />
          <n-text code>
            值: {{ formatTs(shortcutValue?.[0]) }} ~ {{ formatTs(shortcutValue?.[1]) }}
          </n-text>
        </n-flex>
      </n-card>

      <!-- 场景 6：范围约束 -->
      <n-card title="6. 范围约束" size="small" embedded>
        <n-flex vertical :size="16">
          <n-text depth="3">
            min=半年前, max=30天后, enforceOrder=true, 工作时间 8:00~18:00
          </n-text>
          <SpDateRange
            v-model="constrainedValue"
            type="datetime"
            :min="minTs"
            :max="maxTs"
            enforce-order
            :time-hours="workHours"
          />
          <n-text code>
            值: {{ formatTs(constrainedValue?.[0]) }} ~ {{ formatTs(constrainedValue?.[1]) }}
          </n-text>
        </n-flex>
      </n-card>

      <!-- 场景 7：表单集成 -->
      <n-card title="7. 表单集成（含验证）" size="small" embedded>
        <n-form
          ref="formRef"
          label-placement="left"
          :label-width="100"
          :model="{ formValue, formDatetimeValue }"
          :rules="formRules"
        >
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="24" label="有效期限" path="formValue">
              <SpDateRange v-model="formValue" type="date" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="预约时段" path="formDatetimeValue">
              <SpDateRange v-model="formDatetimeValue" type="datetime" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="备注">
              <n-input placeholder="其他字段正常排列" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="状态">
              <n-select placeholder="不受影响" />
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <n-button type="primary" @click="handleFormSubmit">
          验证表单
        </n-button>
        <n-flex vertical>
          <n-text code>
            有效期限: {{ formatTs(formValue?.[0]) }} ~ {{ formatTs(formValue?.[1]) }}
          </n-text>
          <n-text code>
            预约时段: {{ formatTs(formDatetimeValue?.[0]) }} ~ {{ formatTs(formDatetimeValue?.[1]) }}
          </n-text>
        </n-flex>
      </n-card>
    </n-flex>
  </n-card>
</template>
