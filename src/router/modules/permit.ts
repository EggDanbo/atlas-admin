import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/permit',
    name: 'permit',
    meta: {
      title: '用户权限',
      icon: 'ant-design:sisternode-outlined',
      permissions: ['PERMIT_ROLE', 'PERMIT_USER_ROLE', 'PERMIT_GROUP'],
      alwaysShow: true,
      sort: 85,
    },
    children: [
      {
        path: 'role',
        name: 'PermitRole',
        meta: {
          title: '角色设置',
          permissions: ['PERMIT_ROLE'],
          keepAlive: true,
        },
        component: () => import('@/views/permit/role/index.vue'),
      },
      {
        path: 'user',
        name: 'PermitUser',
        meta: {
          title: '用户权限',
          permissions: ['PERMIT_USER_ROLE'],
          keepAlive: true,
        },
        component: () => import('@/views/permit/user/index.vue'),
      },
      {
        path: 'group',
        name: 'PermitGroup',
        meta: {
          title: '分组权限',
          permissions: ['PERMIT_GROUP'],
          keepAlive: true,
        },
        component: () => import('@/views/permit/group/index.vue'),
      },
    ],
  },
]
export default routes
