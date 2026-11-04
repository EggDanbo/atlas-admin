import type { HubConnection, IHttpConnectionOptions } from '@microsoft/signalr'
import {
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr'
import { getApiBaseUrl } from '@/hooks/setting'
import { useUserStore } from '@/store/modules/user'
import bus from '@/utils/bus'
import sleep from '@/utils/sleep'

import token from '@/utils/token'

async function accessTokenFactory() {
  let accessToken = token.get()
  if (token.isExpired(accessToken)) {
    // 尝试获取新的token
    const userStore = useUserStore()
    const info = await userStore.asyncUserInfo()
    if (info && info.userid) {
      accessToken = token.get()
    }
  }
  return accessToken?.access_token
}

/**
 * 通信连接封装
 */
class Communication {
  /** 连接状态 */
  connected: boolean = false
  registerEvent: (connection: HubConnection) => void

  private connection: HubConnection | null = null

  constructor(registerEvent: (connection: HubConnection) => void) {
    this.registerEvent = registerEvent
  }

  /** 连接 */
  start() {
    if (this.connection != null || this.connected === true)
      return
    this.connection = this.createConnection()
    this.connection.onclose(async () => {
      this.connected = false

      // SignalR 自动重连失败后触发 onclose, 重新启动连接
      await sleep(2000)
      await this.connect()
    })
    this.connection.onreconnecting(() => {
      this.connected = false
    })
    this.connection.onreconnected(() => {
      this.connected = true
    })

    // 注册业务事件
    this.registerEvent(this.connection)

    this.connect()
  }

  /** 断开 */
  async stop() {
    if (this.connection != null) {
      try {
        await this.connection.stop()
      }
      catch {
        // 连接已断开，忽略
      }
    }
    this.connected = false
    this.connection = null
  }

  /** 使用指数计算重连等待时间，防止频繁连接 */
  private calculateExponentialDelay(
    retriesAttempted: number,
    baseDelay = 100,
    maxBackOffMs = 1000 * 20,
  ) {
    if (retriesAttempted <= 0) {
      return baseDelay
    }
    const MaxRetries = 30
    const retries = Math.min(retriesAttempted, MaxRetries)
    return Math.min((1 << retries) * baseDelay, maxBackOffMs)
  }

  private async connect() {
    if (this.connection == null)
      return
    let retries = 0
    while (true) {
      try {
        await this.connection.start()
        this.connected = true
        this.health()
        break
      }
      catch {
        // 连接失败，按指数退避后重试
      }
      await sleep(this.calculateExponentialDelay(++retries))
    }
  }

  private createConnection(): HubConnection {
    const baseUrl = getApiBaseUrl()
    const connection = new HubConnectionBuilder()
      .configureLogging(LogLevel.Error)
      .withUrl(`${baseUrl}/communication/user`, {
        accessTokenFactory,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 0-4次：间隔1秒
          if (retryContext.previousRetryCount < 5) {
            return 1000
          }
          // 5-9次：间隔1.5秒
          if (retryContext.previousRetryCount < 10) {
            return 1500
          }
          // 10-19次：间隔2秒
          if (retryContext.previousRetryCount < 20) {
            return 2000
          }
          // 20-49次：间隔5秒
          if (retryContext.previousRetryCount < 50) {
            return 5000
          }
          // 50次以上：间隔10秒
          return 1000 * 10
        },
      })
      .build()
    return connection
  }

  /** 维持服务端心跳,30秒发送一次 */
  private async health() {
    const currentConnection = this.connection
    while (this.connection === currentConnection && this.connected) {
      await sleep(30 * 1000)
      if (this.connection === currentConnection && this.connected) {
        this.connection?.send('Health')
      }
    }
  }
}

// 注册事件
function registerEvent(connection: HubConnection) {
  // 欢迎
  connection.on('Welcome', () => {
  })
  // 消息通知
  connection.on('Message', (data: Message.Notification) => {
    bus.emit('message', data)
  })
}

const communication = new Communication(registerEvent)

export default communication
