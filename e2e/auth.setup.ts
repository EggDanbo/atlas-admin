import { expect, test as setup } from '@playwright/test'
import { DEMO_USER, STORAGE_STATE, writeSessionEntries } from './support/paths'

/**
 * 登录一次，把会话存下来
 *
 * 每个用例都从登录页走一遍会拖慢整体耗时，也会把登录页的问题放大成全局失败。
 * CI 的机器比本地慢，首屏资源是冷盘，这里把等待时间放宽到 60 秒。
 */
setup.setTimeout(120_000)

setup('登录并缓存会话', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 })

  const account = page.getByPlaceholder('请输入账号')
  await expect(account).toBeVisible({ timeout: 60_000 })
  await account.fill(DEMO_USER.username)
  await page.getByPlaceholder('请输入密码').fill(DEMO_USER.password)

  // 按钮文字渲染成「登 录」（两个字之间有字距），用正则会命中
  await page.getByRole('button', { name: /登\s*录/ }).click()

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 60_000 })
  await expect(page.locator('.page-container').first()).toBeVisible({ timeout: 60_000 })

  // token 在 sessionStorage，storageState 存不到，单独存一份
  const entries = await page.evaluate(() =>
    Object.fromEntries(Object.entries(sessionStorage)) as Record<string, string>,
  )
  expect(Object.keys(entries).length).toBeGreaterThan(0)
  writeSessionEntries(entries)

  await page.context().storageState({ path: STORAGE_STATE })
})
