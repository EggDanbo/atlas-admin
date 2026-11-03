<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { getDateShortcuts } from '@/utils/dateUtil'

import { AdvInputProps } from './AdvInputProps'

const props = defineProps({
  ...AdvInputProps,
})

const emit = defineEmits(['change', 'show', 'search', 'selectChange', 'inputChange', 'inputEntryChange', 'pickChange'])

const dateShortcuts = getDateShortcuts()

const advSearchRef = computed(() => {
  return props.advSearch
})

const formValue = ref(props.value)

// 双向同步 floatingOption.data 和 formValue.filter_value
watch(() => props.floatingOption?.data, (val) => {
  if (val !== undefined && val !== formValue.value.filter_value) {
    formValue.value.filter_value = val
  }
})

watch(() => formValue.value.filter_value, (val) => {
  if (props.floatingOption && props.floatingOption.data !== val) {
    // VXE Table 浮动筛选需要直接修改 option.data
    // eslint-disable-next-line vue/no-mutating-props
    props.floatingOption.data = val
  }
})

function stopBubble(e?: Event) {
  if (e)
    e.cancelBubble = true
}

function handleShow(e) {
  if (e) {
    e.target.blur()
  }
  emit('show', formValue.value)
}

function selectChange() {
  advSearchRef.value.update()
  emit('selectChange')
}

function inputChange() {
  advSearchRef.value.update()
  emit('inputChange')
}

function inputEntryChange() {
  advSearchRef.value.update()
  emit('inputEntryChange')
}

function pickChange() {
  advSearchRef.value.update()
  emit('pickChange')
}

function clear() {
  formValue.value.filter_value = null
  advSearchRef.value.update()
  emit('inputEntryChange')
}
</script>

<template>
  <!-- 内容 -->
  <n-select
    v-if="formValue.type === 'bool'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondBool(formValue)"
    placeholder="筛选"
    max-tag-count="responsive"
    :consistent-menu-width="false"
    clearable
    @update:value="selectChange()"
  />

  <n-select
    v-if="formValue.type === 'textlist'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondList(formValue, false)"
    placeholder="筛选"
    max-tag-count="responsive"
    :consistent-menu-width="false"
    multiple
    clearable
    @update:value="selectChange()"
  />

  <n-select
    v-if="formValue.type === 'textlistinvalue'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondListInValue(formValue)"
    placeholder=""
    max-tag-count="responsive"
    :consistent-menu-width="false"
    multiple
    clearable
    @update:value="selectChange()"
  />

  <n-select
    v-if="formValue.type === 'numberlist'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondList(formValue, true)"
    placeholder=""
    max-tag-count="responsive"
    multiple
    clearable
    @update:value="selectChange()"
  />

  <n-select
    v-if="formValue.type === 'enums'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondListInValue(formValue)"
    placeholder=""
    max-tag-count="responsive"
    :consistent-menu-width="false"
    multiple
    clearable
    @update:value="selectChange()"
  />

  <n-select
    v-if="formValue.type === 'numberlistinvalue'"
    v-model:value="formValue.filter_value"
    :options="advSearchRef.componentCond.getCondListInValue(formValue)"
    placeholder=""
    max-tag-count="responsive"
    :consistent-menu-width="false"
    multiple
    clearable
    @update:value="selectChange()"
  />

  <n-date-picker
    v-if="formValue.type === 'timestamp'"
    v-model:value="formValue.filter_value"
    :type="advSearchRef.componentCond.getDateType(formValue)"
    :shortcuts="dateShortcuts"
    fast-month-select
    clearable
    @update:value="pickChange()"
  />

  <n-input
    v-if="advSearchRef.componentCond.hasTextType(formValue.type)"
    v-model:value="formValue.filter_value"
    type="text"
    clearable
    placeholder=""
    @update:value="inputChange()"
    @keyup.enter.stop="inputEntryChange()"
    @dblclick.stop="handleShow"
    @clear="clear()"
    @keyup="stopBubble"
    @keydown="stopBubble"
  />

  <n-input
    v-if="advSearchRef.componentCond.hasNumberType(formValue.type)"
    v-model:value="formValue.filter_value"
    clearable
    placeholder=""
    @clear="clear()"
    @update:value="inputChange()"
    @keyup.enter.stop="inputEntryChange()"
    @dblclick.stop="handleShow"
    @keyup="stopBubble"
    @keydown="stopBubble"
  />
</template>
