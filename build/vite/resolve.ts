import type { AliasOptions, ResolveOptions } from 'vite'
import path from 'node:path'

// 定义扩展的解析选项类型，包括别名和Vite的解析选项
type TypeResolveOptions = ResolveOptions & { alias?: AliasOptions }

/**
 * 创建并返回一个用于Vite配置的解析选项对象。
 * @param _dirname - 当前工作目录的名称，用于构造别名的路径。
 * @returns 返回一个包含别名和扩展名的解析选项对象。
 */
export function createResolve(_dirname: string): TypeResolveOptions {
  // 创建并配置别名和可解析的文件扩展名
  const alias: Record<string, string> = {
    '@': `${path.resolve(_dirname, 'src')}`,
    '#': `${path.resolve(_dirname, 'src/types')}`,
  }

  return {
    alias,
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], // 指定可解析的文件扩展名
  }
}
