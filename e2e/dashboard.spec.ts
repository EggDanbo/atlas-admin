import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

/**
 * 工作台概览
 *
 * 这一页的每个数字都是从列表算出来的，所以断言的重点是「两边一致」，
 * 而不是「等于某个写死的数」—— 写死数字一改数据就红，等于没有价值。
 */
async function statValue(page: Page, label: string) {
  const card = page.locator('.stat').filter({ hasText: label })
  const text = await card.locator('.stat__value').innerText()
  return Number(text.replace(/\D/g, ''))
}

test.describe('工作台概览', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/overview')
    await expect(page.locator('.todo-item').first()).toBeVisible()
  })

  test('待办条数与列表实际长度一致', async ({ page }) => {
    const rows = await page.locator('.todo-item').count()
    expect(rows).toBeGreaterThan(0)
    expect(await statValue(page, '待我审批')).toBe(rows)
  })

  test('行内通过：列表与指标卡同步减少', async ({ page }) => {
    const before = await statValue(page, '待我审批')
    const rowsBefore = await page.locator('.todo-item').count()

    await page.locator('.todo-item').first().getByRole('button', { name: '通过' }).click()

    await expect(page.locator('.n-message').first()).toContainText('已通过')
    await expect(page.locator('.todo-item')).toHaveCount(rowsBefore - 1)
    await expect.poll(() => statValue(page, '待我审批')).toBe(before - 1)
  })

  test('退回要二次确认，确认后该条消失', async ({ page }) => {
    const rowsBefore = await page.locator('.todo-item').count()

    await page.locator('.todo-item').first().getByRole('button', { name: '退回' }).click()
    await expect(page.locator('.n-dialog')).toContainText('确定退回')
    await page.locator('.n-dialog').getByRole('button', { name: /退\s*回/ }).click()

    await expect(page.locator('.todo-item')).toHaveCount(rowsBefore - 1)
  })

  test('切到「我的申请」：没有审批按钮，状态是审批中', async ({ page }) => {
    await page.locator('.seg__item').filter({ hasText: '我的申请' }).click()

    await expect(page.locator('.seg__item.is-active')).toContainText('我的申请')
    const first = page.locator('.todo-item').first()
    await expect(first.getByRole('button', { name: '通过' })).toHaveCount(0)
    await expect(first).toContainText('审批中')
  })

  test('全部通过后进入空状态', async ({ page }) => {
    await page.getByRole('button', { name: '全部通过' }).click()
    await page.locator('.n-dialog').getByRole('button', { name: /全部通过/ }).click()

    await expect(page.locator('.n-message').first()).toContainText('已通过')
    await expect(page.locator('.todo-item')).toHaveCount(0)
    await expect(page.locator('.todo-list__empty')).toBeVisible()
    expect(await statValue(page, '待我审批')).toBe(0)
  })

  test('点待办条目跳到对应业务列表', async ({ page }) => {
    const first = page.locator('.todo-item').first()
    const bizName = await first.locator('.todo-item__title').innerText()

    await first.click()

    // 重建后的模块不再单独维护详情表单，宿主组件会把人送到对应的列表页
    await expect(page).toHaveURL(/\/(asset|expense|archive)\//)
    await expect(page.locator('.n-message').first()).toContainText('已并入列表页')
    expect(bizName).not.toBe('')
  })

  test('刷新按钮能重新拉数据且不报错', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.getByRole('button', { name: '刷新' }).click()

    await expect(page.locator('.todo-item').first()).toBeVisible()
    expect(errors).toEqual([])
  })
})
