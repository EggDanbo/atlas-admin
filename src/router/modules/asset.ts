import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/asset',
    name: 'asset',
    meta: {
      title: '资产管理',
      icon: 'ant-design:laptop-outlined',
      permissions: [
        'DEMO_ASSET_INFO',
        'DEMO_ASSET_APPLY',
        'DEMO_ASSET_ORDER',
        'DEMO_ASSET_BATCH',
        'DEMO_ASSET_ALLOT',
        'DEMO_ASSET_LEND',
        'DEMO_ASSET_BACK',
        'DEMO_ASSET_DISUSE',
        'DEMO_ASSET_CHECK',
        'DEMO_ASSET_VALUE',
        'DEMO_ASSET_REPAIR',
      ],
      alwaysShow: true,
      sort: 40,
    },
    children: [
      {
        path: 'info',
        name: 'AssetInfo',
        meta: {
          title: '资产信息',
          permissions: ['DEMO_ASSET_INFO'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/info/index.vue'),
      },
      {
        path: 'apply',
        name: 'AssetApply',
        meta: {
          title: '资产申领',
          permissions: ['DEMO_ASSET_APPLY'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/apply/index.vue'),
      },
      {
        path: 'order',
        name: 'AssetOrder',
        meta: {
          title: '资产采购',
          permissions: ['DEMO_ASSET_ORDER'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/order/index.vue'),
      },
      {
        path: 'batch',
        name: 'AssetBatch',
        meta: {
          title: '资产验收',
          permissions: ['DEMO_ASSET_BATCH'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/batch/index.vue'),
      },
      {
        path: 'allot',
        name: 'AssetAllot',
        meta: {
          title: '资产调拨',
          permissions: ['DEMO_ASSET_ALLOT'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/allot/index.vue'),
      },
      {
        path: 'lease',
        name: 'AssetLease',
        meta: {
          title: '资产借用',
          permissions: ['DEMO_ASSET_LEASE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/lease/index.vue'),
      },
      {
        path: 'resume',
        name: 'AssetResume',
        meta: {
          title: '资产归还',
          permissions: ['DEMO_ASSET_RESUME'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/resume/index.vue'),
      },
      {
        path: 'disuse',
        name: 'AssetDisuse',
        meta: {
          title: '资产处置',
          permissions: ['DEMO_ASSET_DISUSE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/disuse/index.vue'),
      },
      {
        path: 'check',
        name: 'AssetCheck',
        meta: {
          title: '资产盘点',
          permissions: ['DEMO_ASSET_CHECK'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/check/index.vue'),
      },
      {
        path: 'value',
        name: 'AssetValue',
        meta: {
          title: '资产折旧',
          permissions: ['DEMO_ASSET_VALUE'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/value/index.vue'),
      },
      {
        path: 'repair',
        name: 'AssetRepair',
        meta: {
          title: '资产维保',
          permissions: ['DEMO_ASSET_REPAIR'],
          keepAlive: true,
        },
        component: () => import('@/views/asset/repair/index.vue'),
      },
    ],
  },
]
export default routes
