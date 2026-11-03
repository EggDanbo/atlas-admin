<script lang="ts" setup>
import { computed, ref, useAttrs, watch } from 'vue'
import { dictionary } from '@/service/api/system'
import { forEach } from '@/utils/helper/treeHelper'
import { SelectProps } from './props'

const props = defineProps({
  ...SelectProps,
})
const attrs = useAttrs()
const options = ref<Recordable[]>([])

const getBindValues = computed(() => {
  // reloadOnOpen 为 SpDict 内部控制属性，不透传给 n-select
  const { reloadOnOpen, ...rest } = props
  return {
    ...attrs,
    ...rest,
  }
})

watch(
  () => props.name,
  (name) => {
    fetch(name)
  },
  {
    immediate: true,
  },
)

// 下拉展开时重新加载字典（由 reloadOnOpen 控制）
function handleUpdateShow(show: boolean) {
  if (show && props.reloadOnOpen) {
    fetch(props.name)
  }
}

async function fetch(name: string) {
  if (!name)
    return
  const { isSuccess, data } = await dictionary.getList(name)
  if (isSuccess) {
    forEach(data, (item) => {
      // 将value改为label使用
      item.value = item.label
      if (item.child) {
        item.type = 'group'
      }
    })
    const list = data
    options.value = list.map((q) => {
      return {
        label: q.label,
        value: q.label,
      }
    })
  }
}

function reload() {
  return fetch(props.name)
}

defineExpose({
  reload,
})
</script>

<template>
  <n-select
    v-bind="getBindValues"
    :options="options"
    :consistent-menu-width="false"
    @update:show="handleUpdateShow"
  />
</template>
