/**
 * 消息模块本地类型
 * 类型定义在 typings/message.d.ts 中全局可用
 */

/** 读取状态选项 */
export const readStatusOptions = [
  { label: '未读', value: '未读' },
  { label: '已读', value: '已读' },
] as const

/** 筛选模型 */
export interface MessageFilterModel {
  page: number
  date: [number, number] | null
  read: string | null
  types: Message.Type | null
  title: string | null
  biz_id: string | null
}
