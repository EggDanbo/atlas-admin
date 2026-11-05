import type { RouteRecordRaw } from 'vue-router'

/**
 * 资产管理
 *
 * 旧结构把每道手续都做成菜单：采购、验收、领用、调拨、借出、归还、处置、
 * 盘点、折旧、维保，11 个页面。想查一台设备现在在谁手上，要在 5 个入口之间跳。
 *
 * 现在按「台账 → 流转 → 价值 → 盘点/维保 → 分析」组织，6 个页面：
 * 1. 资产台账：设备档案与当前状态
 * 2. 资产流转：领用、调拨、借出、归还、处置合成一条流水
 * 3. 资产折旧：原值、月折旧、累计折旧与净值
 * 4. 资产盘点：盘点任务的应盘、实盘与盘亏
 * 5. 资产维保：保养与维修计划、费用
 * 6. 资产分析：类别与状态结构、折旧趋势
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/asset',
    name: 'Asset',
    meta: {
      title: '资产管理',
      icon: 'ant-design:gold-outlined',
      permissions: ['AST_LEDGER_LIST', 'AST_FLOW_LIST', 'AST_VALUE_DEPRECIATION', 'AST_CHECK_LIST'],
      alwaysShow: true,
      sort: 40,
    },
    children: [
      {
        path: 'ledger',
        name: 'AssetLedger',
        meta: { title: '资产台账', permissions: ['AST_LEDGER_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'AssetLedgerList',
            meta: { title: '台账', permissions: ['AST_LEDGER_LIST'], keepAlive: true },
            component: () => import('@/views/asset/ledger/list/index.vue'),
          },
        ],
      },
      {
        path: 'flow',
        name: 'AssetFlow',
        meta: { title: '资产流转', permissions: ['AST_FLOW_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'AssetFlowList',
            meta: { title: '流转记录', permissions: ['AST_FLOW_LIST'], keepAlive: true },
            component: () => import('@/views/asset/flow/list/index.vue'),
          },
        ],
      },
      {
        path: 'value',
        name: 'AssetValue',
        meta: { title: '资产价值', permissions: ['AST_VALUE_DEPRECIATION'], alwaysShow: true },
        children: [
          {
            path: 'depreciation',
            name: 'AssetValueDepreciation',
            meta: { title: '折旧明细', permissions: ['AST_VALUE_DEPRECIATION'], keepAlive: true },
            component: () => import('@/views/asset/value/depreciation/index.vue'),
          },
        ],
      },
      {
        path: 'check',
        name: 'AssetCheck',
        meta: { title: '资产盘点', permissions: ['AST_CHECK_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'AssetCheckList',
            meta: { title: '盘点任务', permissions: ['AST_CHECK_LIST'], keepAlive: true },
            component: () => import('@/views/asset/check/list/index.vue'),
          },
        ],
      },
      {
        path: 'maintain',
        name: 'AssetMaintain',
        meta: { title: '资产维保', permissions: ['AST_MAINTAIN_LIST'], alwaysShow: true },
        children: [
          {
            path: 'list',
            name: 'AssetMaintainList',
            meta: { title: '维保计划', permissions: ['AST_MAINTAIN_LIST'], keepAlive: true },
            component: () => import('@/views/asset/maintain/list/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'AssetReport',
        meta: { title: '资产分析', permissions: ['AST_REPORT_DASHBOARD'], alwaysShow: true },
        children: [
          {
            path: 'dashboard',
            name: 'AssetReportDashboard',
            meta: { title: '资产看板', permissions: ['AST_REPORT_DASHBOARD'], keepAlive: true },
            component: () => import('@/views/asset/report/dashboard/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
