/**
 * 消息模块类型定义
 */
declare namespace Message {
  /** 消息类型（数字值） */
  type Type = 0 | 1 | 2

  /** 消息类型选项（value 为字符串，用于 Naive UI Select） */
  interface TypeOption {
    label: string
    value: string
  }

  /** WebSocket 推送的原始消息 */
  interface Notification {
    id: string
    kind: string
    title: string
    content: string
    types: Type
    biz_id: string
    biz_name: string
    ctime: string
    eventid: string
  }

  /** 消息列表项 */
  interface Item {
    id: string
    title: string
    content?: string
    ctime: string
    utime?: number
    biz_id: string
    biz_name: string
    types?: Type
  }

  /** 发送消息模型 */
  interface SendModel {
    types: string
    user_id: string[]
    content: string
  }

  /** 发送类型选项 */
  interface SendTypeOption {
    label: string
    value: string
  }
}
