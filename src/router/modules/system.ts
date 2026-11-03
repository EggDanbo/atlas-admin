import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'system',
    meta: {
      title: '系统设置',
      icon: 'ant-design:scissor-outlined',
      permissions: ['SYSTEM_SETTINGS', 'SYSTEM_DICTIONARY'],
      alwaysShow: true,
      sort: 95,
    },
    children: [
      {
        path: 'settings',
        name: 'SystemSettings',
        meta: {
          title: '系统参数',
          permissions: ['SYSTEM_SETTINGS'],
        },
        component: () => import('@/views/system/settings/index.vue'),
      },
      {
        path: 'dictionary',
        name: 'SystemDictionary',
        meta: {
          title: '选项设置',
          permissions: ['SYSTEM_DICTIONARY'],
          keepAlive: true,
        },
        component: () => import('@/views/system/dictionary/index.vue'),
      },
      {
        path: 'usergrid',
        name: 'SystemUsergrid',
        meta: {
          title: '表格格式',
          permissions: ['SYSTEM_USERGRID'],
          keepAlive: true,
        },
        component: () => import('@/views/system/usergrid/index.vue'),
      },
    ],
  },
  {
    path: '/log',
    name: 'log',
    meta: {
      title: '系统日志',
      icon: 'ant-design:sound-outlined',
      permissions: ['SYSTEM_LOG'],
      alwaysShow: true,
      sort: 98,
    },
    children: [
      {
        path: 'app',
        name: 'LogApp',
        meta: {
          title: '应用日志',
          permissions: ['SYSTEM_LOG'],
          keepAlive: true,
        },
        component: () => import('@/views/system/logs/app.vue'),
      },
      {
        path: 'access',
        name: 'LogAccess',
        meta: {
          title: '访问日志',
          permissions: ['SYSTEM_LOG'],
          keepAlive: true,
        },
        component: () => import('@/views/system/logs/access.vue'),
      },
      {
        path: 'bizlog',
        name: 'LogBizlog',
        meta: {
          title: '操作日志',
          permissions: ['SYSTEM_LOG'],
          keepAlive: true,
        },
        component: () => import('@/views/system/logs/bizlog.vue'),
      },
    ],
  },
]
export default routes
