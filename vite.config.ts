import type { ConfigEnv } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import { wrapperEnv } from './build/utils.ts'
import { createBuild } from './build/vite/build.ts'
import { createPlugins } from './build/vite/plugins/index.ts'
import { createResolve } from './build/vite/resolve.ts'
import { createServer } from './build/vite/server.ts'

// https://vite.dev/config/
export default defineConfig((configEnv: ConfigEnv) => {
  const { command, mode } = configEnv

  // eslint-disable-next-line node/prefer-global/process
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const viteEnv = wrapperEnv(env)
  const { VITE_PUBLIC_PATH } = viteEnv
  const isBuild = command === 'build'

  return {
    base: VITE_PUBLIC_PATH,
    optimizeDeps: {
      // 预构建核心依赖，减少首次加载时的模块请求数
      // CJS → ESM 转换：仅 CJS 模块需要
      include: [
        'print-js',
      ],
    },
    define: {
      __DEV__: mode === 'development',
    },
    // css配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "@/styles/var.less";`,
        },
      },
      // devSourcemap: false, // 关闭可加速 HMR，但无法定位 Less 源文件
    },
    // 解析配置
    resolve: createResolve(import.meta.dirname ?? root),
    // 插件配置
    plugins: createPlugins(viteEnv, isBuild, configEnv),
    // 打包配置
    build: createBuild(viteEnv),
    // 服务配置
    server: createServer(configEnv),
  }
})
