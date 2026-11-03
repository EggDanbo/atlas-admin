import type { App } from 'vue'

import { debounce } from '@/directives/debounce'
import { loading } from '@/directives/loading/loading'
import { perm, permHide } from '@/directives/permission'
import { throttle } from '@/directives/throttle'

/**
 * 注册全局自定义指令
 * @param app
 */
export function setupDirectives(app: App) {
  /**
   * 权限控制指令（演示）
   * 使用方式：v-permission="{ action: 'user:add', effect: 'disabled' }"
   * - action: 权限标识
   * - effect: 'disabled'（禁用）或 'remove'（移除元素）
   */
  app.directive('permission', perm)
  app.directive('perm', perm)
  app.directive('permHide', permHide)
  /**
   * 防抖指令
   * 使用方式：v-debounce="500" 或 v-debounce:500
   * - 500: 防抖延迟时间，单位为毫秒
   * - 也可以传入一个函数作为参数，表示防抖处理的函数
   */
  app.directive('debounce', debounce)
  /**
   * 节流指令
   * 使用方式：v-throttle="500" 或 v-throttle:500
   * - 500: 节流延迟时间，单位为毫秒
   * - 也可以传入一个函数作为参数，表示节流处理的函数
   */
  app.directive('throttle', throttle)
  /**
   * 全局加载指令
   * 使用方式：v-loading="true" 或 v-loading="{ fullscreen: true }"
   */
  app.directive('loading', loading)
}
