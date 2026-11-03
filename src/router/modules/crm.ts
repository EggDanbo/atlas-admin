import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/crm',
    name: 'Crm',
    meta: {
      title: '客户与项目',
      icon: 'ant-design:team-outlined',
      permissions: [
        'CRM_CUSTOMER',
        'CRM_PROJECT',
        'CRM_RECEIVABLE',
        'CRM_INVOICE',
        'CRM_RECEIPT',
      ],
      alwaysShow: true,
      sort: 10,
    },
    children: [
      {
        path: 'customer',
        name: 'CrmCustomer',
        meta: {
          title: '客户',
          permissions: ['CRM_CUSTOMER'],
          keepAlive: true,
        },
        component: () => import('@/views/crm/customer/index.vue'),
      },
      {
        path: 'project',
        name: 'CrmProject',
        meta: {
          title: '项目',
          permissions: ['CRM_PROJECT'],
          keepAlive: true,
        },
        component: () => import('@/views/crm/project/index.vue'),
      },
      {
        path: 'receivable',
        name: 'CrmReceivable',
        meta: {
          title: '应收',
          permissions: ['CRM_RECEIVABLE'],
          keepAlive: true,
        },
        component: () => import('@/views/crm/receivable/index.vue'),
      },
      {
        path: 'invoice',
        name: 'CrmInvoice',
        meta: {
          title: '发票',
          permissions: ['CRM_INVOICE'],
          keepAlive: true,
        },
        component: () => import('@/views/crm/invoice/index.vue'),
      },
      {
        path: 'receipt',
        name: 'CrmReceipt',
        meta: {
          title: '回款',
          permissions: ['CRM_RECEIPT'],
          keepAlive: true,
        },
        component: () => import('@/views/crm/receipt/index.vue'),
      },
      {
        path: 'report',
        name: 'CrmReport',
        meta: {
          title: '统计分析',
          permissions: ['CRM_REPORT_PROJECT', 'CRM_REPORT_RECEIVABLE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'project',
            name: 'CrmReportProject',
            meta: {
              title: '项目统计',
              permissions: ['CRM_REPORT_PROJECT'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/report/project/index.vue'),
          },
          {
            path: 'receivable',
            name: 'CrmReportReceivable',
            meta: {
              title: '应收统计',
              permissions: ['CRM_REPORT_RECEIVABLE'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/report/receivable/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
