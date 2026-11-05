import type { RouteRecordRaw } from 'vue-router'

/**
 * 财务核算
 *
 * 按「日常核算 → 账簿查询 → 期末 → 报表」的会计作业顺序组织，而不是按功能罗列：
 * 1. 凭证处理：一切数据的源头，包含录入、查改、现金流量项目分配
 * 2. 账簿：凭证过账后的四种视角，总账 / 明细账 / 科目余额 / 辅助核算
 * 3. 期末处理：一个会计期间收尾要做的两件事，期初初始化与月末结账
 * 4. 财务报表：对外报送的四张表
 *
 * 约定：路由 name 必须与页面组件 name 一致。KeepAlive 的 include 依赖它，
 * 对不上会出现「切回来一片空白且控制台无报错」。
 */
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
          title: '凭证处理',
          permissions: ['FIN_VOUCHER_CREATE', 'FIN_VOUCHER_ENTRY', 'FIN_CASHFLOW'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'entry',
            name: 'FinanceVoucherEntry',
            meta: {
              title: '凭证录入',
              permissions: ['FIN_VOUCHER_CREATE'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/voucher/index.vue'),
          },
          {
            path: 'list',
            name: 'FinanceVoucherList',
            meta: {
              title: '凭证查询',
              permissions: ['FIN_VOUCHER_ENTRY'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/voucher-query/index.vue'),
          },
          {
            // 现金流量项目在制单阶段指定，与凭证同属日常核算，不再单列一级模块
            path: 'cashflow',
            name: 'FinanceCashflow',
            meta: {
              title: '现金流量分配',
              permissions: ['FIN_CASHFLOW'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/cashflow/index.vue'),
          },
        ],
      },
      {
        path: 'ledger',
        name: 'FinanceLedger',
        meta: {
          title: '账簿',
          permissions: [
            'FIN_LEDGER_GENERAL',
            'FIN_LEDGER_DETAIL',
            'FIN_BALANCE_SUBJECT',
            'FIN_BALANCE_DIMENSION',
          ],
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
            // 会计上余额表本来就是账簿的一种，原先单列成「余额查询」，用户要记两个入口
            path: 'balance',
            name: 'FinanceBalanceSubject',
            meta: {
              title: '科目余额表',
              permissions: ['FIN_BALANCE_SUBJECT'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/subject-balance/index.vue'),
          },
          {
            // 按部门 / 项目 / 客户等维度看余额，点击行下钻到维度明细账
            path: 'auxiliary',
            name: 'FinanceLedgerAuxiliary',
            meta: {
              title: '辅助核算',
              permissions: ['FIN_BALANCE_DIMENSION'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/dimension-balance/index.vue'),
          },
        ],
      },
      {
        path: 'period',
        name: 'FinancePeriod',
        meta: {
          title: '期末处理',
          permissions: ['FIN_OPENING', 'FIN_PERIOD'],
          alwaysShow: true,
        },
        children: [
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
            // 审核 → 结转 → 结账，一个会计期间的收尾动作
            path: 'closing',
            name: 'FinancePeriodClosing',
            meta: {
              title: '期末结账',
              permissions: ['FIN_PERIOD'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/period/index.vue'),
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
            path: 'equity',
            name: 'FinanceStatementEquity',
            meta: {
              title: '所有者权益变动表',
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
