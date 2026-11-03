<script lang="ts" setup>
import type { ModalInst } from '@/components/SpModal'
import { ref } from 'vue'
import api from '@/service/api/common'

const modalRef = ref<ModalInst | null>(null)
const listData = ref<any>([])

async function getListData(id: string) {
  const { isSuccess, data } = await api.log({ id })
  if (isSuccess) {
    listData.value = data
  }
}

async function open(params: any) {
  await getListData(params.id)

  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

defineExpose({ open, close })
</script>

<template>
  <!-- 日志列表弹窗 -->
  <SpModal ref="modalRef" width="900" height="680" title="流程处理日志" :show-ok="false" :show-cancel="false">
    <template #default>
      <n-timeline>
        <n-timeline-item
          v-for="item in listData"
          :key="item"
          type="info"
          :title="`${item.content} / ${item.user_name}`"
          :content="item.remark"
          :time="item.ctime"
        />
      </n-timeline>
    </template>
  </SpModal>
</template>
