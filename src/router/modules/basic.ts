import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/basic',
    name: 'basic',
    meta: {
      title: '基础资料',
      icon: 'ant-design:sliders-outlined',
      permissions: [
        'DEMO_BASIC_HOLIDAY',
        'DEMO_BASIC_SALARY',
        'DEMO_BASIC_PRODUCT',
        'DEMO_BASIC_ASSET',
        'DEMO_BASIC_EXPENSE',
        'DEMO_BASIC_ACCOUNT',
        'DEMO_BASIC_CONTENT',
        'DEMO_BASIC_CASHFLOW',
        'DEMO_BASIC_PATTERN',
      ],
      alwaysShow: true,
      sort: 82,
    },
    children: [
      {
        path: 'holiday',
        name: 'BasicHoliday',
        meta: {
          title: '假期类型',
          permissions: ['DEMO_BASIC_HOLIDAY'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/holiday/index.vue'),
      },
      {
        path: 'salary',
        name: 'BasicSalary',
        meta: {
          title: '工资项目',
          permissions: ['DEMO_BASIC_SALARY'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/salary/index.vue'),
      },
      {
        path: 'product',
        name: 'BasicProduct',
        meta: {
          title: '业务类型',
          permissions: ['DEMO_BASIC_PRODUCT'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/product/index.vue'),
      },
      // {
      //   path: 'store',
      //   name: 'BasicStore',
      //   meta: {
      //     title: '货仓信息',
      //     permissions: ['DEMO_BASIC_STORE'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/basic/store/index.vue'),
      // },
      // {
      //   path: 'space',
      //   name: 'BasicSpace',
      //   meta: {
      //     title: '货位信息',
      //     permissions: ['DEMO_BASIC_SPACE'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/basic/space/index.vue'),
      // },
      // {
      //   path: 'article',
      //   name: 'BasicArticle',
      //   meta: {
      //     title: '物品分类',
      //     permissions: ['DEMO_BASIC_ARTICLE'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/basic/article/index.vue'),
      // },
      // {
      //   path: 'stock',
      //   name: 'BasicStock',
      //   meta: {
      //     title: '物品编码',
      //     permissions: ['DEMO_BASIC_STOCK'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/basic/stock/index.vue'),
      // },
      {
        path: 'asset',
        name: 'BasicAsset',
        meta: {
          title: '资产分类',
          permissions: ['DEMO_BASIC_ASSET'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/asset/index.vue'),
      },
      // {
      //   path: 'expense',
      //   name: 'BasicExpense',
      //   meta: {
      //     title: '费用分类',
      //     permissions: ['DEMO_BASIC_EXPENSE'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/basic/expense/index.vue'),
      // },
      {
        path: 'account',
        name: 'BasicAccount',
        meta: {
          title: '银行账户',
          permissions: ['DEMO_BASIC_ACCOUNT'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/account/index.vue'),
      },
      {
        path: 'assist',
        name: 'BasicAssist',
        meta: {
          title: '核算维度',
          permissions: ['DEMO_BASIC_ASSIST'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/assist/index.vue'),
      },
      {
        path: 'content',
        name: 'BasicContent',
        meta: {
          title: '会计科目',
          permissions: ['DEMO_BASIC_CONTENT'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/content/index.vue'),
      },
      {
        path: 'cashflow',
        name: 'BasicCashflow',
        meta: {
          title: '现金流向',
          permissions: ['DEMO_BASIC_CASHFLOW'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/cashflow/index.vue'),
      },
      {
        path: 'pattern',
        name: 'BasicPattern',
        meta: {
          title: '结转模板',
          permissions: ['DEMO_BASIC_PATTERN'],
          keepAlive: true,
        },
        component: () => import('@/views/basic/pattern/index.vue'),
      },
    ],
  },
]
export default routes
