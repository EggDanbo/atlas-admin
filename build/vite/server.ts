import type { ConfigEnv, ServerOptions } from 'vite'
import { getEnv, wrapperEnv } from '../utils.ts'
import { createProxy } from './proxy.ts'

/**
 * 创建一个Vite服务器配置对象。
 * 该函数不接受任何参数。
 * @returns {ServerOptions} 返回一个包含Vite服务器配置的对象。
 */
export function createServer({ mode }: ConfigEnv): ServerOptions {
  const env = getEnv(mode)
  const viteEnv = wrapperEnv(env)
  const { VITE_PORT, VITE_PROXY } = viteEnv
  return {
    allowedHosts: true,
    host: true, // 服务器主机名
    port: VITE_PORT, // 服务器端口号
    strictPort: false, // 端口已被占用、尝试下一个可用端口
    // open: true, // 自动打开应用程序
    // 跨域处理
    proxy: createProxy(VITE_PROXY),
    hmr: {
      overlay: true,
    },
  }
}
