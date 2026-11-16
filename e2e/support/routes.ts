import fs from 'node:fs'
import path from 'node:path'

/**
 * 从路由模块里抽取「真正渲染页面的叶子路由」
 *
 * 路由是约定式注册的（新增模块只加一个 router/modules/<mod>.ts），
 * 巡检如果写死路径清单，新增模块就会漏测。这里直接解析路由文件：
 * 按大括号深度维护一份 path 栈，遇到 component 就说明当前栈是一个可渲染页面。
 *
 * 只解析本项目自己的写法（`path: 'x'` / `component: () => import(...)`），
 * 够用且不引入编译依赖。
 */
export interface LeafRoute {
  path: string
  module: string
}

interface Frame {
  path: string
  hasComponent: boolean
}

const MODULES_DIR = path.resolve(import.meta.dirname, '../../src/router/modules')

function joinPath(parent: string, child: string) {
  if (child.startsWith('/'))
    return child
  const base = parent.replace(/\/+$/, '')
  return `${base}/${child}`
}

function parseModule(file: string): LeafRoute[] {
  const source = fs.readFileSync(file, 'utf8')
  const routes: LeafRoute[] = []
  const stack: Frame[] = []
  let depth = -1

  // 逐字符扫描，只关心括号与两个键：避免被注释、字符串里的括号干扰的可能性很低，
  // 路由文件的字符串里不会出现未转义的大括号
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (char === '{') {
      depth += 1
      stack[depth] = { path: '', hasComponent: false }
      continue
    }
    if (char === '}') {
      const frame = stack[depth]
      if (frame?.hasComponent && frame.path) {
        // 逐级拼出完整路径：三层以上的嵌套（模块 / 分组 / 页面）只用相邻父级会拼错
        let parentPath = ''
        for (let level = 0; level < depth; level++)
          parentPath = joinPath(parentPath, stack[level]?.path ?? '')
        routes.push({ path: joinPath(parentPath, frame.path), module: path.basename(file, '.ts') })
      }
      stack[depth] = undefined as unknown as Frame
      depth -= 1
      continue
    }

    const rest = source.slice(i, i + 40)
    const pathMatch = /^path:\s*'([^']*)'/.exec(rest)
    if (pathMatch) {
      const frame = stack[depth]
      if (frame)
        frame.path = pathMatch[1]!
      continue
    }
    if (rest.startsWith('component:')) {
      const frame = stack[depth]
      if (frame)
        frame.hasComponent = true
    }
  }

  return routes
}

export function collectLeafRoutes(): LeafRoute[] {
  const files = fs.readdirSync(MODULES_DIR).filter(name => name.endsWith('.ts'))
  return files
    .flatMap(file => parseModule(path.join(MODULES_DIR, file)))
    .filter(route => route.path && !route.path.includes(':'))
    .sort((a, b) => a.path.localeCompare(b.path))
}
