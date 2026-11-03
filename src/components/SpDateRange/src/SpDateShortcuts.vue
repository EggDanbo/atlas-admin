<script lang="ts" setup>
import type { ShortcutItem } from './types'
import { spDateShortcutsProps } from './props'

const props = defineProps(spDateShortcutsProps)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [item: ShortcutItem]
  'clear': []
}>()

function handleClick(item: ShortcutItem) {
  if (props.modelValue === item.key) {
    // 取消选中
    emit('update:modelValue', '')
    emit('clear')
  }
  else {
    emit('update:modelValue', item.key)
    emit('select', item)
  }
}
</script>

<script lang="ts">
export default { name: 'SpDateShortcuts' }
</script>

<template>
  <n-flex :size="4" align="center">
    <n-button
      v-for="item in shortcuts"
      :key="item.key"
      :size="size"
      :type="modelValue === item.key ? 'primary' : 'default'"
      @click="handleClick(item)"
    >
      {{ item.label }}
    </n-button>
  </n-flex>
</template>
