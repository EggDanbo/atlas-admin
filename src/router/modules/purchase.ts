import type { RouteRecordRaw } from 'vue-router'

/**
 * 采购管理
 *
 * 原有模块里「供」这一环是缺的：费用只有一张合同台账，资产里「采购」
 * 只是一个流转类型。供应商是谁、比了几家、到货合不合格、还欠多少钱，
 * 分散在三个模块里都看不全。
 *
 * 这里按一条真实链路组织，6 个页面：
 * 1. 供应商台账：准入状态、品类、评级、账期、累计采购额与准时率
 * 2. 采购申请：需求部门提出的原始诉求
 * 3. 采购订单：申请转成的订单，含到货进度与结算状态
 * 4. 到货验收：到货数量、合格与不合格、验收结论
 * 5. 对账付款：应付、已付、未付与到期日
 * 6. 采购分析：月度采购额、品类结构、供应商集中度
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/purchase',
    name: 'Purchase',
    meta: {
      title: '采购管理',
      icon: 'ant-design:shopping-cart-outlined',
      permissions: ['PUR_SUPPLIER_LIST', 'PUR_ORDER_LIST', 'PUR_SETTLEMENT_RECEIPT'],
      alwaysShow: true,
      sort: 45,
    },
    children: [
      {
        path: 'supplier',
        name: 'PurchaseSupplier',
        meta: { title: '供应商管理', permissions: ['PUR_SUPPLIER_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'PurchaseSupplierList',
            meta: { title: '供应商台账', permissions: ['PUR_SUPPLIER_LIST'], keepAlive: true },
            component: () => import('@/views/purchase/supplier/list/index.vue'),
          },
        ],
      },
      {
        path: 'order',
        name: 'PurchaseOrder',
        meta: { title: '采购执行', permissions: ['PUR_ORDER_REQUEST'], alwaysShow: true },
        children: [
          {
            path: 'request',
            name: 'PurchaseOrderRequest',
            meta: { title: '采购申请', permissions: ['PUR_ORDER_REQUEST'], keepAlive: true },
            component: () => import('@/views/purchase/order/request/index.vue'),
          },
          {
            path: 'list',
            name: 'PurchaseOrderList',
            meta: { title: '采购订单', permissions: ['PUR_ORDER_LIST'], keepAlive: true },
            component: () => import('@/views/purchase/order/list/index.vue'),
          },
        ],
      },
      {
        path: 'settlement',
        name: 'PurchaseSettlement',
        meta: { title: '到货与结算', permissions: ['PUR_SETTLEMENT_RECEIPT'], alwaysShow: true },
        children: [
          {
            path: 'receipt',
            name: 'PurchaseSettlementReceipt',
            meta: { title: '到货验收', permissions: ['PUR_SETTLEMENT_RECEIPT'], keepAlive: true },
            component: () => import('@/views/purchase/settlement/receipt/index.vue'),
          },
          {
            path: 'payable',
            name: 'PurchaseSettlementPayable',
            meta: { title: '对账付款', permissions: ['PUR_SETTLEMENT_PAYABLE'], keepAlive: true },
            component: () => import('@/views/purchase/settlement/payable/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'PurchaseReport',
        meta: { title: '采购分析', permissions: ['PUR_REPORT_OVERVIEW'], alwaysShow: true },
        children: [
          {
            path: 'dashboard',
            name: 'PurchaseReportDashboard',
            meta: { title: '采购看板', permissions: ['PUR_REPORT_OVERVIEW'], keepAlive: true },
            component: () => import('@/views/purchase/report/dashboard/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
