import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/paper',
    name: 'paper',
    meta: {
      title: '档案管理',
      icon: 'ant-design:save-outlined',
      permissions: [
        'DEMO_PAPER_INFO',
        'DEMO_PAPER_BORROW',
      ],
      alwaysShow: true,
      sort: 70,
    },
    children: [
      {
        path: 'info',
        name: 'PaperInfo',
        meta: {
          title: '档案信息',
          permissions: ['DEMO_PAPER_INFO'],
          keepAlive: true,
        },
        component: () => import('@/views/paper/info/index.vue'),
      },
      {
        path: 'borrow',
        name: 'PaperBorrow',
        meta: {
          title: '档案借阅',
          permissions: ['DEMO_PAPER_BORROW'],
          keepAlive: true,
        },
        component: () => import('@/views/paper/borrow/index.vue'),
      },
    ],
  },
]
export default routes
