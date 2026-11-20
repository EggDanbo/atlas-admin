import { expect, test } from './support/fixtures'
import { collectLeafRoutes } from './support/routes'

/**
 * 全量路由巡检
 *
 * 路由是约定式注册的，新增一个模块只要丢一个文件进去就生效 —— 好处是快，
 * 代价是没有任何地方强制你验证它能不能打开。这里直接解析路由文件，
 * 把每个叶子路由都访问一遍，断言：页面渲染出来了、没有 404 文案、控制台没有报错。
 *
 * 按模块分组，失败时能立刻看出是哪个业务域炸了。
 */
/** 全屏页面不走 .page-container 容器，单独断言它们的根节点 */
const FULLSCREEN_ROUTES: Record<string, string> = {
  '/dashboard/screen': '.screen',
}

const routes = collectLeafRoutes()
const byModule = new Map<string, typeof routes>()
for (const route of routes) {
  const list = byModule.get(route.module) ?? []
  list.push(route)
  byModule.set(route.module, list)
}

test(`路由清单非空（当前 ${routes.length} 个叶子路由）`, () => {
  expect(routes.length).toBeGreaterThan(50)
})

for (const [module, moduleRoutes] of byModule) {
  test.describe(`路由巡检 · ${module}`, () => {
    // 一个模块的路由逐条打开，单条失败不影响同模块其他页面
    for (const route of moduleRoutes) {
      test(`${route.path} 正常渲染`, async ({ page }) => {
        const errors: string[] = []
        page.on('console', (message) => {
          if (message.type() === 'error')
            errors.push(message.text())
        })
        page.on('pageerror', error => errors.push(error.message))

        await page.goto(route.path)

        const rootSelector = FULLSCREEN_ROUTES[route.path] ?? '.page-container'
        await expect(page.locator(rootSelector).first()).toBeVisible()
        const body = await page.locator('body').innerText()
        expect(body, '页面疑似落到 404').not.toMatch(/页面不存在|404 Not Found/i)
        expect(body.trim().length, '页面一片空白').toBeGreaterThan(20)

        expect(errors, `控制台报错：\n${errors.join('\n')}`).toEqual([])
      })
    }
  })
}
