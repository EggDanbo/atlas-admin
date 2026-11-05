import type { RouteRecordRaw } from 'vue-router'

/**
 * 客户与项目
 *
 * 按「客户怎么来、单子怎么谈、活怎么干、钱怎么收」这条主线组织：
 * 1. 客户经营：客户档案与联系人，回答「我们在跟谁做生意」
 * 2. 商机管理：在谈的机会与整体漏斗，回答「接下来有多少单子」
 * 3. 项目交付：合同签完之后的执行进度与里程碑，回答「活干到哪一步」
 * 4. 收入结算：开票、回款与客户收入，回答「钱收回来没有」
 *
 * 应收账龄不在这里——那是财务视角的账龄分析，放在财务管理下，
 * 这里只保留与业务动作直接相关的开票与回款。
 *
 * 约定：路由 name 必须与页面组件 name 一致，KeepAlive 的 include 依赖它。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/crm',
    name: 'Crm',
    meta: {
      title: '客户与项目',
      icon: 'ant-design:team-outlined',
      permissions: [
        'CRM_CUSTOMER_ARCHIVE',
        'CRM_OPPORTUNITY_LIST',
        'CRM_DELIVERY_PROJECT',
        'CRM_BILLING_INVOICE',
      ],
      alwaysShow: true,
      sort: 10,
    },
    children: [
      {
        path: 'customer',
        name: 'CrmCustomer',
        meta: {
          title: '客户经营',
          permissions: ['CRM_CUSTOMER_ARCHIVE', 'CRM_CUSTOMER_CONTACT'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'archive',
            name: 'CrmCustomerArchive',
            meta: {
              title: '客户档案',
              permissions: ['CRM_CUSTOMER_ARCHIVE'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/customer/archive/index.vue'),
          },
          {
            path: 'contact',
            name: 'CrmCustomerContact',
            meta: {
              title: '联系人',
              permissions: ['CRM_CUSTOMER_CONTACT'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/customer/contact/index.vue'),
          },
        ],
      },
      {
        path: 'opportunity',
        name: 'CrmOpportunity',
        meta: {
          title: '商机管理',
          permissions: ['CRM_OPPORTUNITY_LIST', 'CRM_OPPORTUNITY_FUNNEL'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'list',
            name: 'CrmOpportunityList',
            meta: {
              title: '商机列表',
              permissions: ['CRM_OPPORTUNITY_LIST'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/opportunity/list/index.vue'),
          },
          {
            path: 'funnel',
            name: 'CrmOpportunityFunnel',
            meta: {
              title: '销售漏斗',
              permissions: ['CRM_OPPORTUNITY_FUNNEL'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/opportunity/funnel/index.vue'),
          },
        ],
      },
      {
        path: 'delivery',
        name: 'CrmDelivery',
        meta: {
          title: '项目交付',
          permissions: ['CRM_DELIVERY_PROJECT', 'CRM_DELIVERY_MILESTONE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'project',
            name: 'CrmDeliveryProject',
            meta: {
              title: '项目台账',
              permissions: ['CRM_DELIVERY_PROJECT'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/delivery/project/index.vue'),
          },
          {
            path: 'milestone',
            name: 'CrmDeliveryMilestone',
            meta: {
              title: '里程碑',
              permissions: ['CRM_DELIVERY_MILESTONE'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/delivery/milestone/index.vue'),
          },
        ],
      },
      {
        path: 'billing',
        name: 'CrmBilling',
        meta: {
          title: '收入结算',
          permissions: ['CRM_BILLING_INVOICE', 'CRM_BILLING_RECEIPT', 'CRM_BILLING_REVENUE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'invoice',
            name: 'CrmBillingInvoice',
            meta: {
              title: '开票记录',
              permissions: ['CRM_BILLING_INVOICE'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/billing/invoice/index.vue'),
          },
          {
            path: 'receipt',
            name: 'CrmBillingReceipt',
            meta: {
              title: '回款登记',
              permissions: ['CRM_BILLING_RECEIPT'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/billing/receipt/index.vue'),
          },
          {
            path: 'revenue',
            name: 'CrmBillingRevenue',
            meta: {
              title: '客户收入',
              permissions: ['CRM_BILLING_REVENUE'],
              keepAlive: true,
            },
            component: () => import('@/views/crm/billing/revenue/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
