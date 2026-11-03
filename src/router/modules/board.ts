import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/board',
    name: 'Board',
    redirect: '/board/home',
    meta: {
      title: '我的看板',
      icon: 'ant-design:dashboard-outlined',
      sort: 1,
    },
    children: [
      {
        path: 'home',
        name: 'BoardHome',
        meta: {
          title: '工作台',
          keepAlive: true,
          affix: true,
        },
        component: () => import('@/views/board/home/index.vue'),
      },
      {
        path: 'monitor',
        name: 'BoardMonitor',
        meta: {
          title: '监控台',
          permissions: ['DEMO_BOARD_MONITOR'],
          keepAlive: true,
        },
        component: () => import('@/views/board/monitor/index.vue'),
      },
    ],
  },
]

export default routes
