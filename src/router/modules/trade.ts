import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/trade',
    name: 'trade',
    meta: {
      title: '业务管理',
      icon: 'ant-design:shopping-outlined',
      permissions: [
        'DEMO_TRADE_CUSTOM',
        'DEMO_TRADE_PROJECT',
        'DEMO_TRADE_PROMISE',
        'DEMO_TRADE_INVOICE',
        'DEMO_TRADE_RECEIVE',
        'DEMO_TRADE_REPORT_XMTJB',
        'DEMO_TRADE_REPORT_YSTJB',
      ],
      alwaysShow: true,
      sort: 20,
    },
    children: [
      {
        path: 'custom',
        name: 'TradeCustom',
        meta: {
          title: '客户管理',
          permissions: ['DEMO_TRADE_CUSTOM'],
          keepAlive: true,
        },
        component: () => import('@/views/trade/custom/index.vue'),
      },
      {
        path: 'project',
        name: 'TradeProject',
        meta: {
          title: '项目管理',
          permissions: ['DEMO_TRADE_PROJECT'],
          keepAlive: true,
        },
        component: () => import('@/views/trade/project/index.vue'),
      },
      {
        path: 'promise',
        name: 'TradePromise',
        meta: {
          title: '应收管理',
          permissions: ['DEMO_TRADE_PROMISE'],
          keepAlive: true,
        },
        component: () => import('@/views/trade/promise/index.vue'),
      },
      {
        path: 'invoice',
        name: 'TradeInvoice',
        meta: {
          title: '发票管理',
          permissions: ['DEMO_TRADE_INVOICE'],
          keepAlive: true,
        },
        component: () => import('@/views/trade/invoice/index.vue'),
      },
      {
        path: 'receive',
        name: 'TradeReceive',
        meta: {
          title: '收款流水',
          permissions: ['DEMO_TRADE_RECEIVE'],
          keepAlive: true,
        },
        component: () => import('@/views/trade/receive/index.vue'),
      },
      {
        path: 'report',
        name: 'TradeReport',
        meta: {
          title: '查询统计',
          permissions: [
            'DEMO_TRADE_REPORT_XMTJB',
            'DEMO_TRADE_REPORT_YSTJB',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'xmtjb',
            name: 'TradeReportXmtjb',
            meta: {
              title: '项目统计表',
              permissions: ['DEMO_TRADE_REPORT_XMTJB'],
              keepAlive: true,
            },
            component: () => import('@/views/trade/report/xmtjb/index.vue'),
          },
          {
            path: 'ystjb',
            name: 'TradeReportYstjb',
            meta: {
              title: '应收统计表',
              permissions: ['DEMO_TRADE_REPORT_YSTJB'],
              keepAlive: true,
            },
            component: () => import('@/views/trade/report/ystjb/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
