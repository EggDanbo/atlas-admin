import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/expense',
    name: 'Expense',
    meta: {
      title: '费用管理',
      icon: 'ant-design:account-book-outlined',
      permissions: [
        'EXP_BUDGET',
        'EXP_CONTRACT',
        'EXP_REQUEST_PURCHASE',
        'EXP_CLAIM_REIMBURSE',
        'EXP_PAYMENT',
      ],
      alwaysShow: true,
      sort: 30,
    },
    children: [
      {
        path: 'budget',
        name: 'ExpenseBudget',
        meta: {
          title: '预算额度',
          permissions: ['EXP_BUDGET'],
          keepAlive: true,
        },
        component: () => import('@/views/expense/budget/index.vue'),
      },
      {
        path: 'contract',
        name: 'ExpenseContract',
        meta: {
          title: '合同',
          permissions: ['EXP_CONTRACT'],
          keepAlive: true,
        },
        component: () => import('@/views/expense/contract/index.vue'),
      },
      {
        path: 'request',
        name: 'ExpenseRequest',
        meta: {
          title: '事前申请',
          permissions: ['EXP_REQUEST_PURCHASE', 'EXP_REQUEST_TRAVEL', 'EXP_REQUEST_ENTERTAIN'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'purchase',
            name: 'ExpenseRequestPurchase',
            meta: {
              title: '采购申请',
              permissions: ['EXP_REQUEST_PURCHASE'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/purchase/index.vue'),
          },
          {
            path: 'travel',
            name: 'ExpenseRequestTravel',
            meta: {
              title: '出差申请',
              permissions: ['EXP_REQUEST_TRAVEL'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/travel/index.vue'),
          },
          {
            path: 'entertain',
            name: 'ExpenseRequestEntertain',
            meta: {
              title: '招待申请',
              permissions: ['EXP_REQUEST_ENTERTAIN'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/entertain/index.vue'),
          },
        ],
      },
      {
        path: 'claim',
        name: 'ExpenseClaim',
        meta: {
          title: '费用申请',
          permissions: [
            'EXP_CLAIM_REIMBURSE',
            'EXP_CLAIM_ADVANCE',
            'EXP_CLAIM_DEPOSIT',
            'EXP_CLAIM_TAX',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'reimburse',
            name: 'ExpenseClaimReimburse',
            meta: {
              title: '报销申请',
              permissions: ['EXP_CLAIM_REIMBURSE'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/reimburse/index.vue'),
          },
          {
            path: 'advance',
            name: 'ExpenseClaimAdvance',
            meta: {
              title: '备用金申请',
              permissions: ['EXP_CLAIM_ADVANCE'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/advance/index.vue'),
          },
          {
            path: 'deposit',
            name: 'ExpenseClaimDeposit',
            meta: {
              title: '保证金申请',
              permissions: ['EXP_CLAIM_DEPOSIT'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/deposit/index.vue'),
          },
          {
            path: 'tax',
            name: 'ExpenseClaimTax',
            meta: {
              title: '税费支付申请',
              permissions: ['EXP_CLAIM_TAX'],
              keepAlive: true,
            },
            component: () => import('@/views/expense/tax/index.vue'),
          },
        ],
      },
      {
        path: 'payment',
        name: 'ExpensePayment',
        meta: {
          title: '费用支付',
          permissions: ['EXP_PAYMENT'],
          keepAlive: true,
        },
        component: () => import('@/views/expense/payment/index.vue'),
      },
      {
        path: 'query',
        name: 'ExpenseQuery',
        meta: {
          title: '申请查询',
          permissions: ['EXP_QUERY'],
          keepAlive: true,
        },
        component: () => import('@/views/expense/query/index.vue'),
      },
    ],
  },
]

export default routes
