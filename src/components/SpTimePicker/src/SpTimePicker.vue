<script setup lang="ts">
import type { TablePickerOption } from 'naive-ui'

const props = withDefaults(defineProps<{
  modelValue: number | null | undefined
  min?: number
  max?: number
  clearable?: boolean
  disabled?: boolean
}>(), {
  min: 0,
  clearable: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'change': any
}>()

// max 默认为 min + 86399（24小时范围）
const effectiveMax = computed(() => props.max ?? props.min + 86_399)

function formatHourLabel(h: number): string {
  if (h < 0)
    return `昨日${(24 + h).toString().padStart(2, '0')}`
  const displayH = h >= 24 ? h - 24 : h
  return `${h >= 24 ? '次日' : ''}${displayH.toString().padStart(2, '0')}`
}

function buildMinuteRange(minM: number, maxM: number): TablePickerOption[] {
  const opts: TablePickerOption[] = []
  for (let m = minM; m <= maxM; m++) {
    opts.push({ label: m.toString().padStart(2, '0'), value: m })
  }
  return opts
}

const hourOptions = computed(() => {
  const minH = Math.floor(props.min / 3600)
  const maxH = Math.floor(effectiveMax.value / 3600)
  const opts: TablePickerOption[] = []
  for (let h = minH; h <= maxH; h++) {
    opts.push({ label: formatHourLabel(h), value: h })
  }
  return opts
})

const minuteOptions = computed(() => {
  const h = selectedHour.value
  if (h == null)
    return buildMinuteRange(0, 59)

  const minH = Math.floor(props.min / 3600)
  const maxH = Math.floor(effectiveMax.value / 3600)
  const minM = h === minH ? Math.floor((props.min % 3600) / 60) : 0
  const maxM = h === maxH ? Math.floor((effectiveMax.value % 3600) / 60) : 59
  return buildMinuteRange(minM, maxM)
})

const selectedHour = computed({
  get: () => props.modelValue != null ? Math.floor(props.modelValue / 3600) : null,
  set: (h: number | null) => {
    if (h == null) {
      emit('update:modelValue', null)
      return
    }
    emit('update:modelValue', h * 3600 + (selectedMinute.value ?? 0) * 60)
  },
})

const selectedMinute = computed({
  get: () => props.modelValue != null ? Math.floor((props.modelValue % 3600) / 60) : null,
  set: (m: number | null) => {
    emit('update:modelValue', (selectedHour.value ?? 0) * 3600 + (m ?? 0) * 60)
  },
})

// min 变化时，如果当前值超出新范围则清空
watch(() => props.min, () => {
  if (props.modelValue != null && props.modelValue < props.min) {
    emit('update:modelValue', null)
  }
})

function handleUpdate() {
  emit('change')
}
</script>

<script lang="ts">
export default { name: 'SpTimePicker' }
</script>

<template>
  <n-input-group class="w-full">
    <n-select
      v-model:value="selectedHour"
      :options="hourOptions"
      placeholder="时"
      :disabled="disabled"
      :clearable="clearable"
      :consistent-menu-width="false"
      @update:value="handleUpdate"
    />
    <n-input-group-label>:</n-input-group-label>
    <n-select
      v-model:value="selectedMinute"
      :options="minuteOptions"
      placeholder="分"
      :disabled="disabled"
      :clearable="clearable"
      :consistent-menu-width="false"
      @update:value="handleUpdate"
    />
  </n-input-group>
</template>
