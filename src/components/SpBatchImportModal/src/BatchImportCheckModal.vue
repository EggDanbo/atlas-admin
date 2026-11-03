<script lang="ts" setup>
import { batchImportCheckModalProps } from './props'

const props = defineProps({ ...batchImportCheckModalProps })

const btnLoading = ref(false)

const modalRef = ref<any>(null)

function open() {
  modalRef.value?.open()
}

function close() {
  btnLoading.value = false
  modalRef.value?.close()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="下载导入检查文件"
    width="452"
    :mask="true"
    :draggable="true"
    :show-ok="false"
  >
    <template #default>
      <div style="font-size: 16px; text-align: center; padding: 15px 0;">
        {{ props.checkFileMessage || '导入失败，请下载导入检查文件处理后重新导入。' }}
      </div>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close()">
          关闭
        </n-button>
        <n-button
          tag="a"
          :href="`${props.checkFileDownloadUrl}`"
          target="_blank"
          type="primary"
        >
          <template #icon>
            <Icon icon="ant-design:download-outlined" />
          </template>
          下载
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
</style>
