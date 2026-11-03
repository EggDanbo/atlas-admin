import type { RouteRecordRaw } from 'vue-router'
import { ERROR_ROUTE_NAME, HOME_ROUTE_NAME, HOME_ROUTE_PATH, LOGIN_ROUTE_NAME } from '@/config/page'

export const RedirectName = 'Redirect'
export const Layout = () => import('@/layout/default.vue')
export const Iframe = () => import('@/views/needs/iframe/index.vue')
export const ErrorPage = () => import('@/views/needs/exception/404.vue')

/**
 * 根路由 动态路由都会添加到这个路由下
 */
export const rootRoute: RouteRecordRaw = {
  path: '/',
  name: HOME_ROUTE_NAME,
  redirect: HOME_ROUTE_PATH,
  component: Layout,
  children: [],
  meta: {},
}
/**
 * 登录页面
 */
export const rootLogin: RouteRecordRaw = {
  path: '/login',
  name: LOGIN_ROUTE_NAME,
  meta: {
    title: '登录',
  },
  component: () => import('@/views/login/login.vue'),
}

/**
 * 404 错误页面
 */
export const errorRoute: RouteRecordRaw = {
  path: '/:path(.*)*',
  name: ERROR_ROUTE_NAME,
  component: ErrorPage,
  meta: {
    title: '404',
  },
}
