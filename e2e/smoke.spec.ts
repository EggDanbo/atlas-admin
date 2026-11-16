import { expect, test } from './support/fixtures'

/**
 * 冒烟：应用能起来、能进得去、骨架没缺
 *
 * 这一组是「其他用例失败时先看这里」的第一道门。
 */
test.describe('冒烟', () => {
  test('登录态有效，直接落在工作台概览', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/dashboard\/overview/, { timeout: 30_000 })
    await expect(page.locator('.wb-head__title')).toBeVisible()
    // 问候语按当前时段变化，只要不是空字符串即可
    await expect(page.locator('.wb-head__title')).not.toHaveText('')
  })

  test('工作台骨架完整：指标卡 / 待办 / 图表 / 快捷入口 / 动态', async ({ page }) => {
    await page.goto('/dashboard/overview')

    await expect(page.locator('.stat')).toHaveCount(4)
    await expect(page.locator('.todo-item').first()).toBeVisible()
    await expect(page.locator('.quick__item').first()).toBeVisible()
    // 项目里 ECharts 用的是 SVG 渲染器，用 echarts 挂在容器上的实例标记判断更稳
    await expect(page.locator('.workbench__chart div[_echarts_instance_]')).toBeVisible()
    await expect(page.locator('.activity__item').first()).toBeVisible()
  })

  test('侧栏一级菜单完整渲染', async ({ page }) => {
    await page.goto('/dashboard/overview')

    // 12 个业务域：工作台 / 客户与项目 / 人力资源 / 费用 / 资产 / 采购 / 财务 / 文档 / 主数据 / 组织权限 / 系统 / 归档
    const menu = page.locator('.n-menu').first()
    await expect(menu).toBeVisible()
    await expect.poll(async () => menu.locator('> .n-menu-item, .n-submenu').count()).toBeGreaterThan(8)
  })
})
