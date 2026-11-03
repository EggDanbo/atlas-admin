import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: '/dashboard/overview',
    meta: {
      title: '工作台',
      icon: 'ant-design:appstore-outlined',
      sort: 1,
    },
    children: [
      {
        path: 'overview',
        name: 'DashboardOverview',
        meta: {
          title: '概览',
          keepAlive: true,
          affix: true,
        },
        component: () => import('@/views/dashboard/overview/index.vue'),
      },
      {
        path: 'monitor',
        name: 'DashboardMonitor',
        meta: {
          title: '运营监控',
          permissions: ['DASH_MONITOR'],
          keepAlive: true,
        },
        component: () => import('@/views/dashboard/monitor/index.vue'),
      },
    ],
  },
]

export default routes
