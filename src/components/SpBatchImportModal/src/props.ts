import { propTypes } from '@/utils/propTypes'

export const batchImportModalProps = {
  /** 模板下载路径（如 /template/team-import.xlsx） */
  templateDownloadUrl: {
    type: String as PropType<string>,
    required: true,
  },
  /** 提示列表，为空时使用内置默认提示 */
  tips: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 允许上传的文件 MIME 类型 */
  accept: {
    type: Array as PropType<string[]>,
    default: () => [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/wps-office.xlsx',
    ],
  },
  /** 最大文件大小（MB） */
  maxSize: propTypes.number.def(500),
  /** 弹窗标题 */
  title: {
    type: String as PropType<string>,
    default: '批量导入',
  },
  /** 下载导入检查文件 */
  checkFileDownloadUrl: {
    type: String as PropType<string | null>,
    default: null,
  },
  /** 下载导入检查文件信息 */
  checkFileMessage: {
    type: String as PropType<string | null>,
    default: null,
  },
}

export const batchImportCheckModalProps = {
  /** 下载导入检查文件 */
  checkFileDownloadUrl: {
    type: String as PropType<string | null>,
    default: null,
  },
  /** 下载导入检查文件信息 */
  checkFileMessage: {
    type: String as PropType<string | null>,
    default: null,
  },
}
