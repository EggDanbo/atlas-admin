/**
 * 非登录授权路由
 */

import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: '/screen',
  //   name: 'Screen',
  //   component: () => import('@/views/screen/index.vue'),
  //   meta: {
  //     title: '预警监控',
  //     hidden: true,
  //   },
  // },
  // 内置文件预览页仅开发模式注册（本地调试用）；生产由独立 file-viewer 服务承接。
  // 注意：必须写字面量 import.meta.env.DEV（不能用 isDevMode()），否则构建期
  // 无法静态替换做死代码消除，预览页及其依赖会重新混进生产包
  ...(import.meta.env.DEV
    ? [{
      path: '/file-viewer',
      name: 'FileViewer',
      component: () => import('@/views/preview/index.vue'),
      meta: {
        title: '文件预览',
        hidden: true,
      },
    } satisfies RouteRecordRaw]
    : []),
]

export default routes
