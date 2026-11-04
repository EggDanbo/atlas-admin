<script lang="ts" setup>
import type { GlobalThemeOverrides } from 'naive-ui'
import type { FileManagerInst, ManagerType } from './types'

import type { UploaderFile } from '@/utils/uploader'

import { useThemeVars } from 'naive-ui'
import printJS from 'print-js'
import { computed, reactive, ref, unref } from 'vue'
import { buildPreviewUrl, EXT_MIME_MAP, getFileIcon, getFileKind, isPreviewableKind, validateUploadFile } from '@/components/BizFile/shared'
import { SpModal, useModal } from '@/components/SpModal'
import { getApiBaseUrl } from '@/hooks/setting'
import toast from '@/utils/toast'
import token from '@/utils/token'
import Uploader from '@/utils/uploader/uploader'
import { uuid } from '@/utils/uuid'
import { useManager } from './hooks/useManager'
import { basicProps } from './props'

const props = defineProps({ ...basicProps })
const emit = defineEmits(['register', 'on-ok'])

/** 进度条颜色跟随主题主色，换主题后不再残留蓝色 */
const themeVars = useThemeVars()

let isInitialize = false

const uploadRef = ref()
const viewType = ref('列表')
const checkList = ref<Recordable[]>([])
const canRemove = ref(true)
const canUpload = ref(true)
const uploading = ref(false)
const percentage = ref(0)

const [videoModalRegister, videoModal] = useModal({
  title: '视频播放',
})

const playerOptions = reactive({
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

const manager = useManager()
const { filterModel, getDataModel } = manager

const [modalRegister, fileManagerModal] = useModal()

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

uploader.on('filesAdded', ((files: UploaderFile[], _fileList: UploaderFile[], _event: Event | undefined) => {
  if (files.length === 0 || !canUpload.value)
    return false

  const fileInfo = files[0]!
  const { maxSize } = props

  const result = validateUploadFile(
    { name: fileInfo.name, type: fileInfo.fileType, size: fileInfo.size },
    // FileManager 无 accepts 配置：用 EXT_MIME_MAP 全量 MIME 作白名单；maxSizeMB:0 不校验大小
    { acceptMimes: Object.values(EXT_MIME_MAP).flat(), maxSizeMB: maxSize },
  )
  if (!result.valid) {
    toast.error(result.error ?? '不是有效的文件')
    return false
  }
  return true
}) as (...args: unknown[]) => boolean | void)

uploader.on('fileSuccess', (async (_rootFile: unknown, file: UploaderFile, _message: unknown) => {
  await manager
    .uploadFinish({
      identifier: file.uniqueIdentifier,
      xid: filterModel.xid,
      mark: filterModel.mark,
    })
    .finally(() => {
      uploading.value = false
      percentage.value = 0
    })
}) as (...args: unknown[]) => boolean | void | Promise<void>)

uploader.on('fileProgress', ((rootFile: UploaderFile, _file: UploaderFile) => {
  percentage.value = Math.floor(rootFile.progress() * 100)
}) as (...args: unknown[]) => boolean | void)

uploader.on('uploadStart', () => {
  uploading.value = true
  percentage.value = 0
})

uploader.on('fileError', ((_rootFile: unknown, _file: unknown, message: string) => {
  uploading.value = false
  percentage.value = 0
  try {
    const res = JSON.parse(message)
    toast.error(res.message)
  }
  catch {
    toast.error(message)
  }
}) as (...args: unknown[]) => boolean | void)

uploader.on('filesSubmitted', ((files: UploaderFile[], _fileList: UploaderFile[], _event: Event | undefined) => {
  if (files.length > 0 && canUpload.value) {
    uploader.upload()
  }
}) as (...args: unknown[]) => boolean | void)

function handleImageClick(val: Recordable) {
  const i = checkList.value.findIndex(item => val === item)
  if (i > -1) {
    checkList.value.splice(i, 1)
  }
  else {
    checkList.value.push(val)
  }
}

async function search() {
  filterModel.page = 1
  await manager.fetch()
}

async function updatePage(page) {
  filterModel.page = page
  await manager.fetch()
}

function handleDownFile(row: any) {
  let url = row.url // 返回的url
  url += !row.url.includes('?') ? '?' : '&' // 判断是否有问号
  const newUrl = `${url}down=1`
  window.open(newUrl)
}

function handleRemove(rows: Recordable[]) {
  if (rows.length === 0) {
    toast.warning('请选择要删除的文件。')
    return
  }
  toast.infoModal('确定删除吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: () => {
      manager.remove(rows).then((res) => {
        if (!res)
          return
        toast.success('操作成功')
      })
    },
  })
}

function handleOk() {
  if (props.type === 'one' && checkList.value.length > 1) {
    toast.info('只允许选择单个文件')
    return
  }
  emit('on-ok', unref(checkList))
  fileManagerModal.close()
}

function kindOf(item: any) {
  return getFileKind({ name: item.name, mime: item.mime, extension: item.extension })
}

function openPreview(item: any) {
  window.open(buildPreviewUrl(item))
}

function isImage(item: any) {
  if (item.mime.includes('image/bmp'))
    return true
  if (item.mime.includes('image/gif'))
    return true
  if (item.mime.includes('image/jpeg'))
    return true
  if (item.mime.includes('image/jpg'))
    return true
  if (item.mime.includes('image/pjpeg'))
    return true
  if (item.mime.includes('image/png'))
    return true
  if (item.mime.includes('image/tiff'))
    return false
  if (item.mime.includes('image/tif'))
    return false
  if (item.mime.includes('image/svg+xml'))
    return true
  return item.mime.toLowerCase().startsWith('image/') || item.scale !== ''
}

function isVideo(item: any) {
  if (item.mime && item.mime.toLowerCase().startsWith('video/')) {
    return true
  }
  return false
}

function getUrl(item: any, width) {
  let url = item.url
  if (width) {
    url += !item.url.includes('?') ? '?' : '&' // 判断是否有问号
    url += `width=${width}`
  }
  return url
}

function printImage() {
  if (getDataModel.value.list.length === 0)
    return
  const list = checkList.value.filter(q => isImage(q))
  if (list.length === 0) {
    printJS({
      printable: getDataModel.value.list.filter(q => isImage(q)).map(m => m.url),
      type: 'image',
    })
    return
  }
  printJS({
    printable: list.map(m => m.url),
    type: 'image',
  })
}

function play(item: any) {
  playerOptions.sources[0]!.src = item.url
  playerOptions.sources[0]!.type = item.mime

  videoModal.open()
}

//     url,
//     filterModel.xid,

async function show(opt: ManagerType) {
  checkList.value = []
  const data = Object.assign({ mark: '附件', canUpload: true, canRemove: true }, opt)
  canRemove.value = data.canRemove
  canUpload.value = data.canUpload
  filterModel.page = 1
  filterModel.xid = data.xid
  filterModel.mark = data.mark
  filterModel.name = ''
  await manager.fetch()
  fileManagerModal.setProps({ mask: props.mask, draggable: true })
  fileManagerModal.open()

  uploader.opts.headers = {
    Authorization: `${token.get()?.token_type} ${token.get()?.access_token}`,
  }
}

function initialize() {
  if (!isInitialize) {
    isInitialize = true
    uploader.assignBrowse(unref(uploadRef).$el)
  }
}

const imageGroupThemeOverrides = computed(() => {
  const { popoverColor, boxShadow2, textColor2, borderRadius } = useThemeVars().value
  const themeOverrides: NonNullable<GlobalThemeOverrides['Image']> = {
    toolbarColor: popoverColor,
    toolbarBoxShadow: boxShadow2,
    toolbarIconColor: textColor2,
    toolbarBorderRadius: borderRadius,
  }
  return themeOverrides
})

const exposed: FileManagerInst = {
  show,
}

defineExpose(exposed)
</script>

<template>
  <SpModal :title="props.title" width="940" height="740" @register="modalRegister" @show="initialize">
    <template #default>
      <div class="bar">
        <n-flex :wrap="false">
          <n-radio-group v-model:value="viewType">
            <n-radio-button value="列表">
              列表
            </n-radio-button>
            <n-radio-button value="卡片">
              卡片
            </n-radio-button>
          </n-radio-group>
          <n-input-group>
            <n-input v-model:value="filterModel.name" />
            <n-button type="primary" ghost @click="search">
              搜索
            </n-button>
          </n-input-group>
        </n-flex>
        <div>
          <n-pagination
            :page="getDataModel.page"
            :item-count="getDataModel.itemCount"
            :page-size="getDataModel.pageSize"
            :page-slot="5"
            @update:page="updatePage"
          >
            <template #prefix="{ itemCount }">
              共 {{ itemCount }} 条
            </template>
          </n-pagination>
        </div>
      </div>
      <div v-show="viewType === '卡片'" class="img-group flex flex-wrap content-start justify-start">
        <n-image-group :theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip>
          <div
            v-for="(item, index) in getDataModel.list"
            :key="index"
            class="img-list mx-2.5 py-2.5"
          >
            <div
              class="img flex content-center items-center justify-center"
              :class="{ active: checkList.includes(item) }"
            >
              <n-image
                v-if="isImage(item)"
                width="100"
                :preview-src="item.url"
                :src="getUrl(item, 100)"
              />
              <n-icon
                v-else
                size="80"
                @click.stop="isPreviewableKind(kindOf(item)) ? openPreview(item) : isVideo(item) ? play(item) : handleDownFile(item)"
              >
                <Icon :icon="getFileIcon(kindOf(item))" />
              </n-icon>
              <div
                class="icon-list flex items-center justify-center divide-x divide-white divide-opacity-30"
              >
                <div class="list flex items-center justify-center" @click="handleImageClick(item)">
                  <n-icon size="14">
                    <Icon icon="ant-design:check-square-outlined" />
                  </n-icon>
                </div>
                <div
                  v-if="canRemove"
                  class="list flex items-center justify-center"
                  @click.stop="handleRemove([item])"
                >
                  <n-icon size="14">
                    <Icon icon="ant-design:close-outlined" />
                  </n-icon>
                </div>
              </div>
            </div>
            <div class="text px-1 py-1.5 text-center">
              <n-ellipsis> {{ item.name }}{{ item.extension }} </n-ellipsis>
            </div>
          </div>
        </n-image-group>
      </div>
      <div v-show="viewType === '列表'" class="text-box">
        <n-image-group :theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip>
          <div
            v-for="(item, index) in getDataModel.list"
            :key="index"
            class="text-box-list mb-1 flex items-center px-2 py-2"
            :class="{ active: checkList.includes(item) }"
          >
            <div class="img mr-4 flex items-center justify-center">
              <n-image
                v-if="isImage(item)"
                width="40"
                :preview-src="item.url"
                :src="getUrl(item, 40)"
              />
              <n-icon v-else size="40">
                <Icon :icon="getFileIcon(kindOf(item))" />
              </n-icon>
            </div>
            <div class="content flex-1" @click="handleImageClick(item)">
              <p class="title mb-0.5 text-base">
                <n-ellipsis> {{ item.name }}{{ item.extension }} </n-ellipsis>
              </p>
              <p class="text flex text-xs">
                <n-flex>
                  <span>文件大小：{{ item.size }}</span>
                  <span v-if="item.scale">图片尺寸：{{ item.scale }}</span>
                  <span>创建时间：{{ item.ctime }}</span>
                </n-flex>
              </p>
            </div>
            <div class="bt px-5">
              <n-flex>
                <n-button v-if="isImage(item)" text type="primary" @click="handleImageClick(item)">
                  选择
                </n-button>
                <n-button v-else-if="isPreviewableKind(kindOf(item))" text type="primary" @click="openPreview(item)">
                  预览
                </n-button>
                <n-button v-else-if="isVideo(item)" text type="primary" @click="play(item)">
                  播放
                </n-button>
                <n-button text type="primary" @click="handleDownFile(item)">
                  下载
                </n-button>
                <n-button v-if="canRemove" text type="primary" @click="handleRemove([item])">
                  删除
                </n-button>
              </n-flex>
            </div>
          </div>
        </n-image-group>
      </div>
    </template>
    <template #footer>
      <n-flex justify="end" :wrap="false">
        <div v-show="uploading" class="mt-3 w-[30]">
          <n-progress
            type="line"
            :color="themeVars.primaryColor"
            rail-color="rgba(128, 128, 128, 0.25)"
            :percentage="percentage"
            :show-indicator="true"
            indicator-placement="inside"
            processing
          />
        </div>
        <n-button
          v-show="canUpload"
          ref="uploadRef"
          type="primary"
          :loading="uploading"
          :disabled="uploading"
        >
          上传
        </n-button>
        <n-button v-if="canRemove" type="primary" @click="handleRemove(checkList)">
          删除
        </n-button>
        <n-button v-if="getDataModel.list.filter(q => isImage(q)).length !== 0" type="primary" @click="printImage">
          打印图片
        </n-button>
        <n-button v-if="props.type !== ''" type="primary" @click="handleOk">
          确定
        </n-button>
        <n-button @click="fileManagerModal.close()">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>

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
  .img-group {
  --color: #03a9f4;
  border: 1px solid #eaeaea;
  height: 500px;
  overflow-y: auto;
  .img-list {
    width: 100px;
    .img {
      width: 100%;
      height: 100px;
      position: relative;
      transition: all 0.3s ease-in-out;
      &.active {
        border: 5px solid var(--color);
        padding: 2px;
      }
      img {
        width: 100%;
        height: 100%;
      }
      .icon-list {
        position: absolute;
        margin: auto;
        width: 100%;
        height: 26px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease-in-out;
        bottom: 0;
        margin: auto;
        background-color: var(--color);
        .list {
          flex: 1;
          cursor: pointer;
        }
        .n-icon {
          position: relative;
          color: #fff;
        }
      }
      &:hover {
        .icon-list {
          visibility: visible;
          opacity: 0.9;
        }
      }
    }
    .text {
      display: block;
      font-size: 14px;
    }
  }
}

.text-box {
  height: 500px;
  overflow-y: auto;
  &-list {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease-in-out;
    position: relative;
    .img {
      width: 40px;
      height: 40px;
    }
    .content {
      .text {
        color: rgb(107, 114, 128);
      }
    }
    &::before {
      display: block;
      content: '';
      height: 100%;
      width: 0;
      background-color: #03a9f4;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      transition: all 0.3s ease-in-out;
    }
    &.active {
      background-color: rgba(3, 169, 244, 0.1);
      padding-left: 20px;
      .check-icon {
        opacity: 1;
        visibility: visible;
      }
      &::before {
        width: 10px;
        opacity: 1;
      }
    }
    &:first-child {
      border-top-color: transparent;
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .img-group {
    --color: #03a9f4;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .text-box {
    &-list {
      border-top-color: rgba(255, 255, 255, 0.1);
      .content {
        .text {
          color: rgb(255, 255, 255);
        }
      }
      &.active {
        background-color: rgba(3, 169, 244, 0.3);
      }
      &:first-child {
        border-top-color: transparent;
      }
    }
  }
}

.bar {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}
</style>
