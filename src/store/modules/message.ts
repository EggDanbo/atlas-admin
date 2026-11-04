import { defineStore } from 'pinia'
import { useGlobSetting } from '@/hooks/setting'
import api from '@/service/api/message'
import bus from '@/utils/bus'

export const useMessageStore = defineStore('message-store', () => {
  // ============ State ============

  /** 未读消息数量 */
  const unreadCount = ref(0)

  /** 未读消息列表 */
  const unreadMessages = ref<Message.Item[]>([])

  /** 当前筛选类型 */
  const filterType = ref<Message.Type | null>(null)

  /** 是否已初始化监听 */
  const initialized = ref(false)

  /** 消息处理器引用 */
  let messageHandler: ((item: unknown) => Promise<void>) | null = null

  // ============ Getters ============

  /** 获取 messageKind */
  const messageKind = computed(() => {
    const globSetting = useGlobSetting()
    return globSetting.messageKind
  })

  // ============ Actions ============

  /** 获取未读消息 */
  async function fetchUnread() {
    const { isSuccess, data } = await api.getUnRead(
      messageKind.value,
      filterType.value ?? undefined,
    )
    if (!isSuccess)
      return

    unreadCount.value = data.count
    unreadMessages.value = (data.list || []).slice(0, 10)
  }

  /** 标记单条已读 */
  async function markRead(id: string) {
    const { isSuccess } = await api.read(id)
    if (!isSuccess)
      return false

    // 乐观更新
    const index = unreadMessages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      unreadMessages.value.splice(index, 1)
    }
    unreadCount.value = Math.max(0, unreadCount.value - 1)

    return true
  }

  /** 标记全部已读 */
  async function markAllRead() {
    const { isSuccess } = await api.readAll(
      messageKind.value,
      filterType.value ?? undefined,
    )
    if (!isSuccess)
      return false

    // 乐观更新：清空列表
    unreadMessages.value = []
    unreadCount.value = 0

    return true
  }

  /** 设置筛选类型 */
  function setFilterType(type: Message.Type | null) {
    filterType.value = type
    fetchUnread()
  }

  /** 初始化通知监听 */
  function initNotification(onMessage?: (msg: Message.Notification) => void) {
    if (initialized.value)
      return

    messageHandler = async (item: unknown) => {
      const msg = item as Message.Notification
      // 仅处理匹配当前 kind 的消息
      if (msg?.biz_id !== '0' && msg?.biz_name && msg.kind === messageKind.value) {
        // 触发外部回调
        onMessage?.(msg)
        // 刷新未读计数
        await fetchUnread()
      }
    }

    bus.on('message', messageHandler)
    initialized.value = true
  }

  /** 销毁通知监听 */
  function destroyNotification() {
    if (messageHandler) {
      bus.off('message', messageHandler)
      messageHandler = null
    }
    initialized.value = false
  }

  return {
    unreadCount,
    unreadMessages,
    filterType,
    messageKind,
    fetchUnread,
    markRead,
    markAllRead,
    setFilterType,
    initNotification,
    destroyNotification,
  }
})
