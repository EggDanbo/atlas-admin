<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * 生效时间选择器
 *
 * 四种情况互斥，但「选日期」还要再选一天，塞进一个下拉里会变成
 * 「下拉里套日期弹层」，点起来别扭。这里统一收进一个弹窗：
 * 触发框只显示结果，点开才做选择。
 */
type EffectiveMode = '立即生效' | '明日生效' | '指定日期' | '暂不生效'

const props = withDefaults(defineProps<{
  /** 生效状态 */
  mode?: string
  /** 指定日期生效时的日期（YYYY-MM-DD） */
  date?: string
  /** 只读（详情模式） */
  readonly?: boolean
}>(), {
  mode: '立即生效',
  date: '',
  readonly: false,
})

const emit = defineEmits<{
  'update:mode': [value: EffectiveMode]
  'update:date': [value: string]
}>()

const show = ref(false)
const draftMode = ref<EffectiveMode>('立即生效')
const draftDate = ref<number | null>(null)

const OPTIONS: Array<{ value: EffectiveMode, hint: string }> = [
  { value: '立即生效', hint: '保存后马上按新规则执行' },
  { value: '明日生效', hint: '明天 0 点起切换，今天仍按旧规则' },
  { value: '指定日期', hint: '选一个未来的日期开始执行' },
  { value: '暂不生效', hint: '先存下来，之后手动启用' },
]

/** 'YYYY-MM-DD' → 时间戳（按本地零点，避免时区把日期拨到前一天） */
function toTimestamp(value?: string) {
  if (!value)
    return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day)
    return null
  return new Date(year, month - 1, day).getTime()
}

function toDateString(timestamp: number | null) {
  if (!timestamp)
    return ''
  const date = new Date(timestamp)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function tomorrow() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 1)
  return date.getTime()
}

const displayText = computed(() => {
  if (props.mode === '指定日期')
    return props.date ? `${props.date} 生效` : '选择生效日期'
  if (props.mode === '明日生效' && props.date)
    return `明日生效 · ${props.date.slice(5)}`
  return props.mode || '立即生效'
})

const muted = computed(() => props.mode === '暂不生效')

watch(show, (visible) => {
  if (!visible)
    return
  draftMode.value = (props.mode as EffectiveMode) || '立即生效'
  draftDate.value = toTimestamp(props.date) ?? (draftMode.value === '指定日期' ? tomorrow() : tomorrow())
})

/** 选中「指定日期」但还没选日子时，默认明天，避免确定后是空的 */
watch(draftMode, (value) => {
  if (value === '指定日期' && !draftDate.value)
    draftDate.value = tomorrow()
})

function confirm() {
  emit('update:mode', draftMode.value)
  if (draftMode.value === '立即生效') {
    emit('update:date', toDateString(Date.now()))
  }
  else if (draftMode.value === '明日生效') {
    emit('update:date', toDateString(tomorrow()))
  }
  else if (draftMode.value === '指定日期') {
    emit('update:date', toDateString(draftDate.value ?? tomorrow()))
  }
  else {
    emit('update:date', '')
  }
  show.value = false
}
</script>

<template>
  <div class="eff" :class="{ 'eff--readonly': readonly, 'eff--muted': muted }" @click="!readonly && (show = true)">
    <n-icon :size="15" class="eff__icon">
      <Icon icon="ant-design:calendar-outlined" />
    </n-icon>
    <span class="eff__text">{{ displayText }}</span>
    <n-icon v-if="!readonly" :size="13" class="eff__arrow">
      <Icon icon="ant-design:down-outlined" />
    </n-icon>
  </div>

  <n-modal v-model:show="show" preset="card" title="生效时间" class="eff-modal" :style="{ width: '440px' }">
    <n-radio-group v-model:value="draftMode" class="eff-modal__group">
      <n-space vertical :size="4">
        <label
          v-for="item in OPTIONS"
          :key="item.value"
          class="eff-option"
          :class="{ 'is-active': draftMode === item.value }"
        >
          <n-radio :value="item.value" />
          <span class="eff-option__body">
            <span class="eff-option__title">{{ item.value }}</span>
            <span class="eff-option__hint">{{ item.hint }}</span>
          </span>
        </label>
      </n-space>
    </n-radio-group>

    <div v-if="draftMode === '指定日期'" class="eff-modal__date">
      <n-date-picker
        v-model:value="draftDate"
        type="date"
        class="w-full"
        :is-date-disabled="(timestamp: number) => timestamp < new Date().setHours(0, 0, 0, 0)"
        placeholder="选择生效日期"
      />
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="show = false">
          取消
        </n-button>
        <n-button type="primary" @click="confirm">
          确定
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="less" scoped>
.eff {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--atlas-border-strong);
  border-radius: var(--atlas-radius-sm);
  background: var(--atlas-surface);
  color: var(--atlas-text);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color var(--atlas-duration) var(--atlas-ease),
    background var(--atlas-duration) var(--atlas-ease);

  &:hover {
    border-color: var(--atlas-brand);
  }

  &__icon {
    color: var(--atlas-text-tertiary);
    flex: none;
  }

  &__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    color: var(--atlas-text-tertiary);
    flex: none;
  }

  &--readonly {
    border-color: transparent;
    background: transparent;
    padding-left: 0;
    cursor: default;
  }

  &--muted &__text {
    color: var(--atlas-text-tertiary);
  }
}

.eff-modal {
  &__group {
    display: block;
  }

  &__date {
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px solid var(--atlas-divider);
  }
}

.eff-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--atlas-border);
  border-radius: var(--atlas-radius-sm);
  cursor: pointer;
  transition:
    border-color var(--atlas-duration) var(--atlas-ease),
    background var(--atlas-duration) var(--atlas-ease);

  &:hover {
    background: var(--atlas-surface-hover);
  }

  &.is-active {
    border-color: var(--atlas-brand);
    background: var(--atlas-brand-soft);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 13px;
    color: var(--atlas-text);
  }

  &__hint {
    font-size: 12px;
    color: var(--atlas-text-tertiary);
  }
}
</style>
