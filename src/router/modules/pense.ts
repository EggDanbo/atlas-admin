import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/pense',
    name: 'pense',
    meta: {
      title: '费用报销',
      icon: 'ant-design:account-book-outlined',
      permissions: [
        'DEMO_PENSE_CONTRACT',
        'DEMO_PENSE_LIMIT',
        'DEMO_PENSE_ORDER',
        'DEMO_PENSE_TRAVEL',
        'DEMO_PENSE_SERVE',
        'DEMO_PENSE_APPLY',
        'DEMO_PENSE_BORROW',
        'DEMO_PENSE_ANSURE',
        'DEMO_PENSE_PAYER',
        'DEMO_PENSE_SETTLE',
        'DEMO_PENSE_QUERY',
      ],
      alwaysShow: true,
      sort: 50,
    },
    children: [
      {
        path: 'contract',
        name: 'PenseContract',
        meta: {
          title: '付款合同',
          permissions: ['DEMO_PENSE_CONTRACT'],
          keepAlive: true,
        },
        component: () => import('@/views/pense/contract/index.vue'),
      },
      {
        path: 'limit',
        name: 'PenseLimit',
        meta: {
          title: '费用额度',
          permissions: ['DEMO_PENSE_LIMIT'],
          keepAlive: true,
        },
        component: () => import('@/views/pense/limit/index.vue'),
      },
      {
        path: 'pre',
        name: 'PensePre',
        meta: {
          title: '事前申请',
          permissions: ['DEMO_PENSE_ORDER', 'DEMO_PENSE_TRAVEL', 'DEMO_PENSE_SERVE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'order',
            name: 'PensePreOrder',
            meta: {
              title: '采购申请',
              permissions: ['DEMO_PENSE_ORDER'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/order/index.vue'),
          },
          {
            path: 'travel',
            name: 'PensePreTravel',
            meta: {
              title: '出差申请',
              permissions: ['DEMO_PENSE_TRAVEL'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/travel/index.vue'),
          },
          {
            path: 'serve',
            name: 'PensePreServe',
            meta: {
              title: '招待申请',
              permissions: ['DEMO_PENSE_SERVE'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/serve/index.vue'),
          },
        ],
      },
      {
        path: 'pay',
        name: 'PensePay',
        meta: {
          title: '费用申请',
          permissions: ['DEMO_PENSE_APPLY', 'DEMO_PENSE_BORROW', 'DEMO_PENSE_ANSURE', 'DEMO_PENSE_PAYER'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'apply',
            name: 'PensePayApply',
            meta: {
              title: '报销申请',
              permissions: ['DEMO_PENSE_APPLY'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/apply/index.vue'),
          },
          {
            path: 'borrow',
            name: 'PensePayBorrow',
            meta: {
              title: '备用金申请',
              permissions: ['DEMO_PENSE_BORROW'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/borrow/index.vue'),
          },
          {
            path: 'ansure',
            name: 'PensePayAnsure',
            meta: {
              title: '保证金申请',
              permissions: ['DEMO_PENSE_ANSURE'],

              keepAlive: true,
            },
            component: () => import('@/views/pense/ansure/index.vue'),
          },
          {
            path: 'payer',
            name: 'PensePayPayer',
            meta: {
              title: '税费支付申请',
              permissions: ['DEMO_PENSE_PAYER'],
              keepAlive: true,
            },
            component: () => import('@/views/pense/payer/index.vue'),
          },
        ],
      },
      {
        path: 'settle',
        name: 'PenseSettle',
        meta: {
          title: '费用支付',
          permissions: ['DEMO_PENSE_SETTLE'],
          keepAlive: true,
        },
        component: () => import('@/views/pense/settle/index.vue'),
      },
      {
        path: 'query',
        name: 'PenseQuery',
        meta: {
          title: '申请查询',
          permissions: ['DEMO_PENSE_QUERY'],
          keepAlive: true,
        },
        component: () => import('@/views/pense/query/index.vue'),
      },
    ],
  },
]

export default routes
