import { test as base } from '@playwright/test'
import { readSessionEntries } from './paths'

/**
 * 自定义 test：把 sessionStorage 里的会话补回来
 *
 * storageState 只覆盖 localStorage / cookie，而本项目的 token 在 sessionStorage，
 * 所以每次导航前用 addInitScript 先把快照写进去，页面启动时就是已登录状态。
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    const entries = readSessionEntries()
    if (Object.keys(entries).length) {
      await context.addInitScript((data: Record<string, string>) => {
        try {
          for (const [key, value] of Object.entries(data))
            sessionStorage.setItem(key, value)
        }
        catch {
          // about:blank 之类没有 storage 的上下文，跳过即可
        }
      }, entries)
    }
    await use(context)
  },
})

export { expect } from '@playwright/test'
