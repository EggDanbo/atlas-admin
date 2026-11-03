/**
 * Naive UI 消息提示工具
 * 封装 Message、Dialog、LoadingBar 组件的便捷调用方法
 */

import type { DialogOptions, MessageOptions } from 'naive-ui'
import { useDialog } from '@/hooks/naiveui/useDialog'
import { useLoadingBar } from '@/hooks/naiveui/useLoadingBar'
import { useMessage } from '@/hooks/naiveui/useMessage'

// ==================== 类型定义 ====================

/** 消息类型 */
type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading'

/** 对话框类型 */
type DialogType = 'info' | 'success' | 'error' | 'warning'

// ==================== 实例初始化 ====================

const $dialog = useDialog()
const $message = useMessage()
const $loadingBar = useLoadingBar()

// ==================== 消息提示 ====================

/** 消息方法映射表 */
const messageHandlers = {
  info: $message.info.bind($message),
  success: $message.success.bind($message),
  error: $message.error.bind($message),
  warning: $message.warning.bind($message),
  loading: $message.loading.bind($message),
} as const

/**
 * 统一消息提示
 * @param message - 消息内容
 * @param type - 消息类型
 * @param config - Naive UI Message 配置项
 */
function msg(message: string, type: MessageType, config?: MessageOptions): void {
  if (!message?.trim())
    return
  if (type === 'loading')
    return
  messageHandlers[type](message, config)
}

/**
 * 销毁所有消息提示
 */
export function destroyAll(): void {
  $message.destroyAll()
}

/** 信息提示 */
export function info(message: string, config?: MessageOptions): void {
  msg(message, 'info', config)
}

/** 成功提示 */
export function success(message: string, config?: MessageOptions): void {
  msg(message, 'success', config)
}

/** 错误提示 */
export function error(message: string, config?: MessageOptions): void {
  msg(message, 'error', config)
}

/** 警告提示 */
export function warning(message: string, config?: MessageOptions): void {
  msg(message, 'warning', config)
}

/** 加载提示 */
export function loading(message: string, config?: MessageOptions): void {
  if (!message?.trim())
    return
  $message.loading(message, config)
}

// ==================== 对话框 ====================

/** 对话框方法映射表 */
const dialogHandlers = {
  info: $dialog.info.bind($dialog),
  success: $dialog.success.bind($dialog),
  error: $dialog.error.bind($dialog),
  warning: $dialog.warning.bind($dialog),
} as const

/** 默认对话框配置 */
const DEFAULT_DIALOG_CONFIG: Partial<DialogOptions> = {
  title: '提示',
} as const

/**
 * 统一对话框提示
 * @param content - 对话框内容
 * @param type - 对话框类型
 * @param config - Naive UI Dialog 配置项
 */
function modal(content: string, type: DialogType, config?: DialogOptions): void {
  if (!content?.trim())
    return

  const conf = {
    ...DEFAULT_DIALOG_CONFIG,
    content,
    ...config,
  }

  dialogHandlers[type](conf)
}

/** 信息对话框 */
export function infoModal(content: string, config?: DialogOptions): void {
  modal(content, 'info', config)
}

/** 成功对话框 */
export function successModal(content: string, config?: DialogOptions): void {
  modal(content, 'success', config)
}

/** 错误对话框 */
export function errorModal(content: string, config?: DialogOptions): void {
  modal(content, 'error', config)
}

/** 警告对话框 */
export function warningModal(content: string, config?: DialogOptions): void {
  modal(content, 'warning', config)
}

// ==================== 加载条 ====================

/** 开始加载条 */
export function startBar(): void {
  $loadingBar.start()
}

/** 错误加载条 */
export function errorBar(): void {
  $loadingBar.error()
}

/** 完成加载条 */
export function finishBar(): void {
  $loadingBar.finish()
}

// ==================== 导出 ====================

export default {
  info,
  success,
  error,
  warning,
  loading,
  destroyAll,
  infoModal,
  successModal,
  errorModal,
  warningModal,
  startBar,
  errorBar,
  finishBar,
}
