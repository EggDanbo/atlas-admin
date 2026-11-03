import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/masterdata',
    name: 'Masterdata',
    meta: {
      title: '主数据',
      icon: 'ant-design:book-outlined',
      permissions: [
        'MDM_HOLIDAY',
        'MDM_PAYROLL_ITEM',
        'MDM_BIZ_TYPE',
        'MDM_ASSET_CATEGORY',
        'MDM_BANK_ACCOUNT',
        'MDM_DIMENSION',
        'MDM_SUBJECT',
        'MDM_CASHFLOW_ITEM',
        'MDM_CARRYOVER',
      ],
      alwaysShow: true,
      sort: 70,
    },
    children: [
      {
        path: 'holiday',
        name: 'MdmHoliday',
        meta: {
          title: '假期类型',
          permissions: ['MDM_HOLIDAY'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/holiday/index.vue'),
      },
      {
        path: 'payroll-item',
        name: 'MdmPayrollItem',
        meta: {
          title: '薪酬项目',
          permissions: ['MDM_PAYROLL_ITEM'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/payroll-item/index.vue'),
      },
      {
        path: 'biz-type',
        name: 'MdmBizType',
        meta: {
          title: '业务类型',
          permissions: ['MDM_BIZ_TYPE'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/biz-type/index.vue'),
      },
      {
        path: 'asset-category',
        name: 'MdmAssetCategory',
        meta: {
          title: '资产分类',
          permissions: ['MDM_ASSET_CATEGORY'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/asset-category/index.vue'),
      },
      {
        path: 'bank-account',
        name: 'MdmBankAccount',
        meta: {
          title: '银行账户',
          permissions: ['MDM_BANK_ACCOUNT'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/bank-account/index.vue'),
      },
      {
        path: 'dimension',
        name: 'MdmDimension',
        meta: {
          title: '核算维度',
          permissions: ['MDM_DIMENSION'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/dimension/index.vue'),
      },
      {
        path: 'subject',
        name: 'MdmSubject',
        meta: {
          title: '会计科目',
          permissions: ['MDM_SUBJECT'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/subject/index.vue'),
      },
      {
        path: 'cashflow-item',
        name: 'MdmCashflowItem',
        meta: {
          title: '现金流项目',
          permissions: ['MDM_CASHFLOW_ITEM'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/cashflow-item/index.vue'),
      },
      {
        path: 'carryover',
        name: 'MdmCarryover',
        meta: {
          title: '结转模板',
          permissions: ['MDM_CARRYOVER'],
          keepAlive: true,
        },
        component: () => import('@/views/masterdata/carryover/index.vue'),
      },
    ],
  },
]

export default routes
