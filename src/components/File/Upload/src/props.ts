import type { PropType } from 'vue'
import { EXT_MIME_MAP } from '@/components/File/shared'

export const basicProps = {
  /**
   * 限制图片上传类型
   */
  acceptImage: {
    type: Array as PropType<string[]>,
    default: [
      'image/png',
      'image/jpg',
      'image/bmp',
      'image/jpeg',
      'image/pjpeg',
      'image/gif',
      'image/svg+xml',
    ],
  },
  /**
   * 限制文件上传类型；默认取 EXT_MIME_MAP 全量 MIME，调用方可通过 props.accepts 收窄/覆盖
   */
  accepts: {
    type: Array as PropType<string[]>,
    default: () => Object.values(EXT_MIME_MAP).flat(),
  },
  /** 文件大小限制 单位:MB */
  maxSize: {
    type: Number as PropType<number>,
    default: 50,
  },
  //* *最大数量 */
  maxNumber: {
    type: Number as PropType<number>,
    default: Infinity,
  },
  value: {
    type: Array as PropType<FileStorage.FileResourceModel[] | null>,
    default: () => [],
  },
  width: {
    type: Number as PropType<number>,
    default: 150,
  },
  height: {
    type: Number as PropType<number>,
    default: 150,
  },
  uploadTitle: {
    type: String,
    default: '上传文件',
  },
  /** 限制只允许上传图片 */
  onlyImage: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  center: {
    type: Boolean,
    default: false,
  },
  /** 是否开启水印 */
  watermark: {
    type: Boolean,
    default: null,
  },
  /** 水印位置，根据小键盘方式定位1~9，默认：3 */
  watermarkPos: {
    type: Number as PropType<number>,
    default: null,
  },
  /** 水印内容，默认为时间 */
  watermarkText: {
    type: String,
    default: null,
  },
  /** 是否显示文件名，默认显示 */
  showFileName: {
    type: Boolean,
    default: true,
  },
}
