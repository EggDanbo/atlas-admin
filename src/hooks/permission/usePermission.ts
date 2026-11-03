import { useUserStore } from '@/store/modules/user'
import { matchPermit } from '@/utils/permission'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * 判断是否有权限（支持前缀匹配）
   * @param accesses 配置的权限要求
   * @returns 是否有权限
   *
   * @example
   * // 前缀匹配：配置 ORGAN，用户有 ORGAN_ADD → true
   * hasPermission(['ORGAN'])
   *
   * // 精确匹配：配置 ORGAN_ADD，用户有 ORGAN_ADD → true
   * hasPermission(['IAM_UNIT_ADD'])
   *
   * // 精确匹配：配置 ORGAN_ADD，用户只有 ORGAN → false
   * hasPermission(['IAM_UNIT_ADD'])
   */
  function hasPermission(accesses: string[]): boolean {
    if (!accesses || !accesses.length)
      return true
    if (userStore.isAdmin)
      return true
    return matchPermit(accesses, userStore.userPermissions, userStore.allPermissions)
  }

  /**
   * 是否包含指定的所有权限
   * @param accesses
   */
  function hasEveryPermission(accesses: string[]): boolean {
    if (!accesses || !accesses.length)
      return true
    if (userStore.isAdmin)
      return true
    // 用户必须拥有所有配置的权限
    return accesses.every(access =>
      matchPermit([access], userStore.userPermissions, userStore.allPermissions),
    )
  }

  /**
   * 是否包含其中某个权限
   * @param accesses
   */
  function hasSomePermission(accesses: string[]): boolean {
    if (!accesses || !accesses.length)
      return true
    if (userStore.isAdmin)
      return true
    // 用户拥有任一配置的权限即可
    return accesses.some(access =>
      matchPermit([access], userStore.userPermissions, userStore.allPermissions),
    )
  }

  return { hasPermission, hasEveryPermission, hasSomePermission }
}
