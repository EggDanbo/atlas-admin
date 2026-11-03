/**
 * 演示账号的权限数据
 *
 * 思路：从路由声明中提取全部权限码，再补齐列表页操作按钮使用的动作后缀，
 * 使演示账号成为「拥有全部权限的普通用户」——
 * 这样既能看全菜单与操作按钮，又能呈现普通员工的工作台视图。
 */
import { ROUTE_PERMISSIONS } from '../schema/schema.generated'

/** 列表页/详情页使用的动作权限后缀 */
const ACTION_SUFFIXES = ['ADD', 'EDIT', 'DELE', 'EXPORT', 'PRINT', 'AUDIT']

/** 模块前缀 → 中文分组名 */
const MODULE_LABELS: Record<string, string> = {
  BOARD: '我的看板',
  STAFF: '人事管理',
  TRADE: '业务管理',
  ASSET: '资产管理',
  PENSE: '费用报销',
  VOUCH: '账务处理',
  PAPER: '档案管理',
  BASIC: '基础资料',
  ORGAN: '组织机构',
  PERMIT: '用户权限',
  SYSTEM: '系统设置',
  EXTERNAL: '外部接口',
  // 系统设置与组织机构下未加模块前缀的权限码
  ACCOUNT: '会计科目',
  ARTICLE: '内容管理',
  CACHE: '缓存重置',
  DICTIONARY: '数据字典',
  GROUP: '权限组',
  HTTPJOB: '定时任务',
  LOG: '系统日志',
  MESSAGE: '消息通知',
  OUTER: '外部用户',
  ROLE: '角色管理',
  ROOM: '会议室',
  SETTINGS: '系统参数',
  SMS: '短信配置',
  TEAM: '部门管理',
  USER: '用户管理',
  USERGRID: '用户网格',
}

/** 演示账号拥有的全部权限码 */
export const DEMO_PERMISSION_CODES: string[] = [
  ...ROUTE_PERMISSIONS,
  ...ROUTE_PERMISSIONS.flatMap(code => ACTION_SUFFIXES.map(suffix => `${code}_${suffix}`)),
]

/**
 * 构建权限树（供用户权限分配弹窗展示）
 */
export function buildPermissionTree(): Auth.Permission[] {
  const groups = new Map<string, Auth.Permission[]>()

  for (const code of ROUTE_PERMISSIONS) {
    const parts = code.split('_')
    const moduleKey = parts[1] || 'OTHER'
    if (!groups.has(moduleKey))
      groups.set(moduleKey, [])
    groups.get(moduleKey)!.push({
      id: code,
      title: parts.slice(2).join('_') || code,
      children: ACTION_SUFFIXES.map(suffix => ({
        id: `${code}_${suffix}`,
        title: suffix,
        children: [],
      })),
    })
  }

  return [...groups.entries()].map(([key, children]) => ({
    id: key,
    title: MODULE_LABELS[key] || key,
    children,
  }))
}
