import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/finance',
    name: 'Finance',
    meta: {
      title: '财务核算',
      icon: 'ant-design:calculator-outlined',
      permissions: [
        'FIN_VOUCHER_CREATE',
        'FIN_CASHFLOW',
        'FIN_OPENING',
        'FIN_PERIOD',
        'FIN_LEDGER_GENERAL',
        'FIN_STATEMENT_BALANCE',
      ],
      alwaysShow: true,
      sort: 50,
    },
    children: [
      {
        path: 'voucher',
        name: 'FinanceVoucher',
        meta: {
          title: '凭证',
          permissions: ['FIN_VOUCHER_CREATE', 'FIN_VOUCHER_ENTRY'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'create',
            name: 'FinanceVoucherCreate',
            meta: {
              title: '凭证录入',
              permissions: ['FIN_VOUCHER_CREATE'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/voucher/index.vue'),
          },
          {
            path: 'entry',
            name: 'FinanceVoucherEntry',
            meta: {
              title: '凭证分录',
              permissions: ['FIN_VOUCHER_ENTRY'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/voucher-query/index.vue'),
          },
        ],
      },
      {
        path: 'cashflow',
        name: 'FinanceCashflow',
        meta: {
          title: '现金流量',
          permissions: ['FIN_CASHFLOW'],
          keepAlive: true,
        },
        component: () => import('@/views/finance/cashflow/index.vue'),
      },
      {
        path: 'opening',
        name: 'FinanceOpening',
        meta: {
          title: '期初余额',
          permissions: ['FIN_OPENING'],
          keepAlive: true,
        },
        component: () => import('@/views/finance/opening/index.vue'),
      },
      {
        path: 'period',
        name: 'FinancePeriod',
        meta: {
          title: '期间控制',
          permissions: ['FIN_PERIOD'],
          keepAlive: true,
        },
        component: () => import('@/views/finance/period/index.vue'),
      },
      {
        path: 'balance',
        name: 'FinanceBalance',
        meta: {
          title: '余额查询',
          permissions: ['FIN_BALANCE_SUBJECT', 'FIN_BALANCE_DIMENSION'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'subject',
            name: 'FinanceBalanceSubject',
            meta: {
              title: '科目余额表',
              permissions: ['FIN_BALANCE_SUBJECT'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/subject-balance/index.vue'),
          },
          {
            path: 'dimension',
            name: 'FinanceBalanceDimension',
            meta: {
              title: '维度余额表',
              permissions: ['FIN_BALANCE_DIMENSION'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/dimension-balance/index.vue'),
          },
        ],
      },
      {
        path: 'ledger',
        name: 'FinanceLedger',
        meta: {
          title: '账簿',
          permissions: ['FIN_LEDGER_GENERAL', 'FIN_LEDGER_DETAIL', 'FIN_LEDGER_DIMENSION'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'general',
            name: 'FinanceLedgerGeneral',
            meta: {
              title: '总账',
              permissions: ['FIN_LEDGER_GENERAL'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/general-ledger/index.vue'),
          },
          {
            path: 'detail',
            name: 'FinanceLedgerDetail',
            meta: {
              title: '明细账',
              permissions: ['FIN_LEDGER_DETAIL'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/detail-ledger/index.vue'),
          },
          {
            path: 'dimension',
            name: 'FinanceLedgerDimension',
            meta: {
              title: '维度明细账',
              permissions: ['FIN_LEDGER_DIMENSION'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/dimension-ledger/index.vue'),
          },
        ],
      },
      {
        path: 'statement',
        name: 'FinanceStatement',
        meta: {
          title: '财务报表',
          permissions: [
            'FIN_STATEMENT_BALANCE',
            'FIN_STATEMENT_CASHFLOW',
            'FIN_STATEMENT_PROFIT',
            'FIN_STATEMENT_EQUITY',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'balance-sheet',
            name: 'FinanceStatementBalance',
            meta: {
              title: '资产负债表',
              permissions: ['FIN_STATEMENT_BALANCE'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/statement/balance-sheet/index.vue'),
          },
          {
            path: 'cash-flow',
            name: 'FinanceStatementCashflow',
            meta: {
              title: '现金流量表',
              permissions: ['FIN_STATEMENT_CASHFLOW'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/statement/cash-flow/index.vue'),
          },
          {
            path: 'profit',
            name: 'FinanceStatementProfit',
            meta: {
              title: '利润表',
              permissions: ['FIN_STATEMENT_PROFIT'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/statement/profit/index.vue'),
          },
          {
            path: 'equity',
            name: 'FinanceStatementEquity',
            meta: {
              title: '权益变动表',
              permissions: ['FIN_STATEMENT_EQUITY'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/statement/equity/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
