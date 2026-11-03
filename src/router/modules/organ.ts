import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/organ',
    name: 'organ',
    meta: {
      title: '组织机构',
      icon: 'ant-design:cluster-outlined',
      permissions: ['ORGAN_TEAM', 'ORGAN_ROOM', 'ORGAN_USER', 'ORGAN_OUTER'],
      alwaysShow: true,
      sort: 82,
    },
    children: [
      {
        path: 'team',
        name: 'OrganTeam',
        meta: {
          title: '单位设置',
          permissions: ['ORGAN_TEAM'],
          keepAlive: true,
        },
        component: () => import('@/views/organ/team/index.vue'),
      },
      // {
      //   path: 'room',
      //   name: 'OrganRoom',
      //   meta: {
      //     title: '部门设置',
      //     permissions: ['ORGAN_ROOM'],
      //     keepAlive: true,
      //   },
      //   component: () => import('@/views/organ/room/index.vue'),
      // },
      {
        path: 'user',
        name: 'OrganUser',
        meta: {
          title: '用户设置',
          permissions: ['ORGAN_USER'],
          keepAlive: true,
        },
        component: () => import('@/views/organ/user/index.vue'),
      },
      {
        path: 'outer',
        name: 'OrganOuter',
        meta: {
          title: '外部机构',
          permissions: ['ORGAN_OUTER'],
          keepAlive: true,
        },
        component: () => import('@/views/organ/outer/index.vue'),
      },
    ],
  },
]
export default routes
