<script lang="ts" setup>
import type { UploaderFile } from '@/utils/uploader'
import { onMounted, ref, unref } from 'vue'
import { getApiBaseUrl } from '@/hooks/setting'
import { file as fileApi } from '@/service/api/misc'
import { useThemeStore } from '@/store/modules/theme'
import toast from '@/utils/toast'
import token from '@/utils/token'
import Uploader from '@/utils/uploader/uploader'
import { uuid } from '@/utils/uuid'

import { basicProps } from './props'

const props = defineProps({ ...basicProps })

const emit = defineEmits(['uploadChange'])

/** 进度条颜色跟随主题主色，换主题后不再残留蓝色 */
const { primaryColor } = storeToRefs(useThemeStore())

const uploadRef = ref()
const uploading = ref(false)
const percentage = ref(0)

const uploadAction = `${getApiBaseUrl()}/file/resource/upload/fragment`

const FILENAME_CLEANUP_REGEX = /[^\w-]/g

const uploader = new Uploader({
  target: uploadAction,
  allowDuplicateUploads: true,
  singleFile: true,
  testChunks: false,
  generateUniqueIdentifier(file: File) {
    const relativePath
      = (file as any).relativePath || (file as any).webkitRelativePath || (file as any).fileName || file.name
    return `${uuid()}-${relativePath.replaceAll(FILENAME_CLEANUP_REGEX, '')}`
  },
})

// 文件添加 单个文件
uploader.on('filesAdded', ((files: UploaderFile[]) => {
  if (files.length === 0)
    return false

  const fileInfo = files[0]!
  const { maxSize, accept } = props

  if (accept && accept.length > 0 && !accept.includes(fileInfo.fileType!)) {
    toast.error('不是有效的文件')
    return false
  }

  if (maxSize && fileInfo.size / 1024 / 1024 >= maxSize) {
    toast.error(`上传文件大小不能超过${maxSize}M`)
    return false
  }

  return true
}) as any)

// 上传进度
uploader.on('fileProgress', ((rootFile: UploaderFile) => {
  percentage.value = Math.min(Math.floor(rootFile.progress() * 100), 99)
}) as any)

// 单个文件上传成功
uploader.on('fileSuccess', (async (_rootFile: unknown, file: UploaderFile) => {
  const { isSuccess, data } = await fileApi
    .uploadFragmentFinish({
      identifier: file.uniqueIdentifier!,
      temp: true,
    })
    .finally(() => {
      uploading.value = false
    })

  if (!isSuccess)
    return

  emit('uploadChange', data)
}) as any)

// 某个文件上传失败了
uploader.on('fileError', ((_rootFile: unknown, _file: unknown, message: unknown) => {
  uploading.value = false
  const msg = message as string
  try {
    const res = JSON.parse(msg)
    toast.error(res.message)
  }
  catch {
    toast.error(msg)
  }
}) as any)

uploader.on('filesSubmitted', ((files: UploaderFile[]) => {
  if (files.length > 0) {
    uploader.opts.headers = {
      Authorization: `${token.get()?.token_type} ${token.get()?.access_token}`,
    }
    uploader.upload()
  }
}) as any)

uploader.on('uploadStart', () => {
  uploading.value = true
  percentage.value = 0
})

onMounted(() => {
  uploader.assignBrowse(unref(uploadRef).$el)
})
</script>

<template>
  <n-button ref="uploadRef" :disabled="uploading">
    <template v-if="$slots.default" #default>
      <n-progress
        v-show="uploading"
        type="line"
        :color="primaryColor"
        rail-color="rgba(128, 128, 128, 0.25)"
        :percentage="percentage"
        :show-indicator="true"
        indicator-placement="inside"
        processing
        class="mr-1"
      />
      <slot name="default" />
    </template>
    <template v-else #default>
      <n-progress
        v-show="uploading"
        type="line"
        :color="primaryColor"
        rail-color="rgba(128, 128, 128, 0.25)"
        :percentage="percentage"
        :show-indicator="true"
        indicator-placement="inside"
        processing
        class="mr-1"
      />
      上传文件
    </template>
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </n-button>
</template>
