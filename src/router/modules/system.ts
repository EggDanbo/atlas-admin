import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'ant-design:tool-outlined',
      permissions: ['SYS_PARAMETER', 'SYS_DICTIONARY', 'SYS_GRID', 'SYS_LOG'],
      alwaysShow: true,
      sort: 90,
    },
    children: [
      {
        path: 'parameter',
        name: 'SystemParameter',
        meta: {
          title: '系统参数',
          permissions: ['SYS_PARAMETER'],
        },
        component: () => import('@/views/system/parameter/index.vue'),
      },
      {
        path: 'dictionary',
        name: 'SystemDictionary',
        meta: {
          title: '数据字典',
          permissions: ['SYS_DICTIONARY'],
          keepAlive: true,
        },
        component: () => import('@/views/system/dictionary/index.vue'),
      },
      {
        path: 'grid',
        name: 'SystemGrid',
        meta: {
          title: '表格格式',
          permissions: ['SYS_GRID'],
          keepAlive: true,
        },
        component: () => import('@/views/system/grid/index.vue'),
      },
      {
        path: 'log',
        name: 'SystemLog',
        meta: {
          title: '操作审计',
          permissions: ['SYS_LOG'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'app',
            name: 'SystemLogApp',
            meta: {
              title: '应用日志',
              permissions: ['SYS_LOG'],
              keepAlive: true,
            },
            component: () => import('@/views/system/log/app.vue'),
          },
          {
            path: 'access',
            name: 'SystemLogAccess',
            meta: {
              title: '访问日志',
              permissions: ['SYS_LOG'],
              keepAlive: true,
            },
            component: () => import('@/views/system/log/access.vue'),
          },
          {
            path: 'operation',
            name: 'SystemLogOperation',
            meta: {
              title: '操作日志',
              permissions: ['SYS_LOG'],
              keepAlive: true,
            },
            component: () => import('@/views/system/log/operation.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
