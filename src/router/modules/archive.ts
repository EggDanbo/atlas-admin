import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/archive',
    name: 'Archive',
    meta: {
      title: '文档中心',
      icon: 'ant-design:folder-open-outlined',
      permissions: ['DOC_DOCUMENT', 'DOC_BORROW'],
      alwaysShow: true,
      sort: 60,
    },
    children: [
      {
        path: 'document',
        name: 'ArchiveDocument',
        meta: {
          title: '文档库',
          permissions: ['DOC_DOCUMENT'],
          keepAlive: true,
        },
        component: () => import('@/views/archive/document/index.vue'),
      },
      {
        path: 'borrow',
        name: 'ArchiveBorrow',
        meta: {
          title: '借阅',
          permissions: ['DOC_BORROW'],
          keepAlive: true,
        },
        component: () => import('@/views/archive/borrow/index.vue'),
      },
    ],
  },
]

export default routes
