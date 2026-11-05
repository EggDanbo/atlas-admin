import type { RouteRecordRaw } from 'vue-router'

/**
 * 财务管理
 *
 * 这套页面服务的是「管钱的人」，不是记账的人：
 * 关心钱够不够、谁欠我、预算还够花多久、项目赚不赚钱。
 * 因此没有凭证、账簿、结账这类核算动作，全部是资金与经营视角的查询与分析。
 *
 * 1. 资金管理：账户有多少钱、这个月收付如何、下个月缺口多大
 * 2. 往来管理：应收账龄与应付到期，决定催收和排款的优先级
 * 3. 预算与成本：部门预算执行到哪一步、项目做到最后还有多少毛利
 * 4. 经营分析：收入成本费用走势、关键财务指标与行业对比
 *
 * 约定：路由 name 必须与页面组件 name 一致，KeepAlive 的 include 依赖它。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/finance',
    name: 'Finance',
    meta: {
      title: '财务管理',
      icon: 'ant-design:bank-outlined',
      permissions: [
        'FIN_TREASURY_OVERVIEW',
        'FIN_ARAP_RECEIVABLE',
        'FIN_BUDGET_EXECUTION',
        'FIN_ANALYSIS_DASHBOARD',
      ],
      alwaysShow: true,
      sort: 50,
    },
    children: [
      {
        path: 'treasury',
        name: 'FinanceTreasury',
        meta: {
          title: '资金管理',
          permissions: ['FIN_TREASURY_OVERVIEW', 'FIN_TREASURY_ACCOUNT', 'FIN_TREASURY_PLAN'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'overview',
            name: 'FinanceTreasuryOverview',
            meta: {
              title: '资金总览',
              permissions: ['FIN_TREASURY_OVERVIEW'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/treasury/overview/index.vue'),
          },
          {
            path: 'account',
            name: 'FinanceTreasuryAccount',
            meta: {
              title: '银行账户',
              permissions: ['FIN_TREASURY_ACCOUNT'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/treasury/account/index.vue'),
          },
          {
            path: 'plan',
            name: 'FinanceTreasuryPlan',
            meta: {
              title: '资金计划',
              permissions: ['FIN_TREASURY_PLAN'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/treasury/plan/index.vue'),
          },
        ],
      },
      {
        path: 'arap',
        name: 'FinanceArap',
        meta: {
          title: '往来管理',
          permissions: ['FIN_ARAP_RECEIVABLE', 'FIN_ARAP_PAYABLE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'receivable',
            name: 'FinanceArapReceivable',
            meta: {
              title: '应收账龄',
              permissions: ['FIN_ARAP_RECEIVABLE'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/arap/receivable/index.vue'),
          },
          {
            path: 'payable',
            name: 'FinanceArapPayable',
            meta: {
              title: '应付账款',
              permissions: ['FIN_ARAP_PAYABLE'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/arap/payable/index.vue'),
          },
        ],
      },
      {
        path: 'budget',
        name: 'FinanceBudget',
        meta: {
          title: '预算与成本',
          permissions: ['FIN_BUDGET_EXECUTION', 'FIN_BUDGET_PROJECT'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'execution',
            name: 'FinanceBudgetExecution',
            meta: {
              title: '预算执行',
              permissions: ['FIN_BUDGET_EXECUTION'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/budget/execution/index.vue'),
          },
          {
            path: 'project-cost',
            name: 'FinanceBudgetProject',
            meta: {
              title: '项目成本',
              permissions: ['FIN_BUDGET_PROJECT'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/budget/project-cost/index.vue'),
          },
        ],
      },
      {
        path: 'analysis',
        name: 'FinanceAnalysis',
        meta: {
          title: '经营分析',
          permissions: ['FIN_ANALYSIS_DASHBOARD', 'FIN_ANALYSIS_INDICATOR'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'dashboard',
            name: 'FinanceAnalysisDashboard',
            meta: {
              title: '经营看板',
              permissions: ['FIN_ANALYSIS_DASHBOARD'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/analysis/dashboard/index.vue'),
          },
          {
            path: 'indicator',
            name: 'FinanceAnalysisIndicator',
            meta: {
              title: '财务指标',
              permissions: ['FIN_ANALYSIS_INDICATOR'],
              keepAlive: true,
            },
            component: () => import('@/views/finance/analysis/indicator/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
