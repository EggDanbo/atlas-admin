<script lang="ts" setup>
import { computed, ref, unref } from 'vue'

import { SpModal, useModal } from '@/components/SpModal'

import { useTableContext } from '../../hooks/useTableContext'

const loading = ref(false)
const table: any = useTableContext()
const formValue = ref<any>({})
const filter_express = ref<any>()
const filter_value = ref<any>()

const [modalRegister, advModal] = useModal({
  title: '高级查询',
  mask: false,
  maskClosable: true,
  lockView: true,
})

const advSearchRef = computed(() => {
  if (!table)
    return null
  return unref(table.advSearch)
})

function showModal(value: any) {
  filter_express.value = value.filter_express || null

  if (advSearchRef.value.componentCond.hasNumberType(value.type)) {
    filter_value.value = value.filter_value
  }
  else {
    filter_value.value = value.filter_value || null
  }
  formValue.value = value

  advModal.setProps({ title: `高级查询 - ${value.title}` })
  advModal.open()
}

function stopBubble(e?: Event) {
  if (e)
    e.cancelBubble = true
}

function updateCond(e: any) {
  if (e == null) {
    formValue.value.filter_value = null
  }
  updateSelect()
}

function updateSelect() {
  formValue.value.filter_express = filter_express.value
  formValue.value.filter_value = filter_value.value
  const filter = advSearchRef.value.update()
  const find = filter.find(q => q.column === formValue.value.column)
  if (find) {
    filter_express.value = find.express || null

    if (advSearchRef.value.componentCond.hasNumberType(formValue.value.type)) {
      filter_value.value = find.value
    }
    else {
      filter_value.value = find.value || null
    }
  }
}

function submit() {
  table.fetch({ page: 1 })
  advModal.close()
}

function closeModal() {
  advModal.close()
}

defineExpose({ showModal })
</script>

<template>
  <SpModal width="400" @register="modalRegister">
    <n-space :wrap="false">
      <n-select
        v-if="advSearchRef.componentCond.hasCondType(formValue.type)"
        v-model:value="filter_express"
        style="width: 100px"
        :options="advSearchRef.componentCond.getCondTypeList(formValue.type)"
        :consistent-menu-width="false"
        clearable
        @update:value="updateCond($event)"
      />

      <!-- 内容 -->
      <n-input
        v-if="advSearchRef.componentCond.hasTextType(formValue.type)"
        v-model:value="filter_value"
        type="text"
        clearable
        placeholder="筛选"
        @change="updateSelect()"
        @keyup="stopBubble"
        @keydown="stopBubble"
      />

      <n-input
        v-if="advSearchRef.componentCond.hasNumberType(formValue.type)"
        v-model:value="filter_value"
        clearable
        placeholder="筛选"
        @update:value="updateSelect()"
        @keyup="stopBubble"
        @keydown="stopBubble"
      />
    </n-space>

    <template #footer>
      <n-space justify="end">
        <n-button :loading="loading" :disabled="loading" type="primary" @click="submit">
          确定
        </n-button>
        <n-button @click="closeModal">
          关闭
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>
