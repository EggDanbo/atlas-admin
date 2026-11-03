import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/external',
    name: 'external',
    meta: {
      title: '外部接口',
      icon: 'ant-design:merge-outlined',
      permissions: ['EXTERNAL_ROLE', 'EXTERNAL_ACCOUNT'],
      alwaysShow: true,
      sort: 88,
    },
    children: [
      {
        path: 'role',
        name: 'ExternalRole',
        meta: {
          title: '角色设置',
          permissions: ['EXTERNAL_ROLE'],
          keepAlive: true,
        },
        component: () => import('@/views/permit/external/role/index.vue'),
      },
      {
        path: 'account',
        name: 'ExternalAccount',
        meta: {
          title: '账号管理',
          permissions: ['EXTERNAL_ACCOUNT'],
          keepAlive: true,
        },
        component: () => import('@/views/permit/external/account/index.vue'),
      },
    ],
  },
]
export default routes
