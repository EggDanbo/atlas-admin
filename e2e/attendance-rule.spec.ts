import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

/**
 * 打开「新增规则」弹窗
 *
 * 首屏 chunk 刚执行完时，按钮已经渲染但事件可能还没挂上，
 * 第一次点击会落空。这里点一次没反应就再点一次，避免偶发失败。
 */
async function openEditForm(page: Page, index = 0) {
  const form = page.locator('.rule-form__body:visible')
  const buttons = page.getByRole('button', { name: /编\s*辑/ })
  await expect.poll(async () => {
    if (await form.count())
      return true
    await buttons.nth(index).click()
    await page.waitForTimeout(500)
    return (await form.count()) > 0
  }, { timeout: 20_000 }).toBe(true)
  return form
}

async function openCreateForm(page: Page) {
  const form = page.locator('.rule-form__body:visible')
  const button = page.getByRole('button', { name: '新增规则' })
  await expect(button).toBeEnabled()
  await expect.poll(async () => {
    if (await form.count())
      return true
    await button.click()
    await page.waitForTimeout(500)
    return (await form.count()) > 0
  }, { timeout: 20_000 }).toBe(true)
  return form
}

/**
 * 考勤规则
 *
 * 这一页的重点不是「有张表」，而是「生效时间」这条链路：
 * 新增时能选四种生效方式、选「暂不生效」的行整行淡化、编辑改回立即生效后淡化消失。
 * 一条用例从新增走到删除，是因为 mock 的写操作只存在内存里，换一次页面就复位了。
 */
test.describe('考勤规则', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hr/attendance/rule')
    await expect(page.locator('.vxe-body--row').first()).toBeVisible()
  })

  test('列表渲染，暂不生效的行整行淡化', async ({ page }) => {
    const rows = page.locator('.vxe-body--row')
    expect(await rows.count()).toBeGreaterThan(4)

    const muted = page.locator('.vxe-body--row.rule-row--muted')
    expect(await muted.count()).toBeGreaterThan(0)
    // 淡化只应该出现在「暂不生效」这一档上
    await expect(muted.first()).toContainText('暂不生效')
  })

  test('新增选暂不生效 → 淡化 → 改成立即生效 → 删除', async ({ page }) => {
    // vxe 弹窗关闭后 DOM 会留在页面里，多个实例并存时只看可见的那个
    const form = page.locator('.rule-form__body:visible')

    await expect(page.getByRole('button', { name: '新增规则' })).toBeEnabled()
    await openCreateForm(page)

    // 规则名称
    await form.getByPlaceholder('如：总部标准班次').fill('E2E 弹性班次')

    // 适用部门：多选下拉，选第一个部门后关掉下拉
    await form.locator('.n-base-selection').first().click()
    await page.locator('.n-base-select-option').first().click()
    await page.keyboard.press('Escape')

    // 生效时间：点开弹窗选「暂不生效」
    await form.locator('.eff').click()
    const picker = page.locator('.n-modal').filter({ hasText: '立即生效' })
    await expect(picker).toBeVisible()
    await picker.locator('.eff-option').filter({ hasText: '暂不生效' }).click()
    await picker.getByRole('button', { name: '确定' }).click()
    await expect(form.locator('.eff')).toContainText('暂不生效')

    // 保存
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.locator('.n-message').first()).toContainText('已新增')
    // 保存后弹窗有一段关闭动画，动画期间点「编辑」会被吞掉，等它彻底收起
    await expect(page.locator('.rule-form__body:visible')).toHaveCount(0)

    const row = page.locator('.vxe-body--row').filter({ hasText: 'E2E 弹性班次' })
    await expect(row).toHaveCount(1)
    await expect(row).toHaveClass(/rule-row--muted/)

    // 编辑：把生效时间改回立即生效，淡化应该消失。
    // 表格有固定列时会拆成两张表渲染，按行过滤拿不到操作按钮，
    // 新增的行固定在第一行，直接点第一个「编辑」
    await openEditForm(page)
    await form.locator('.eff').click()
    await expect(picker).toBeVisible()
    await picker.locator('.eff-option').filter({ hasText: '立即生效' }).click()
    await picker.getByRole('button', { name: '确定' }).click()
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.locator('.n-message').first()).toContainText('已保存')
    await expect(page.locator('.rule-form__body:visible')).toHaveCount(0)

    await expect(row).not.toHaveClass(/rule-row--muted/)

    // 删除
    await page.getByRole('button', { name: /删\s*除/ }).first().click()
    await page.locator('.n-dialog').getByRole('button', { name: /删\s*除/ }).click()
    await expect(page.locator('.vxe-body--row').filter({ hasText: 'E2E 弹性班次' })).toHaveCount(0)
  })

  test('排班制维护班次：默认一条，可增删，交接间隔只在排班制出现', async ({ page }) => {
    // vxe 弹窗关闭后 DOM 会留在页面里，多个实例并存时只看可见的那个
    const form = page.locator('.rule-form__body:visible')
    await expect(page.getByRole('button', { name: '新增规则' })).toBeEnabled()
    await page.getByRole('button', { name: '新增规则' }).click()
    await expect(form).toBeVisible()

    await form.locator('.n-radio-button').filter({ hasText: '排班制' }).click()

    // 切到排班制就该有一条默认班次，否则表单是空的无从下手
    await expect(form.locator('.rule-form__shift')).toHaveCount(1)
    await expect(form.getByText('交接间隔')).toBeVisible()

    await form.getByRole('button', { name: '添加班次' }).click()
    await expect(form.locator('.rule-form__shift')).toHaveCount(2)

    // 至少留一条，删到只剩一条时按钮置灰
    await form.locator('.rule-form__shift').nth(1).getByRole('button', { name: /删\s*除/ }).click()
    await expect(form.locator('.rule-form__shift')).toHaveCount(1)
    await expect(form.locator('.rule-form__shift').first().getByRole('button', { name: /删\s*除/ })).toBeDisabled()

    // 切回固定班次：班次还在（固定班次同样支持多个），但排班表与交接间隔收起
    await form.locator('.n-radio-button').filter({ hasText: '固定班次' }).click()
    await expect(form.getByText('排班表')).toHaveCount(0)
    await expect(form.getByText('交接间隔')).toHaveCount(0)
  })

  test('固定班次支持多个班次，工作日不能重复占用', async ({ page }) => {
    const form = await openCreateForm(page)

    // 新建默认一个班次，周一到周五
    await expect(form.locator('.rule-form__shift')).toHaveCount(1)
    const first = form.locator('.rule-form__shift').first()
    await expect(first.locator('.n-checkbox').first()).toHaveClass(/n-checkbox--checked/)

    await form.getByRole('button', { name: '添加班次' }).click()
    await expect(form.locator('.rule-form__shift')).toHaveCount(2)

    // 第二个班次里，第一个班次已经占掉的周一不能再选，周日还空着
    const second = form.locator('.rule-form__shift').nth(1)
    await expect(second.locator('.n-checkbox').first()).toHaveClass(/n-checkbox--disabled/)
    await expect(second.locator('.n-checkbox').last()).not.toHaveClass(/n-checkbox--disabled/)
  })

  test('「指定日期」才出现日期选择', async ({ page }) => {
    // vxe 弹窗关闭后 DOM 会留在页面里，多个实例并存时只看可见的那个
    const form = page.locator('.rule-form__body:visible')
    await expect(page.getByRole('button', { name: '新增规则' })).toBeEnabled()
    await page.getByRole('button', { name: '新增规则' }).click()
    await expect(form).toBeVisible()

    await form.locator('.eff').click()
    const picker = page.locator('.n-modal').filter({ hasText: '立即生效' })
    await picker.locator('.eff-option').filter({ hasText: '指定日期' }).click()
    await expect(picker.locator('.n-date-picker')).toBeVisible()

    await picker.locator('.eff-option').filter({ hasText: '明日生效' }).click()
    await expect(picker.locator('.n-date-picker')).toHaveCount(0)
  })
})
