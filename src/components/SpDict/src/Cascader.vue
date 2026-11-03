<script lang="ts" setup>
import type { CascaderOption } from 'naive-ui'

import { omit } from 'lodash-es'
import { computed, onMounted, ref, useAttrs, watch } from 'vue'
import { dictionary } from '@/service/api/system'
import { isArray, isString } from '@/utils/is'

import { CascaderProps } from './props'

const props = defineProps({
  ...CascaderProps,
})

const emit = defineEmits(['update:text'])

const attrs = useAttrs()
const currentValue = ref<Array<string> | string | null>()
const cascaderData = ref<any>([])
let currentText: Array<string> | string = '' // 当前显示的内容

const getBindValues = computed(() => {
  const propsData: Recordable = {
    ...attrs,
    ...omit(props, 'data'),
  }
  return propsData
})

watch(
  () => props.name,
  (name) => {
    if (!props.data)
      fetch(name)
  },
)

watch(
  () => props.data,
  (data: Recordable[]) => {
    cascaderData.value = data
    parse(props.text)
  },
)

watch(
  () => props.text,
  (newVal) => {
    if (!newVal) {
      currentText = ''
      currentValue.value = null
      return
    }

    if (props.multiple) {
      if (isArray(newVal)) {
        if (currentText.length === newVal.length)
          return
        for (let i = 0; i < newVal.length; i++) {
          if (currentText[i] !== newVal[i]) {
            parse(newVal)
            return
          }
        }
      }
    }
    else {
      if (currentText !== newVal) {
        parse(newVal)
      }
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

async function fetch(name: string, text?: string) {
  const { isSuccess, data } = await dictionary.getList(name)
  if (isSuccess) {
    cascaderData.value = data
    parse(text)
  }
}

function updataValue(node: string, _option: CascaderOption, path: CascaderOption[]) {
  if (props.multiple) {
    const values: string[] = []
    if (path && path.length > 0) {
      for (const [i, item] of path.entries()) {
        if (isArray(item)) {
          if (item.length > 0) {
            values.push(item.map(m => m.label).join(props.separator))
          }
          else {
            // 数据源已没有这个的旧值，进行保留
            values.push(node[i]!)
          }
        }
      }
    }
    currentText = values
  }
  else {
    if (path && path.length > 0) {
      currentText = path.map(m => m.label).join(props.separator)
    }
    else {
      currentText = ''
    }
  }
  emit('update:text', currentText)
}

function parse(value?: Array<string> | string) {
  if (!value) {
    return
  }

  if (props.multiple) {
    const values: string[] = []
    if (isString(value)) {
      // 尝试分隔逗号获取多个
      for (const item of value.split(',')) {
        values.push(parseText(item))
      }
    }
    else if (isArray(value)) {
      for (const item of value) {
        values.push(parseText(item))
      }
    }
    currentValue.value = values
  }
  else {
    if (isString(value)) {
      currentValue.value = parseText(value)
    }
  }
}

function parseText(text?: string): string {
  if (!text) {
    return text || ''
  }

  // 分隔后每个索引作为层级，然后递归查询是否完整匹配
  const segments = text.split(props.separator)
  let data = cascaderData.value
  if (data.length === 0)
    return text
  for (let i = 0; i < segments.length; i++) {
    const item = data.find(q => q.label === segments[i])
    if (!item)
      break
    if (i === segments.length - 1) {
      return item.value
    }
    else {
      if (!item.children)
        break
      data = item.children
    }
  }
  return text
}

if (props.data) {
  onMounted(() => {
    cascaderData.value = props.data
    parse(props.text)
  })
}
else {
  if (props.name)
    fetch(props.name, props.text)
}
</script>

<template>
  <n-cascader
    v-bind="getBindValues"
    v-model:value="currentValue"
    :options="cascaderData"
    expand-trigger="hover"
    @update:value="updataValue"
  />
</template>
