<script lang="ts" setup>
import { TransitionPresets, useTransition } from '@vueuse/core'
import { isNumber } from 'lodash-es'
import { computed, onMounted, ref, unref, watch, watchEffect } from 'vue'

const props = defineProps({
  startVal: { type: Number, default: 0 },
  endVal: { type: Number, default: 2021 },
  duration: { type: Number, default: 1500 },
  autoplay: { type: Boolean, default: true },
  decimals: {
    type: Number,
    default: 0,
    validator(value: number) {
      return value >= 0
    },
  },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  separator: { type: String, default: ',' },
  decimal: { type: String, default: '.' },
  /**
   * font color
   */
  color: { type: String },
  /**
   * Turn on digital animation
   */
  useEasing: { type: Boolean, default: true },
  /**
   * Digital animation
   */
  transition: { type: String, default: 'linear' },
})

const emit = defineEmits(['onStarted', 'onFinished'])

// 静态正则表达式 - 用于数字格式化
const DIGIT_GROUP_REGEX = /(\d+)(\d{3})/

const source = ref(props.startVal)
const disabled = ref(false)
let outputValue = useTransition(source)

const value = computed(() => formatNumber(unref(outputValue)))

watchEffect(() => {
  source.value = props.startVal
})

watch([() => props.startVal, () => props.endVal], () => {
  if (props.autoplay) {
    start()
  }
})

onMounted(() => {
  props.autoplay && start()
})

function start() {
  run()
  source.value = props.endVal
}

function reset() {
  source.value = props.startVal
  run()
}

function run() {
  outputValue = useTransition(source, {
    disabled,
    duration: props.duration,
    onFinished: () => emit('onFinished'),
    onStarted: () => emit('onStarted'),
    ...(props.useEasing ? { transition: TransitionPresets[props.transition] } : {}),
  })
}

function formatNumber(num: number | string) {
  if (!num) {
    return ''
  }
  const { decimals, decimal, separator, suffix, prefix } = props
  num = Number(num).toFixed(decimals)
  num += ''

  const x = num.split('.')
  let x1 = x[0]
  const x2 = x.length > 1 ? decimal + x[1] : ''

  if (separator && !isNumber(separator)) {
    while (DIGIT_GROUP_REGEX.test(x1)) {
      x1 = x1.replace(DIGIT_GROUP_REGEX, `$1${separator}$2`)
    }
  }
  return (
    (prefix ? `<span class="prefix">${prefix}</span>` : '')
    + x1
    + x2
    + (suffix ? `<span class="suffix">${suffix}</span>` : '')
  )
}

defineExpose({
  reset,
})
</script>

<template>
  <span :style="{ color }">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-html="value" />
  </span>
</template>
