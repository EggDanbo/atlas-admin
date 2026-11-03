import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/user/center',
    name: 'UserCenter',
    meta: {
      title: '个人中心',
      icon: 'ant-design:user-outlined',
      sort: 6,
      hidden: true,
      activePath: '', // 隐藏菜单，指定一个不存在的路径避免警告
    },
    component: () => import('@/views/user/center.vue'),
  },
  {
    path: '/user/message',
    name: 'UserMessage',
    meta: {
      title: '消息中心',
      icon: 'ant-design:bell-outlined',
      sort: 7,
      hidden: true,
      activePath: '', // 隐藏菜单，空字符串表示不高亮任何菜单
    },
    component: () => import('@/views/user/message/index.vue'),
  },
  {
    path: '/user/apply',
    name: 'UserApply',
    meta: {
      title: '我的申请',
      icon: 'ant-design:edit-outlined',
      sort: 8,
      hidden: true,
      activePath: '', // 隐藏菜单，空字符串表示不高亮任何菜单
    },
    component: () => import('@/views/user/apply.vue'),
  },
  {
    path: '/user/approve',
    name: 'UserApprove',
    meta: {
      title: '我的审批',
      icon: 'ant-design:signature-outlined',
      sort: 9,
      hidden: true,
      activePath: '', // 隐藏菜单，空字符串表示不高亮任何菜单
    },
    component: () => import('@/views/user/approve.vue'),
  },
]
export default routes
