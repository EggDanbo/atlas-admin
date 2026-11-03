import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/vouch',
    name: 'vouch',
    meta: {
      title: '账务处理',
      icon: 'ant-design:wallet-outlined',
      permissions: [
        'DEMO_VOUCH_ENTRY',
        'DEMO_VOUCH_CASHFLOW',
        'DEMO_VOUCH_BALANCE',
        'DEMO_VOUCH_PERIOD',
        'DEMO_VOUCH_REPORT_SSPHB',
        'DEMO_VOUCH_REPORT_KMYEB',
        'DEMO_VOUCH_REPORT_WDYEB',
        'DEMO_VOUCH_BOOK_ZFLZ',
        'DEMO_VOUCH_BOOK_MXFLZ',
        'DEMO_VOUCH_BOOK_WDMXZ',
        'DEMO_VOUCH_FINANCE_ZCFZB',
        'DEMO_VOUCH_FINANCE_XJLLB',
        'DEMO_VOUCH_FINANCE_LRFPB',
        'DEMO_VOUCH_FINANCE_QYBDB',
      ],
      alwaysShow: true,
      sort: 60,
    },
    children: [
      {
        path: 'entry',
        name: 'VouchEntry',
        meta: {
          title: '凭证录入',
          permissions: ['DEMO_VOUCH_ENTRY'],
          keepAlive: true,
        },
        component: () => import('@/views/vouch/entry/index.vue'),
      },
      {
        path: 'query',
        name: 'VouchQuery',
        meta: {
          title: '凭证分录',
          permissions: ['DEMO_VOUCH_ENTRY'],
          keepAlive: true,
        },
        component: () => import('@/views/vouch/query/index.vue'),
      },
      {
        path: 'cashflow',
        name: 'VouchCashflow',
        meta: {
          title: '现金流向',
          permissions: ['DEMO_VOUCH_CASHFLOW'],
          keepAlive: true,
        },
        component: () => import('@/views/vouch/cashflow/index.vue'),
      },
      {
        path: 'balance',
        name: 'VouchBalance',
        meta: {
          title: '期初余额',
          permissions: ['DEMO_VOUCH_BALANCE'],
          keepAlive: true,
        },
        component: () => import('@/views/vouch/balance/index.vue'),
      },
      {
        path: 'period',
        name: 'VouchPeriod',
        meta: {
          title: '期间处理',
          permissions: ['DEMO_VOUCH_PERIOD'],
          keepAlive: true,
        },
        component: () => import('@/views/vouch/period/index.vue'),
      },
      {
        path: 'report',
        name: 'VouchReport',
        meta: {
          title: '余额查询',
          permissions: ['DEMO_VOUCH_REPORT_KMYEB', 'DEMO_VOUCH_REPORT_WDYEB'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'kmyeb',
            name: 'VouchReportKmyeb',
            meta: {
              title: '科目余额表',
              permissions: ['DEMO_VOUCH_REPORT_KMYEB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/report/kmyeb/index.vue'),
          },
          {
            path: 'wdyeb',
            name: 'VouchReportWdyeb',
            meta: {
              title: '维度余额表',
              permissions: ['DEMO_VOUCH_REPORT_WDYEB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/report/wdyeb/index.vue'),
          },
        ],
      },
      {
        path: 'book',
        name: 'VouchBook',
        meta: {
          title: '会计账册',
          permissions: [
            'DEMO_VOUCH_BOOK_ZFLZ',
            'DEMO_VOUCH_BOOK_MXFLZ',
            'DEMO_VOUCH_BOOK_WDMXZ',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'zflz',
            name: 'VouchBookZflz',
            meta: {
              title: '总分类账',
              permissions: ['DEMO_VOUCH_BOOK_ZFLZ'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/book/zflz/index.vue'),
          },
          {
            path: 'mxflz',
            name: 'VouchBookMxflz',
            meta: {
              title: '明细分类账',
              permissions: ['DEMO_VOUCH_BOOK_MXFLZ'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/book/mxflz/index.vue'),
          },
          {
            path: 'wdmxz',
            name: 'VouchBookWdmxz',
            meta: {
              title: '维度明细账',
              permissions: ['DEMO_VOUCH_BOOK_WDMXZ'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/book/wdmxz/index.vue'),
          },
        ],
      },
      {
        path: 'finance',
        name: 'VouchFinance',
        meta: {
          title: '会计报告',
          permissions: [
            'DEMO_VOUCH_FINANCE_ZCFZB',
            'DEMO_VOUCH_FINANCE_XJLLB',
            'DEMO_VOUCH_FINANCE_LRFPB',
            'DEMO_VOUCH_FINANCE_QYBDB',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'zcfzb',
            name: 'VouchFinanceZcfzb',
            meta: {
              title: '资产负债表',
              permissions: ['DEMO_VOUCH_FINANCE_ZCFZB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/finance/zcfzb/index.vue'),
          },
          {
            path: 'xjllb',
            name: 'VouchFinanceXjllb',
            meta: {
              title: '现金流量表',
              permissions: ['DEMO_VOUCH_FINANCE_XJLLB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/finance/xjllb/index.vue'),
          },
          {
            path: 'lrfpb',
            name: 'VouchFinanceLrfpb',
            meta: {
              title: '利润分配表',
              permissions: ['DEMO_VOUCH_FINANCE_LRFPB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/finance/lrfpb/index.vue'),
          },
          {
            path: 'qybdb',
            name: 'VouchFinanceQybdb',
            meta: {
              title: '权益变动表',
              permissions: ['DEMO_VOUCH_FINANCE_QYBDB'],
              keepAlive: true,
            },
            component: () => import('@/views/vouch/finance/qybdb/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
