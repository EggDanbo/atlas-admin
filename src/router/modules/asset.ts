import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/asset',
    name: 'Asset',
    meta: {
      title: '资产管理',
      icon: 'ant-design:gold-outlined',
      permissions: [
        'AST_INFO',
        'AST_APPLY',
        'AST_ORDER',
        'AST_BATCH',
        'AST_ALLOT',
        'AST_LEASE',
        'AST_RESUME',
        'AST_DISUSE',
        'AST_CHECK',
        'AST_VALUE',
        'AST_REPAIR',
      ],
      alwaysShow: true,
      sort: 40,
    },
    children: [
      {
        path: 'info',
        name: 'AssetInfo',
        meta: {
          title: '资产台账',
          permissions: ['AST_INFO'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/info/index.vue'),
      },
      {
        path: 'apply',
        name: 'AssetApply',
        meta: {
          title: '领用申请',
          permissions: ['AST_APPLY'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/apply/index.vue'),
      },
      {
        path: 'order',
        name: 'AssetOrder',
        meta: {
          title: '采购申请',
          permissions: ['AST_ORDER'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/order/index.vue'),
      },
      {
        path: 'batch',
        name: 'AssetBatch',
        meta: {
          title: '验收入库',
          permissions: ['AST_BATCH'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/batch/index.vue'),
      },
      {
        path: 'allot',
        name: 'AssetAllot',
        meta: {
          title: '调拨',
          permissions: ['AST_ALLOT'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/allot/index.vue'),
      },
      {
        path: 'lease',
        name: 'AssetLease',
        meta: {
          title: '借出',
          permissions: ['AST_LEASE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/lease/index.vue'),
      },
      {
        path: 'resume',
        name: 'AssetResume',
        meta: {
          title: '归还',
          permissions: ['AST_RESUME'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/resume/index.vue'),
      },
      {
        path: 'disuse',
        name: 'AssetDisuse',
        meta: {
          title: '处置',
          permissions: ['AST_DISUSE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/disuse/index.vue'),
      },
      {
        path: 'check',
        name: 'AssetCheck',
        meta: {
          title: '盘点',
          permissions: ['AST_CHECK'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/check/index.vue'),
      },
      {
        path: 'value',
        name: 'AssetValue',
        meta: {
          title: '折旧',
          permissions: ['AST_VALUE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/value/index.vue'),
      },
      {
        path: 'repair',
        name: 'AssetRepair',
        meta: {
          title: '维保',
          permissions: ['AST_REPAIR'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/repair/index.vue'),
      },
    ],
  },
]

export default routes
