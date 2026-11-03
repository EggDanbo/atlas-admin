import type { RouteLocationRaw, Router } from 'vue-router'

import { isString } from 'lodash-es'
import { unref } from 'vue'

import { useRouter } from 'vue-router'
import { HOME_ROUTE_PATH } from '@/config/page'
import { RedirectName } from '@/router/base'

export type RouteLocationRawEx = Omit<RouteLocationRaw, 'path'> & { path: string, name?: string }

function handleError(e: Error) {
  console.error(e)
}

/**
 * 页面切换
 */
export function useGo(_router?: Router) {
  let router
  if (!_router) {
    router = useRouter()
  }
  const { push, replace } = _router || router
  function go(opt: RouteLocationRawEx | string = HOME_ROUTE_PATH, isReplace = false) {
    if (!opt) {
      return
    }
    if (isString(opt)) {
      isReplace ? replace(opt).catch(handleError) : push(opt).catch(handleError)
    }
    else {
      const o = opt
      isReplace ? replace(o).catch(handleError) : push(o).catch(handleError)
    }
  }
  return go
}

/**
 * 重做当前页面
 */
export function useRedo(_router?: Router) {
  const { push, currentRoute } = _router || useRouter()
  const { query, params = {}, name, fullPath } = unref(currentRoute.value)
  function redo(): Promise<boolean> {
    return new Promise((resolve) => {
      if (name === RedirectName) {
        resolve(false)
        return
      }
      if (name && Object.keys(params).length > 0) {
        params._origin_params = JSON.stringify(params ?? {})
        params.path = String(name)
      }
      else {
        params.path = fullPath
      }
      push({ name: RedirectName, params, query }).then(() => resolve(true))
    })
  }
  return redo
}
