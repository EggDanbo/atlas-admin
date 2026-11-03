<script lang="ts" setup>
import { logImport as api } from '@/service/api/system'

const btnLoading = ref(false)
const formModel = reactive<Recordable>({})

const modalRef = ref<any>(null)

async function open(id: string) {
  const { isSuccess, data } = await api.get(id)
  if (isSuccess)
    Object.assign(formModel, data)

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
    title="下载导入文件"
    width="452"
    :mask="true"
    :draggable="true"
    :show-ok="false"
  >
    <template #default>
      <div v-if="formModel.files && formModel.files.length > 0" style="font-size: 16px; text-align: center; padding: 15px 0;">
        {{ formModel.title }}.xlsx / {{ formModel.ctime }}
      </div>
      <div v-else style="font-size: 16px; text-align: center; padding: 15px 0;">
        导入文件不存在。
      </div>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close()">
          关闭
        </n-button>
        <n-button
          v-if="formModel.files && formModel.files.length > 0"
          tag="a"
          :href="`${formModel.files[0].url}`"
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
