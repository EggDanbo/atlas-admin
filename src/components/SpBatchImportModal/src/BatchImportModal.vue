<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import { UploadBtn } from '@/components/File/UploadBtn'
import { LogBiz } from '@/components/Logs/Biz'
import { SpBatchImportCheckModal } from '@/components/SpBatchImportModal'

import { getApiBaseUrl } from '@/hooks/setting'
import { batchImportModalProps } from './props'

const props = defineProps({ ...batchImportModalProps })

const emit = defineEmits(['upload-success'])

const logBizRef = ref<OpenModal | null>(null)

const btnLoading = ref(false)

const modalRef = ref<any>(null)
const checkModalRef = ref<any>(null)

const baseUrl = getApiBaseUrl()

const defaultTips = [
  '1、列数、列顺序及标题所在行号须与模板文件一致；',
  '2、标题文字颜色为红色的列为必填列，值不能为空；',
  '3、数值金额列的值需是数字、金额，非必填可为空；',
  '4、日期时间列的值需是日期、时间，非必填可为空；',
  '5、关联编码列的值为系统中已设置的基础资料编码。',
]

const tipItems = computed(() => props.tips.length > 0 ? props.tips : defaultTips)

function open() {
  modalRef.value?.open()
}

function close() {
  btnLoading.value = false
  modalRef.value?.close()
}

function handleUploadChange(fileData: FileStorage.FileResourceModel) {
  btnLoading.value = true
  emit('upload-success', fileData.id)
}

function check() {
  checkModalRef.value?.open()
}

function handleLogs() {
  logBizRef.value?.open({ mark: props.title })
}

defineExpose({ open, close, check })
</script>

<template>
  <SpModal
    ref="modalRef"
    :title="props.title"
    width="520"
    :mask="true"
    :draggable="true"
    :show-ok="false"
  >
    <template #default>
      <div class="import-tips">
        <p class="import-tips-title">
          导入文件仅支持.XLSX格式，并需检查如下内容：
        </p>
        <ol class="import-tips-list">
          <li v-for="(item, index) in tipItems" :key="index">
            {{ item }}
          </li>
        </ol>
      </div>
    </template>

    <template #footer>
      <n-flex justify="space-between">
        <n-button-group class="gap-4">
          <n-button
            text
            tag="a"
            :href="`${baseUrl}${props.templateDownloadUrl}`"
            target="_blank"
          >
            <template #icon>
              <Icon icon="ant-design:download-outlined" />
            </template>
            下载模板
          </n-button>
          <n-button v-if="props.title.indexOf('批量') !== -1" text @click="handleLogs">
            导入日志
          </n-button>
        </n-button-group>
        <UploadBtn
          :accept="props.accept"
          :max-size="props.maxSize"
          :loading="btnLoading"
          type="primary"
          @upload-change="handleUploadChange"
        >
          <template #icon>
            <Icon icon="ant-design:cloud-upload-outlined" />
          </template>
          上传导入文件
        </UploadBtn>
      </n-flex>
    </template>
  </SpModal>

  <SpBatchImportCheckModal
    ref="checkModalRef"
    :check-file-download-url="props.checkFileDownloadUrl"
    :check-file-message="props.checkFileMessage"
  />
  <LogBiz ref="logBizRef" />
</template>

<style lang="less" scoped>
.import-tips {
  &-title {
    margin: 0 0 8px 80px;
    font-weight: 500;
    color: var(--n-text-color, #333);
  }

  &-list {
    margin: 0 0 8px 60px;
    line-height: 1.8;
    color: var(--n-text-color, #333);
  }
}
</style>
