import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/access',
    name: 'Access',
    meta: {
      title: '组织与权限',
      icon: 'ant-design:cluster-outlined',
      permissions: [
        'IAM_UNIT',
        'IAM_MEMBER',
        'IAM_PARTNER',
        'IAM_ROLE',
        'IAM_GRANT',
        'IAM_GROUP',
      ],
      alwaysShow: true,
      sort: 80,
    },
    children: [
      {
        path: 'unit',
        name: 'AccessUnit',
        meta: {
          title: '组织单元',
          permissions: ['IAM_UNIT'],
          keepAlive: true,
        },
        component: () => import('@/views/access/unit/index.vue'),
      },
      {
        path: 'member',
        name: 'AccessMember',
        meta: {
          title: '成员',
          permissions: ['IAM_MEMBER'],
          keepAlive: true,
        },
        component: () => import('@/views/access/member/index.vue'),
      },
      {
        path: 'partner',
        name: 'AccessPartner',
        meta: {
          title: '外部协作',
          permissions: ['IAM_PARTNER'],
          keepAlive: true,
        },
        component: () => import('@/views/access/partner/index.vue'),
      },
      {
        path: 'role',
        name: 'AccessRole',
        meta: {
          title: '角色',
          permissions: ['IAM_ROLE'],
          keepAlive: true,
        },
        component: () => import('@/views/access/role/index.vue'),
      },
      {
        path: 'grant',
        name: 'AccessGrant',
        meta: {
          title: '授权',
          permissions: ['IAM_GRANT'],
          keepAlive: true,
        },
        component: () => import('@/views/access/grant/index.vue'),
      },
      {
        path: 'group',
        name: 'AccessGroup',
        meta: {
          title: '权限组',
          permissions: ['IAM_GROUP'],
          keepAlive: true,
        },
        component: () => import('@/views/access/group/index.vue'),
      },
      {
        path: 'partner-role',
        name: 'AccessPartnerRole',
        meta: {
          title: '合作方角色',
          permissions: ['IAM_PARTNER_ROLE'],
          keepAlive: true,
        },
        component: () => import('@/views/access/partner-role/index.vue'),
      },
      {
        path: 'partner-account',
        name: 'AccessPartnerAccount',
        meta: {
          title: '合作方账号',
          permissions: ['IAM_PARTNER_ACCOUNT'],
          keepAlive: true,
        },
        component: () => import('@/views/access/partner-account/index.vue'),
      },
    ],
  },
]

export default routes
