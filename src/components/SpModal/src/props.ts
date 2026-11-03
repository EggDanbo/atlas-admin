import { VxeModal } from 'vxe-pc-ui'

export const modalExtendProps = {
  ...VxeModal.props,
  // =============== 为了更方便使用 设置一些默认值 ==============
  mask: {
    type: Boolean,
    default: false,
  },
  lockView: {
    type: Boolean,
    default: false,
  },
  resize: {
    type: Boolean,
    default: false,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  transfer: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  maskClosable: {
    type: Boolean,
    default: false,
  },
  // ================== 扩展属性 ==================
  /** 确定按钮文案 */
  okText: {
    type: String,
    default: '确定',
  },
  /** 取消按钮文案 */
  cancelText: {
    type: String,
    default: '关闭',
  },
  enabledOk: {
    type: Boolean,
    default: true,
  },
  showOk: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  enabledPadding: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function,
    default: null,
  },
}

export type SpModalProps = ExtractPublicPropTypes<typeof modalExtendProps>
