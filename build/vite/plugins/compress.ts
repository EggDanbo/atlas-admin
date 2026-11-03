import type { Plugin } from 'vite'

import viteCompressPlugin from 'vite-plugin-compression'

export function compressPlugin(
  compress: 'gzip' | 'brotli' | 'none',
  deleteOriginFile = false,
): Plugin | Plugin[] {
  const compressList = compress.split(',')

  const plugins: Plugin[] = []

  if (compressList.includes('gzip')) {
    plugins.push(
      viteCompressPlugin({
        ext: '.gz',
        deleteOriginFile,
      }),
    )
  }
  if (compressList.includes('brotli')) {
    plugins.push(
      viteCompressPlugin({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile,
      }),
    )
  }
  return plugins
}
