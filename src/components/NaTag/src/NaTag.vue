<script lang="ts" setup>
import type { TagOptions } from './props'
import { isObject, isUndefined, omit } from 'lodash-es'
import { NFlex, NTag } from 'naive-ui'
import { useAttrs, useId } from 'vue'
import { basicProps } from './props'

const props = defineProps({
  ...basicProps,
})

const emits = defineEmits<{
  (e: 'close', event: MouseEvent, item: TagOptions, index: number): void
  (e: 'update:checked', value: boolean, item: TagOptions, index: number): void
  (e: 'click', item: TagOptions, index: number): void
}>()

const id = useId()

const attrs = useAttrs()

function getClosable(item: TagOptions) {
  return isUndefined(item.closable) ? item.closable : props.closable
}

function filterItemProps(item: TagOptions) {
  return omit({ ...props, ...attrs, ...item }, ['prefix', 'suffix', 'icon', 'closable', 'type', 'key', 'checked', 'checkable', 'onUpdate:checked'])
}

function handleClose(e: MouseEvent, item: TagOptions, index: number) {
  emits('close', e, item, index)
}

function handleChecked(value: boolean, item: TagOptions, index: number) {
  emits('update:checked', value, item, index)
}

function handleClick(item: TagOptions, index: number) {
  emits('click', item, index)
}
</script>

<template>
  <NFlex>
    <component
      :is="NTag"
      v-for="(item, index) in options"
      :key="`${index}_${id}`"
      :checkable="checkable || item.checkable"
      :checked="item.checked"
      :class="{ 'cursor-pointer': props.click }"
      :closable="getClosable(item)"
      :type="item.type ?? type"
      class="flex items-center"
      v-bind="filterItemProps(item)"
      @click="handleClick(item, index)"
      @close="(e) => handleClose(e, item, index)"
      @update:checked="(e) => handleChecked(e, item, index)"
    >
      <div class="flex items-center">
        <template v-if="item.prefix">
          <component :is="item.prefix" />
        </template>
        <template v-if="item.icon">
          <component :is="item.icon" />
        </template>
        <component :is="item.label" v-if="isObject(item.label)" />
        <template v-else>
          {{ item.label }}
        </template>
        <template v-if="item.suffix">
          <component :is="item.suffix" />
        </template>
      </div>
    </component>
  </NFlex>
</template>
