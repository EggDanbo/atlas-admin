import { NButton } from 'naive-ui'
import { h } from 'vue'
import { useMessageStore } from '@/store/modules/message'
import { notify } from '@/utils/notification'

export interface UseMessageNotificationOptions {
  /** 收到消息时的回调 */
  onMessage?: (msg: Message.Notification) => void
  /** 点击查看时的回调 */
  onView?: (msg: Message.Notification) => void
}

/**
 * 消息通知 Hook
 * 负责显示 Naive UI 通知 + 浏览器通知
 */
export function useMessageNotification(options: UseMessageNotificationOptions = {}) {
  const messageStore = useMessageStore()
  const { onMessage, onView } = options

  /** 启动通知监听 */
  function startNotification() {
    messageStore.initNotification((msg) => {
      // 1. 触发外部回调
      onMessage?.(msg)

      // 2. 显示 Naive UI 通知
      showNaiveNotification(msg)

      // 3. 显示浏览器通知
      notify(msg.title, msg.content, msg.id)
    })
  }

  /** 停止通知监听 */
  function stopNotification() {
    messageStore.destroyNotification()
  }

  /** 显示 Naive UI 通知 */
  function showNaiveNotification(msg: Message.Notification) {
    const hasBiz = !!msg.biz_name
    const n = window.$notification.info({
      title: msg.title,
      content: msg.content,
      action: hasBiz
        ? () =>
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                onClick: () => {
                  handleView(msg)
                  n.destroy()
                },
              },
              { default: () => '查看' },
            )
        : undefined,
      onClose: async () => {
        await messageStore.markRead(msg.id)
      },
    })
  }

  /** 处理查看消息 */
  async function handleView(msg: Message.Notification) {
    await messageStore.markRead(msg.id)
    onView?.(msg)
  }

  return {
    startNotification,
    stopNotification,
    showNaiveNotification,
    handleView,
  }
}
