<script lang="ts" setup>
import type { UploaderFile } from '@/utils/uploader'
import { computed, onMounted, reactive, ref, unref, watch } from 'vue'
import { buildPreviewUrl, getFileIcon, getFileKind, isPreviewableKind } from '@/components/BizFile/shared'
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
const getMaxNumber = computed(() => {
  return props.maxNumber
})

const fileList = ref<Array<FileStorage.FileResourceModel>>([])

const uploadRef = ref()
const uploading = ref(false)
const percentage = ref(0)
const width = ref(`${props.width}px`)
const height = ref(`${props.height}px`)

// 计算卡片高度：如果不显示文件名，则不需要额外高度
const cardHeight = computed(() => {
  return props.showFileName ? `calc(${height.value} + 36px)` : height.value
})

const [videoModalRegister, videoModal] = useModal({
  title: '视频播放',
})

const playerOptions = reactive({
  // height: 200,
  // width: document.documentElement.clientWidth, //播放器宽度
  playbackRates: [0.7, 1, 1.5, 2], // 播放速度
  sources: [
    {
      src: '',
      type: '',
    },
  ],
  autoplay: 'any', // 如果true,浏览器准备好时开始回放。
  loop: false, // 导致视频一结束就重新开始。
  preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
  language: 'zh-CN',
  aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
  fluid: false, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
  notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
  controls: true,
  controlBar: {
    timeDivider: true,
    durationDisplay: true,
    remainingTimeDisplay: false,
    fullscreenToggle: true, // 全屏按钮
  },
})

watch(
  () => props.value,
  (value) => {
    fileList.value = value || []
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
  // console.log('fileComplete', rootFile);
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

  // console.log('fileError', rootFile, file, message);
}) as (...args: unknown[]) => boolean | void)

uploader.on('filesSubmitted', ((files: UploaderFile[], _fileList: UploaderFile[], _event: Event | undefined) => {
  // console.log('filesSubmitted', files, fileList, event);
  if (files.length > 0 && !props.disabled) {
    uploader.opts.headers = {
      Authorization: `${token.get()?.token_type} ${token.get()?.access_token}`,
    }
    uploader.upload()
  }
}) as (...args: unknown[]) => boolean | void)

uploader.on('uploadStart', () => {
  // console.log('uploadStart');
  uploading.value = true
  percentage.value = 0
  emit('on-start')
})

uploader.on('complete', () => {
  // console.log('complete');
  emit('on-complate')
})

function kindOf(item: FileStorage.FileResourceModel) {
  return getFileKind({ name: item.name, mime: item.content_type })
}

function openPreview(item: FileStorage.FileResourceModel) {
  window.open(buildPreviewUrl(item))
}

function isImage(item: FileStorage.FileResourceModel) {
  if (item.image)
    return true
  if (item.content_type && item.content_type.toLowerCase().startsWith('image/')) {
    return true
  }
  return false
}

function isVideo(item: FileStorage.FileResourceModel) {
  if (item.content_type && item.content_type.toLowerCase().startsWith('video/')) {
    return true
  }
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
    uploader.assignBrowse(unref(uploadRef).$el)
})
</script>

<template>
  <div class="upload flex" :class="{ 'justify-center': props.center }">
    <div class="upload-card">
      <!-- 空 -->
      <div v-if="fileList.length === 0 && props.disabled" class="upload-card-item" />

      <!-- 列表 -->
      <n-image-group>
        <div v-for="(item, index) in fileList" :key="`file_${index}`" class="upload-card-item">
          <div class="upload-card-item-info">
            <div class="img-box">
              <n-image
                v-if="isImage(item)"
                :preview-src="item.url"
                :src="getUrl(item)"
                object-fit="cover"
              />
              <n-icon v-else :size="props.height - 50">
                <Icon :icon="getFileIcon(kindOf(item))" />
              </n-icon>
            </div>
            <div class="img-box-actions px-1">
              <n-icon
                v-if="isPreviewableKind(kindOf(item))"
                size="18"
                class="action-icon mx-1"
                @click="openPreview(item)"
              >
                <Icon icon="ant-design:eye-outlined" />
              </n-icon>
              <n-icon
                v-else-if="isVideo(item)"
                size="18"
                class="action-icon mx-1"
                @click="play(item)"
              >
                <Icon icon="ant-design:video-camera-outlined" />
              </n-icon>
              <n-icon size="18" class="action-icon mx-1" @click="down(item)">
                <Icon icon="ant-design:download-outlined" />
              </n-icon>
              <n-icon
                v-if="!props.disabled"
                size="18"
                class="action-icon mx-1"
                @click="remove(index)"
              >
                <Icon icon="ant-design:delete-outlined" />
              </n-icon>
            </div>
          </div>
          <template v-if="props.showFileName">
            <div class="upload-card-text truncate text-center">
              {{ item.name }}
            </div>
            <div class="upload-card-text truncate text-center">
              {{ item.size }}
            </div>
          </template>
        </div>
      </n-image-group>

      <!-- 上传 -->
      <div v-show="fileList.length < getMaxNumber && !props.disabled" class="flex justify-center">
        <n-button
          v-show="!uploading"
          ref="uploadRef"
          text
          class="upload-card-item upload-card-item-select-picture"
        >
          <n-icon size="18" class="m-auto">
            <Icon icon="ant-design:plus-outlined" />
          </n-icon>
          <div>{{ props.uploadTitle }}</div>
        </n-button>
        <div v-show="uploading" class="upload-card-item upload-card-item-select-picture">
          <n-spin size="small" />
          <n-progress
            type="line"
            :color="primaryColor"
            rail-color="rgba(128, 128, 128, 0.25)"
            :percentage="percentage"
            :show-indicator="true"
            indicator-placement="inside"
            processing
            class="mt-20"
          />
        </div>
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
  .upload {
  width: 100%;

  &-card {
    width: auto;
    height: auto;
    display: flex;
    flex-wrap: wrap;

    &-item {
      margin: 0 8px 8px 0;
      position: relative;
      padding: 8px;
      border: 1px solid #d9d9d9;
      background-color: rgba(255, 255, 255, 0.85);
      border-radius: 2px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      width: v-bind(width);
      height: v-bind(cardHeight);

      &:hover {
        background: 0 0;

        .upload-card-item-info::before {
          opacity: 1;
        }
      }

      &-info {
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        .img-box {
          position: relative;
          border-radius: 2px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: calc(v-bind(width) - 40px);
          height: calc(v-bind(height) - 60px);
        }

        .img-box-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 10px;

          .action-icon {
            cursor: pointer;
            color: rgba(0, 0, 0, 0.6);
            transition: all 0.3s ease-in-out;

            &:hover {
              color: rgba(0, 0, 0, 1);
            }
          }
        }
      }
    }

    &-text {
      padding: 0 10px;
      width: v-bind(width);
    }

    &-item-select-picture {
      border: 1px dashed #d9d9d9;
      border-radius: 2px;
      cursor: pointer;
      background: #fafafa;
      color: #666;

      .upload-title {
        color: #666;
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .upload-card-item {
    border: 1px solid rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
  }

  .img-box-actions {
    .action-icon {
      color: rgba(255, 255, 255, 0.6);

      &:hover {
        color: rgba(255, 255, 255, 1);
      }
    }
  }
}
</style>
