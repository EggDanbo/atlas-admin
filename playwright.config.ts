import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * E2E 配置
 *
 * - 被测对象是纯前端应用（本地 mock 拦截请求），不需要任何后端
 * - 跑在构建产物上（vite preview）而不是 dev server：dev 是按路由按需编译的，
 *   路由巡检第一次跑要把几十个页面全编一遍，慢且容易被首个访问拖到超时
 * - 只跑 chromium：演示项目要验证的是交互与数据自洽，不是浏览器兼容矩阵
 */
const PORT = Number(process.env.E2E_PORT ?? 5199)
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // mock 数据是按请求路径确定性生成的，但页面共享同一份 store，
  // 串行跑才能保证「加一条 → 行数 +1」这类断言稳定
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  // CI 机器更慢，断言窗口给宽一点：偶发超时会掩盖真正的问题
  expect: { timeout: process.env.CI ? 20_000 : 10_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 沙箱 / 容器内 Chromium 起不来沙箱，关掉它才能跑；测试环境不涉及安全边界。
    // CI runner 的 /dev/shm 只有 64MB，不关共享内存会让浏览器中途崩掉
    launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  },
  projects: [
    // 先登录一次，把 token 写进 storageState，其余用例不再重复走登录
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm run e2e:serve',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
})
