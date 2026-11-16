import fs from 'node:fs'
import path from 'node:path'

/** 登录态缓存文件：setup 项目写入，其余项目读取 */
export const STORAGE_STATE = path.resolve(import.meta.dirname, '../.auth/user.json')

/**
 * sessionStorage 快照
 *
 * 本项目的 access token 存在 sessionStorage（刷新页面仍在、关标签即失效），
 * 而 Playwright 的 storageState 只保存 localStorage 和 cookie —— 只靠它，
 * 每个用例打开页面都会被踢回登录页。所以 setup 额外存一份 sessionStorage，
 * 由 fixtures 在每次导航前注入。
 */
export const SESSION_FILE = path.resolve(import.meta.dirname, '../.auth/session.json')

/** 演示账号：mock 的 authorize 接口对任意账号都发 token */
export const DEMO_USER = {
  username: 'demo',
  password: '123456',
}

export function readSessionEntries(): Record<string, string> {
  try {
    const raw = fs.readFileSync(SESSION_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  }
  catch {
    // 第一次跑还没生成快照，交给 setup 处理
    return {}
  }
}

export function writeSessionEntries(entries: Record<string, string>) {
  // .auth 目录是被 gitignore 的，干净 checkout 里并不存在，写之前得先建出来
  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true })
  fs.writeFileSync(SESSION_FILE, JSON.stringify(entries))
}
