import type { RouteRecordRaw } from 'vue-router'

/**
 * 费用管理
 *
 * 旧结构把费用类型当菜单：报销、借款、保证金、税费、采购、出差、招待各占一页，
 * 11 个页面里 7 个是同构的申请单，查一笔费用要挨个菜单翻。
 *
 * 现在按「预算 → 申请 → 合同 → 支付」的资金流组织，5 个页面：
 * 1. 预算管理：费用类别的年度额度与执行率
 * 2. 费用申请：一张申请单覆盖所有类型，类型做成列与筛选项
 * 3. 合同管理：合同台账与付款进度
 * 4. 费用支付：支付记录，能追到对应的申请单
 * 5. 费用分析：月度支出、类别结构、部门 TOP
 *
 * 部门预算执行在财务管理里，这里只做「费用类别」的额度控制，两者视角不同。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/expense',
    name: 'Expense',
    meta: {
      title: '费用管理',
      icon: 'ant-design:account-book-outlined',
      permissions: ['EXP_BUDGET_QUOTA', 'EXP_CLAIM_LIST', 'EXP_CONTRACT_LIST', 'EXP_PAYMENT_LIST'],
      alwaysShow: true,
      sort: 30,
    },
    children: [
      {
        path: 'budget',
        name: 'ExpenseBudget',
        meta: { title: '预算管理', permissions: ['EXP_BUDGET_QUOTA'], alwaysShow: true },
        children: [
          {
            path: 'quota',
            name: 'ExpenseBudgetQuota',
            meta: { title: '预算额度', permissions: ['EXP_BUDGET_QUOTA'], keepAlive: true },
            component: () => import('@/views/expense/budget/quota/index.vue'),
          },
        ],
      },
      {
        path: 'claim',
        name: 'ExpenseClaim',
        meta: { title: '费用申请', permissions: ['EXP_CLAIM_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'ExpenseClaimList',
            meta: { title: '申请单', permissions: ['EXP_CLAIM_LIST'], keepAlive: true },
            component: () => import('@/views/expense/claim/list/index.vue'),
          },
        ],
      },
      {
        path: 'contract',
        name: 'ExpenseContract',
        meta: { title: '合同管理', permissions: ['EXP_CONTRACT_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'ExpenseContractList',
            meta: { title: '合同台账', permissions: ['EXP_CONTRACT_LIST'], keepAlive: true },
            component: () => import('@/views/expense/contract/list/index.vue'),
          },
        ],
      },
      {
        path: 'payment',
        name: 'ExpensePayment',
        meta: { title: '费用支付', permissions: ['EXP_PAYMENT_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'ExpensePaymentList',
            meta: { title: '支付记录', permissions: ['EXP_PAYMENT_LIST'], keepAlive: true },
            component: () => import('@/views/expense/payment/list/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'ExpenseReport',
        meta: { title: '费用分析', permissions: ['EXP_REPORT_DASHBOARD'], alwaysShow: true },
        children: [
          {
            path: 'dashboard',
            name: 'ExpenseReportDashboard',
            meta: { title: '费用看板', permissions: ['EXP_REPORT_DASHBOARD'], keepAlive: true },
            component: () => import('@/views/expense/report/dashboard/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
