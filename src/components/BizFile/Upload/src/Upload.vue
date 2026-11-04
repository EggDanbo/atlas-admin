<script lang="ts" setup>
import type { UploaderFile } from '@/utils/uploader'
import { computed, onMounted, reactive, ref, unref, watch } from 'vue'
import { buildPreviewUrl, FileKind, getFileIcon, getFileKind, isPreviewableKind } from '@/components/BizFile/shared'
import { SpModal, useModal } from '@/components/SpModal'
import { getApiBaseUrl } from '@/hooks/setting'
import { file as fileApi } from '@/service/api/misc'
import { useThemeStore } from '@/store/modules/theme'
import toast from '@/utils/toast'

import token from '@/utils/token'
import Uploader from '@/utils/uploader/uploader'
import { uuid } from '@/utils/uuid'
import { basicProps } from './props'

const props = defineProps({ ...basicProps })

const emit = defineEmits([
  'update:value',
  'uploadChange',
  'delete',
  'on-start',
  'on-complate',
])

/** 进度条颜色跟随主题主色，换主题后不再残留蓝色 */
const { primaryColor } = storeToRefs(useThemeStore())

const getMaxNumber = computed(() => props.maxNumber)

const fileList = ref<Array<FileStorage.FileResourceModel>>([])

const uploadRef = ref()
const uploading = ref(false)
const percentage = ref(0)

const [videoModalRegister, videoModal] = useModal({
  title: '视频播放',
})

const playerOptions = reactive({
  playbackRates: [0.7, 1, 1.5, 2],
  sources: [
    {
      src: '',
      type: '',
    },
  ],
  autoplay: 'any',
  loop: false,
  preload: 'auto',
  language: 'zh-CN',
  aspectRatio: '16:9',
  fluid: false,
  notSupportedMessage: '此视频暂无法播放，请稍后再试',
  controls: true,
  controlBar: {
    timeDivider: true,
    durationDisplay: true,
    remainingTimeDisplay: false,
    fullscreenToggle: true,
  },
})

watch(
  () => props.value,
  (value) => {
    // 接口偶尔会把 files 返回成非数组，这里统一兜底，避免下游 every/length 崩溃
    fileList.value = Array.isArray(value) ? value : []
  },
  {
    immediate: true,
    deep: false,
  },
)

const uploadAction = `${getApiBaseUrl()}/file/resource/upload/fragment`

// 预编译正则表达式：用于清理文件名中的非法字符
const FILENAME_CLEANUP_REGEX = /[^\w-]/g

const uploader = new Uploader({
  target: uploadAction,
  allowDuplicateUploads: true,
  singleFile: false,
  testChunks: false,

  generateUniqueIdentifier(file: any) {
    const relativePath
      = file.relativePath || file.webkitRelativePath || file.fileName || file.name
    return `${uuid()}-${relativePath.replaceAll(FILENAME_CLEANUP_REGEX, '')}`
  },
})

// 文件添加 单个文件
uploader.on('filesAdded', ((files: UploaderFile[], _fileList: UploaderFile[], _event: Event | undefined) => {
  if (files.length === 0 || props.disabled)
    return false

  const fileInfo = files[0]!
  const { maxSize, accepts, acceptImage, onlyImage } = props
  if (onlyImage) {
    if (acceptImage && acceptImage.length > 0 && !acceptImage.includes(fileInfo.fileType!)) {
      toast.error(`不是有效的文件`)
      return false
    }
  }
  else {
    // 限制附件上传类型
    if (!accepts.includes(fileInfo.fileType!)) {
      toast.error(`不是有效的文件`)
      return false
    }
  }

  // 设置最大值，则判断
  if (maxSize && fileInfo.size / 1024 / 1024 >= maxSize) {
    toast.error(`上传文件大小不能超过${maxSize}M`)
    return false
  }

  return true
}) as (...args: unknown[]) => boolean | void)

// 根下的单个文件（文件夹）上传完成
uploader.on('fileProgress', ((rootFile: UploaderFile, _file: UploaderFile) => {
  percentage.value = Math.floor(rootFile.progress() * 100)
}) as (...args: unknown[]) => boolean | void)

// 单个文件上传成功
uploader.on('fileSuccess', (async (_rootFile: unknown, file: UploaderFile, _message: unknown) => {
  let waterMark: Record<string, unknown>
  if (props.onlyImage) {
    waterMark = {
      watermark: props.watermark,
      watermark_pos: props.watermarkPos,
      watermark_text: props.watermarkText,
    }
  }
  else {
    waterMark = {}
  }
  const { isSuccess, data } = await fileApi
    .uploadFragmentFinish({
      identifier: file.uniqueIdentifier!,
      temp: true,
      ...waterMark,
    })
    .finally(() => (uploading.value = false))
  if (!isSuccess)
    return
  const { acceptImage } = props
  fileList.value.push({
    ...data,
    name: file.name,
    image: acceptImage && acceptImage.includes(file.fileType!),
  })
  emit('uploadChange', fileList.value)
  emit('update:value', fileList.value)
}) as (...args: unknown[]) => boolean | void | Promise<void>)

// 根下的单个文件（文件夹）上传完成
uploader.on('fileComplete', ((_rootFile: unknown) => {
}) as (...args: unknown[]) => boolean | void)
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
}) as (...args: unknown[]) => boolean | void)

uploader.on('filesSubmitted', ((files: UploaderFile[], _fileList: UploaderFile[], _event: Event | undefined) => {
  if (files.length > 0 && !props.disabled) {
    uploader.opts.headers = {
      Authorization: `${token.get()?.token_type} ${token.get()?.access_token}`,
    }
    uploader.upload()
  }
}) as (...args: unknown[]) => boolean | void)

uploader.on('uploadStart', () => {
  uploading.value = true
  percentage.value = 0
  emit('on-start')
})

uploader.on('complete', () => {
  emit('on-complate')
})

// ---------------- 展示形态 ----------------

/** 是否按图片墙形态渲染（仅图片 / 全部是图片时） */
const isImageMode = computed(() => {
  if (props.onlyImage)
    return true
  if (fileList.value.length === 0)
    return false
  return fileList.value.every(item => isImage(item))
})

const canUpload = computed(() => fileList.value.length < getMaxNumber.value && !props.disabled)

/** 图片墙单元格尺寸，沿用调用方传入的 width/height */
const thumbStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
}))

/** 文件类别配色，用于文件行的图标底色 */
const KIND_TONE: Record<FileKind, string> = {
  [FileKind.Image]: '#3b82f6',
  [FileKind.Video]: '#8b5cf6',
  [FileKind.Pdf]: '#ef4444',
  [FileKind.Word]: '#2563eb',
  [FileKind.Excel]: '#16a34a',
  [FileKind.Ppt]: '#ea580c',
  [FileKind.Markdown]: '#64748b',
  [FileKind.Code]: '#0891b2',
  [FileKind.Text]: '#64748b',
  [FileKind.Archive]: '#d97706',
  [FileKind.Other]: '#94a3b8',
}

function kindOf(item: FileStorage.FileResourceModel) {
  return getFileKind({ name: item.name, mime: item.content_type })
}

function kindColor(kind: FileKind) {
  return KIND_TONE[kind] ?? KIND_TONE[FileKind.Other]
}

/** 用同色低透明度做图标底板，亮暗主题都成立 */
function kindTint(kind: FileKind) {
  const hex = kindColor(kind).replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.12)`
}

function openPreview(item: FileStorage.FileResourceModel) {
  window.open(buildPreviewUrl(item))
}

function isImage(item: FileStorage.FileResourceModel) {
  if (item.image)
    return true
  if (item.content_type && item.content_type.toLowerCase().startsWith('image/'))
    return true

  return false
}

function isVideo(item: FileStorage.FileResourceModel) {
  if (item.content_type && item.content_type.toLowerCase().startsWith('video/'))
    return true

  return false
}

function getUrl(item: FileStorage.FileResourceModel) {
  let url = item.url
  if (props.width && props.height) {
    url += !item.url.includes('?') ? '?' : '&' // 判断是否有问号
    url += `width=${props.width}&height=${props.height}`
  }
  return url
}

function down(item: FileStorage.FileResourceModel) {
  let url = item.url // 返回的url
  url += !item.url.includes('?') ? '?' : '&' // 判断是否有问号
  const newUrl = `${url}down=1`
  window.open(newUrl)
}

function play(item: FileStorage.FileResourceModel) {
  playerOptions.sources[0]!.src = item.url
  playerOptions.sources[0]!.type = item.content_type

  videoModal.open()
}

async function remove(index: number) {
  fileList.value.splice(index, 1)
  emit('delete', fileList.value)
  emit('update:value', fileList.value)
}

onMounted(async () => {
  if (!props.disabled)
    uploader.assignBrowse(unref(uploadRef).$el ?? unref(uploadRef))
})
</script>

<template>
  <div class="atlas-upload" :class="{ 'atlas-upload--center': props.center }">
    <!-- 图片墙：图片类文件用缩略图，操作收进 hover 遮罩 -->
    <div v-if="isImageMode" class="atlas-upload__thumbs">
      <div
        v-for="(item, index) in fileList"
        :key="`file_${index}`"
        class="atlas-upload__thumb"
        :style="thumbStyle"
      >
        <n-image
          v-if="isImage(item)"
          class="atlas-upload__thumb-img"
          :src="getUrl(item)"
          :preview-src="item.url"
          object-fit="cover"
        />
        <div v-else class="atlas-upload__thumb-fallback">
          <n-icon :size="26">
            <Icon :icon="getFileIcon(kindOf(item))" />
          </n-icon>
        </div>

        <div class="atlas-upload__thumb-mask">
          <button
            v-if="isPreviewableKind(kindOf(item))"
            type="button"
            class="atlas-upload__icon-btn"
            title="预览"
            @click.stop="openPreview(item)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:eye-outlined" />
            </n-icon>
          </button>
          <button
            v-else-if="isVideo(item)"
            type="button"
            class="atlas-upload__icon-btn"
            title="播放"
            @click.stop="play(item)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:video-camera-outlined" />
            </n-icon>
          </button>
          <button type="button" class="atlas-upload__icon-btn" title="下载" @click.stop="down(item)">
            <n-icon :size="16">
              <Icon icon="ant-design:download-outlined" />
            </n-icon>
          </button>
          <button
            v-if="!props.disabled"
            type="button"
            class="atlas-upload__icon-btn atlas-upload__icon-btn--danger"
            title="删除"
            @click.stop="remove(index)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:delete-outlined" />
            </n-icon>
          </button>
        </div>

        <span v-if="props.showFileName && item.name" class="atlas-upload__thumb-name" :title="item.name">
          {{ item.name }}
        </span>
      </div>

      <button
        v-if="canUpload && !uploading"
        ref="uploadRef"
        type="button"
        class="atlas-upload__add"
        :style="thumbStyle"
      >
        <n-icon :size="20">
          <Icon icon="ant-design:plus-outlined" />
        </n-icon>
        <span class="atlas-upload__add-text">
          {{ props.uploadTitle }}
        </span>
      </button>

      <div v-if="uploading" class="atlas-upload__add atlas-upload__add--loading" :style="thumbStyle">
        <n-progress
          type="circle"
          :percentage="percentage"
          :color="primaryColor"
          rail-color="rgba(128, 128, 128, 0.2)"
          :stroke-width="7"
          :width="56"
        />
      </div>
    </div>

    <!-- 文件列表：附件类文件走紧凑行，信息密度高、不占版面 -->
    <div v-else class="atlas-upload__list">
      <div v-for="(item, index) in fileList" :key="`file_${index}`" class="atlas-upload__row">
        <span
          class="atlas-upload__kind"
          :style="{ color: kindColor(kindOf(item)), background: kindTint(kindOf(item)) }"
        >
          <n-icon :size="16">
            <Icon :icon="getFileIcon(kindOf(item))" />
          </n-icon>
        </span>

        <div class="atlas-upload__meta">
          <span class="atlas-upload__name" :title="item.name">{{ item.name }}</span>
          <span class="atlas-upload__sub">{{ item.size }}</span>
        </div>

        <div class="atlas-upload__actions">
          <button
            v-if="isPreviewableKind(kindOf(item))"
            type="button"
            class="atlas-upload__icon-btn atlas-upload__icon-btn--ghost"
            title="预览"
            @click.stop="openPreview(item)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:eye-outlined" />
            </n-icon>
          </button>
          <button
            v-else-if="isVideo(item)"
            type="button"
            class="atlas-upload__icon-btn atlas-upload__icon-btn--ghost"
            title="播放"
            @click.stop="play(item)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:video-camera-outlined" />
            </n-icon>
          </button>
          <button
            type="button"
            class="atlas-upload__icon-btn atlas-upload__icon-btn--ghost"
            title="下载"
            @click.stop="down(item)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:download-outlined" />
            </n-icon>
          </button>
          <button
            v-if="!props.disabled"
            type="button"
            class="atlas-upload__icon-btn atlas-upload__icon-btn--ghost atlas-upload__icon-btn--danger"
            title="删除"
            @click.stop="remove(index)"
          >
            <n-icon :size="16">
              <Icon icon="ant-design:delete-outlined" />
            </n-icon>
          </button>
        </div>
      </div>

      <!-- 上传中：占一行显示进度，不再是空转的加载块 -->
      <div v-if="uploading" class="atlas-upload__row atlas-upload__row--progress">
        <n-progress
          type="line"
          :percentage="percentage"
          :color="primaryColor"
          rail-color="rgba(128, 128, 128, 0.2)"
          :height="4"
          :show-indicator="true"
          processing
        />
      </div>

      <button v-if="canUpload && !uploading" ref="uploadRef" type="button" class="atlas-upload__add-row">
        <n-icon :size="16">
          <Icon icon="ant-design:plus-outlined" />
        </n-icon>
        <span>{{ props.uploadTitle }}</span>
      </button>

      <div v-if="fileList.length === 0 && props.disabled" class="atlas-upload__empty">
        暂无附件
      </div>
    </div>
  </div>

  <!-- 播放器 -->
  <SpModal width="800" :mask="true" :draggable="true" @register="videoModalRegister">
    <template #default>
      <div class="flex items-center justify-center">
        <video-player :options="playerOptions" :volume="0.6">
          <source>
        </video-player>
      </div>
    </template>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="videoModal.close">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
  .atlas-upload {
  width: 100%;

  &--center {
    .atlas-upload__thumbs {
      justify-content: center;
    }
  }
}

/* ---------------- 图片墙 ---------------- */
.atlas-upload__thumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--atlas-gap-sm);
}

.atlas-upload__thumb {
  position: relative;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--atlas-border);
  border-radius: var(--atlas-radius-md);
  background: var(--atlas-surface-sunken);
  transition:
    border-color var(--atlas-duration) var(--atlas-ease),
    box-shadow var(--atlas-duration) var(--atlas-ease);

  &:hover {
    border-color: var(--atlas-border-strong);
    box-shadow: var(--atlas-shadow-sm);

    .atlas-upload__thumb-mask {
      opacity: 1;
    }
  }
}

.atlas-upload__thumb-img {
  display: block;
  width: 100%;
  height: 100%;

  :deep(.n-image) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.atlas-upload__thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--atlas-text-tertiary);
}

.atlas-upload__thumb-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(15, 18, 23, 0.62);
  opacity: 0;
  transition: opacity var(--atlas-duration) var(--atlas-ease);
}

.atlas-upload__thumb-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 6px 4px;
  font-size: 11px;
  line-height: 1.3;
  color: #fff;
  text-align: center;
  background: linear-gradient(to top, rgba(15, 18, 23, 0.72), transparent);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------------- 上传入口 ---------------- */
.atlas-upload__add {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  color: var(--atlas-text-tertiary);
  cursor: pointer;
  background: var(--atlas-surface-sunken);
  border: 1px dashed var(--atlas-border-strong);
  border-radius: var(--atlas-radius-md);
  transition:
    color var(--atlas-duration) var(--atlas-ease),
    border-color var(--atlas-duration) var(--atlas-ease),
    background var(--atlas-duration) var(--atlas-ease);

  &:hover {
    color: var(--atlas-brand);
    background: var(--atlas-brand-soft);
    border-color: var(--atlas-brand);
  }

  &--loading {
    cursor: default;
    background: var(--atlas-surface-sunken);
    border-style: solid;

    &:hover {
      color: var(--atlas-text-tertiary);
      background: var(--atlas-surface-sunken);
      border-color: var(--atlas-border-strong);
    }
  }
}

.atlas-upload__add-text {
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
}

/* ---------------- 文件列表 ---------------- */
.atlas-upload__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.atlas-upload__row {
  display: flex;
  align-items: center;
  gap: var(--atlas-gap-sm);
  min-height: 46px;
  padding: 6px 10px;
  background: var(--atlas-surface-sunken);
  border: 1px solid var(--atlas-border);
  border-radius: var(--atlas-radius-sm);
  transition:
    border-color var(--atlas-duration) var(--atlas-ease),
    background var(--atlas-duration) var(--atlas-ease);

  &:hover {
    background: var(--atlas-surface-hover);
    border-color: var(--atlas-border-strong);

    .atlas-upload__actions {
      opacity: 1;
    }
  }

  &--progress {
    padding: 10px;
    background: transparent;
    border-style: dashed;
  }
}

.atlas-upload__kind {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--atlas-radius-sm);
}

.atlas-upload__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.atlas-upload__name {
  overflow: hidden;
  font-size: 13px;
  line-height: 1.4;
  color: var(--atlas-text);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.atlas-upload__sub {
  font-size: 11px;
  line-height: 1.3;
  color: var(--atlas-text-tertiary);
}

.atlas-upload__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--atlas-duration) var(--atlas-ease);
}

/* ---------------- 通用图标按钮 ---------------- */
.atlas-upload__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--atlas-radius-xs);
  transition:
    background var(--atlas-duration) var(--atlas-ease),
    color var(--atlas-duration) var(--atlas-ease);

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  &--ghost {
    color: var(--atlas-text-tertiary);

    &:hover {
      color: var(--atlas-text);
      background: var(--atlas-surface);
    }
  }

  &--danger:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
  }
}

/* ---------------- 空态与整行上传入口 ---------------- */
.atlas-upload__add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  font-size: 13px;
  color: var(--atlas-text-tertiary);
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--atlas-border-strong);
  border-radius: var(--atlas-radius-sm);
  transition:
    color var(--atlas-duration) var(--atlas-ease),
    border-color var(--atlas-duration) var(--atlas-ease),
    background var(--atlas-duration) var(--atlas-ease);

  &:hover {
    color: var(--atlas-brand);
    background: var(--atlas-brand-soft);
    border-color: var(--atlas-brand);
  }
}

.atlas-upload__empty {
  padding: 8px 0;
  font-size: 12px;
  color: var(--atlas-text-tertiary);
}
</style>
