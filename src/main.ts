import { createApp } from 'vue'
import { setupDirectives } from '@/directives'

import { setupI18n } from '@/locales'
import { setupRouter } from '@/router'
import {
  createAppLoading,
  setupGlobalComponent,
  setupNaiveDiscreteApi,
  setupPreloadData,
  setupProNaiveui,
  setupVideoPlayer,
  setupVxeTable,
} from '@/setups'
import { setupStore } from '@/store'
import App from './App.vue'
import '@unocss/reset/tailwind-compat.css'

import 'virtual:uno.css'
import '@/styles/index.less'

// 🔥 关键：在其他代码之前导入离线图标注册
// 这样图标会在应用启动时就注册完成
import '@/utils/iconify-offline'

async function install() {
  const app = createApp(App)
  // 挂载状态管理
  setupStore(app)

  // 创建 Loading
  await createAppLoading()

  // 设置全局组件
  setupGlobalComponent(app)

  // 国际化
  await setupI18n(app)

  // 挂载路由
  const router = setupRouter(app)

  // 挂载 naive-ui 脱离上下文的 Api
  setupNaiveDiscreteApi()

  // 按需全局安装 pro-naive-ui 组件
  setupProNaiveui(app)

  // 视频播放器
  setupVideoPlayer(app)

  // 文件预览组件（word/excel/ppt/pdf/markdown/代码/文本）
  // 仅开发模式启用内置预览；生产由独立 file-viewer 服务承接（VITE_FILE_PREVIEW_BASE）。
  // 注意：必须写字面量 import.meta.env.DEV（不能用 isDevMode()），否则构建期无法
  // 静态替换成 false 做死代码消除，@file-viewer 会重新混进生产包
  if (import.meta.env.DEV) {
    const { default: FileViewer } = await import('@file-viewer/vue3')
    app.use(FileViewer)
  }

  setupVxeTable(app)

  // 注册自定义指令
  setupDirectives(app)

  // 预加载基础数据（确保应用启动时数据已就绪）
  await setupPreloadData()

  // 挂载 #app
  router.isReady().then(() => {
    app.mount('#app')
  })
}

void install()
