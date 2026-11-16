import { expect, test } from './support/fixtures'

/**
 * 列表页：以费用申请单为样板
 *
 * 全站的台账页都是同一套 useListPage + SpRecordForm，这一个页面能跑通，
 * 其余二十多个列表页的骨架就都有保障；页面特有的地方不在这里断言。
 */
test.describe('列表页 · 费用申请单', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/expense/claim/list')
    await expect(page.locator('.vxe-body--row').first()).toBeVisible()
  })

  test('表头与数据行渲染', async ({ page }) => {
    const headers = await page.locator('.vxe-header--column').allInnerTexts()
    const text = headers.join('|')
    for (const title of ['申请单号', '申请人', '部门', '金额', '状态']) {
      expect(text, `表头缺少「${title}」`).toContain(title)
    }
    expect(await page.locator('.vxe-body--row').count()).toBeGreaterThan(0)
  })

  test('查看详情打开面板，关闭后收起', async ({ page }) => {
    await page.getByRole('button', { name: /查\s*看/ }).first().click()

    const closeButton = page.getByRole('button', { name: /关\s*闭/ })
    await expect(closeButton).toBeVisible()
    // 详情面板里应当带上这条单据的字段，而不是一张空表单
    await expect(page.getByText('申请单号', { exact: true }).last()).toBeVisible()

    await closeButton.click()
    await expect(closeButton).toHaveCount(0)
  })

  test('新增：填写必填项后保存成功', async ({ page }) => {
    await page.getByRole('button', { name: /新\s*增/ }).first().click()

    await expect(page.getByPlaceholder('请输入申请人')).toBeVisible()
    await page.getByPlaceholder('请输入申请人').fill('E2E 自动化')
    await page.getByPlaceholder('请输入部门').fill('质量管理部')
    await page.getByPlaceholder('请输入').first().fill('1234')
    await page.locator('input[placeholder="选择日期"]').fill('2026-11-17')
    await page.keyboard.press('Enter')

    await page.getByRole('button', { name: /保\s*存/ }).click()

    await expect(page.locator('.n-message').first()).toContainText('保存成功')
    // 保存成功后表单收起，不会停在原地面板还开着却不知道成没成
    await expect(page.getByRole('button', { name: /保\s*存/ })).toHaveCount(0)
  })

  test('翻页后首行数据变化', async ({ page }) => {
    const firstRow = page.locator('.vxe-body--row').first()
    const before = await firstRow.innerText()

    const pager = page.locator('.vxe-grid--pager-wrapper')
    await expect(pager).toBeVisible()
    await pager.getByText('2', { exact: true }).first().click()

    await expect.poll(async () => (await page.locator('.vxe-body--row').first().innerText())).not.toBe(before)
  })
})
