/**
 * 消息模块类型
 * 类型定义在 typings/message.d.ts 中全局可用
 */

import type { SelectOption } from 'naive-ui'

/** 消息类型选项（用于 Naive UI Select） */
export const messageTypeOptions: SelectOption[] = [
  { label: '待办', value: 0 },
  { label: '消息', value: 1 },
  { label: '通知', value: 2 },
]

/** 消息发送类型选项（运行时常量） */
export const messageSendTypeOptions: SelectOption[] = [
  { label: '选择用户', value: '0' },
  { label: '全部操作员', value: '1' },
  { label: '全部审批人', value: '2' },
  { label: '所有人', value: '3' },
]
