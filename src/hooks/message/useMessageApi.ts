import { useGlobSetting } from '@/hooks/setting'
import api from '@/service/api/message'

/**
 * 消息 API 操作（无状态，纯函数）
 * 用于需要独立数据管理的场景（如消息中心页面）
 */
export function useMessageApi() {
  const globSetting = useGlobSetting()
  const messageKind = globSetting.messageKind

  /** 标记已读 */
  async function markRead(id: string) {
    const { isSuccess } = await api.read(id)
    return isSuccess
  }

  /** 标记全部已读 */
  async function markAllRead(kind?: string, types?: Message.Type) {
    const { isSuccess } = await api.readAll(kind ?? messageKind, types)
    return isSuccess
  }

  /** 获取未读消息 */
  async function fetchUnread(kind?: string, types?: Message.Type) {
    const { isSuccess, data } = await api.getUnRead(kind ?? messageKind, types)
    return isSuccess ? data : null
  }

  /** 发送消息 */
  async function send(data: Message.SendModel) {
    const { isSuccess } = await api.massSend({
      type: data.types,
      receive_user_id: data.user_id,
      content: data.content,
    })
    return isSuccess
  }

  /** 搜索消息 */
  async function search(params: Recordable) {
    const { isSuccess, data } = await api.search(params)
    return isSuccess ? data : null
  }

  return {
    markRead,
    markAllRead,
    fetchUnread,
    send,
    search,
    messageKind,
  }
}
