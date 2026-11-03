import { intersection } from 'lodash-es'
import { findNodeAll, forEach } from './helper/treeHelper'

/**
 * 权限匹配函数
 * @param configPermissions 配置的权限要求（如路由的 meta.permissions 或按钮的权限要求）
 * @param userPermissions 当前用户的权限列表
 * @param allPermissions 系统完整权限树
 * @returns 是否有权限
 *
 * @example
 * // 前缀匹配：配置 ORGAN，用户有 ORGAN_ADD → true
 * matchPermit(['ORGAN'], ['ORGAN_ADD'], allPermissions)
 *
 * // 精确匹配：配置 ORGAN_ADD，用户有 ORGAN_ADD → true
 * matchPermit(['ORGAN_ADD'], ['ORGAN_ADD'], allPermissions)
 *
 * // 精确匹配：配置 ORGAN_ADD，用户只有 ORGAN → false
 * matchPermit(['ORGAN_ADD'], ['ORGAN'], allPermissions)
 */
export function matchPermit(
  configPermissions: string[],
  userPermissions: string[],
  allPermissions: Auth.Permission[],
): boolean {
  if (!configPermissions || configPermissions.length === 0)
    return true

  const set = new Set<string>()

  // 在权限树中查找所有匹配配置的节点及其子节点
  const list = findNodeAll(allPermissions, (node) => {
    return configPermissions.includes(node.id)
  })

  if (list.length === 0)
    return false

  // 收集所有相关权限ID（包括子节点）
  forEach(list, (node) => {
    set.add(node.id)
  })

  // 检查用户权限是否与收集的权限有交集
  return intersection([...set], userPermissions).length > 0
}
