import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * 单元测试配置
 *
 * 只覆盖与渲染无关的纯逻辑（mock 引擎、schema 解析、权限匹配、工具函数），
 * 因此使用 node 环境，不额外引入 jsdom，跑起来足够快。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.spec.ts'],
    reporters: 'default',
  },
})
