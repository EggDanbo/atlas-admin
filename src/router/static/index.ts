import type { RouteRecordRaw } from 'vue-router'
import { rootLogin, rootRoute } from '@/router/base'
import noneRoutes from './none'

/**
 * 静态路由 不需要权限验证
 */
export const staticRoutes: RouteRecordRaw[] = [
  { ...rootRoute },
  {
    ...rootLogin,
  },
  ...noneRoutes,
]
