import { uuid } from './uuid'

// 扩展 NotificationOptions 类型以包含 renotify
interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean
}

const NotificationConstructor
  = window.Notification || (window as any)['mozNotification'] || (window as any)['webkitNotification']

function send(title: string, body: string, tag?: string) {
  if (!tag)
    tag = `notify-${uuid()}`
  const options: ExtendedNotificationOptions = {
    dir: 'auto',
    lang: 'zh-CN',
    tag,
    // icon: '', //通知的缩略图,//icon 支持ico、png、jpg、jpeg格式
    body, // 通知的具体内容
    requireInteraction: true,
    renotify: true,
  }
  const notify = new NotificationConstructor(title, options)
  notify.addEventListener('click', () => {
    // 如果通知消息被点击,通知窗口将被激活
    window.focus()
  })
}

export function notify(title: string, body: string, tag?: string) {
  if (!NotificationConstructor) {
    return
  }

  if (NotificationConstructor.permission === 'granted') {
    send(title, body, tag)
    // console.log('用户允许通知');
  }
  else if (NotificationConstructor.permission === 'denied') {
    // console.log('用户拒绝通知');
  }
  else {
    NotificationConstructor.requestPermission((status) => {
      if (status === 'granted') {
        send(title, body, tag)
      }
      else if (status === 'denied') {
        // console.log('用户拒绝通知');
      }
    })
  }
}
