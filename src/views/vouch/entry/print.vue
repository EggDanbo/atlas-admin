<script setup lang="ts">
import printJS from 'print-js'
import { content } from '@/service/api/basic'
import { entry as api } from '@/service/api/vouch'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const modalRef = ref<any>(null)
const btnLoading = ref(false)
const cardModalInfo = ref<any>({
  date: null,
  no_begin: null,
  no_end: null,
})

async function open() {
  await getLastDate()
  cardModalInfo.value.no_begin = null
  cardModalInfo.value.no_end = null

  modalRef.value.open()
}

function close() {
  modalRef.value.close()
}

async function submit() {
  if (!cardModalInfo.value.date) {
    toast.error('请选择会计期间')
    return
  }
  if (!cardModalInfo.value.no_begin) {
    toast.error('请输入起始号码')
    return
  }
  if (!cardModalInfo.value.no_end) {
    toast.error('请输入截止号码')
    return
  }

  btnLoading.value = true
  const { isSuccess, data } = await api.cards({ ...cardModalInfo.value }).finally(() => btnLoading.value = false)
  if (!isSuccess)
    return

  printJS({
    printable: data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })

  modalRef.value.close()
  emit('on-action', 'EDIT')
}

async function getLastDate() {
  const { isSuccess, data } = await content.getLast()
  if (!isSuccess)
    return
  cardModalInfo.value.date = Number(data)
}

defineExpose({ open, close })
</script>

<template>
  <SpModal ref="modalRef" title="凭证打印" width="600" :show-ok="false">
    <n-form label-placement="left" :label-width="100">
      <n-grid :cols="1" :x-gap="20">
        <n-form-item-gi label="会计期间">
          <n-date-picker
            v-model:value="cardModalInfo.date"
            type="month"
            :year-range="[2008, new Date().getFullYear() + 1]"
            class="w-full"
          />
        </n-form-item-gi>
        <n-form-item-gi label="起始号码">
          <n-input-number
            v-model:value="cardModalInfo.no_begin"
            :precision="0"
            :show-button="false"
            clearable
            class="w-full"
          />
        </n-form-item-gi>
        <n-form-item-gi label="截止号码">
          <n-input-number
            v-model:value="cardModalInfo.no_end"
            :precision="0"
            :show-button="false"
            clearable
            class="w-full"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button
          type="primary"
          :loading="btnLoading"
          @click="submit"
        >
          提交
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
