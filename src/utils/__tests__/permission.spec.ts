import { describe, expect, it } from 'vitest'
import { matchPermit } from '../permission'

/**
 * 权限匹配
 *
 * 系统里有两种写法：菜单/模块级用短码（`IAM_UNIT`），按钮级用完整码
 * （`IAM_UNIT_ADD`）。匹配器需要同时支持「配置短码检查子树」与
 * 「配置完整码精确校验」，这里把两种语义都固化下来。
 */
const permissionTree = [
  {
    id: 'IAM_UNIT',
    name: '组织单元',
    children: [
      { id: 'IAM_UNIT_ADD', name: '新增' },
      { id: 'IAM_UNIT_EDIT', name: '编辑' },
      { id: 'IAM_UNIT_DELE', name: '删除' },
    ],
  },
  {
    id: 'FIN_VOUCHER',
    name: '会计凭证',
    children: [
      { id: 'FIN_VOUCHER_ADD', name: '新增' },
    ],
  },
] as unknown as Auth.Permission[]

describe('matchPermit', () => {
  it('未配置权限要求时默认放行', () => {
    expect(matchPermit([], ['IAM_UNIT_ADD'], permissionTree)).toBe(true)
  })

  it('配置模块级短码时，拥有任一子权限即通过', () => {
    expect(matchPermit(['IAM_UNIT'], ['IAM_UNIT_ADD'], permissionTree)).toBe(true)
    expect(matchPermit(['IAM_UNIT'], ['IAM_UNIT_DELE'], permissionTree)).toBe(true)
  })

  it('配置模块级短码但没有任何子权限时不通过', () => {
    expect(matchPermit(['IAM_UNIT'], ['FIN_VOUCHER_ADD'], permissionTree)).toBe(false)
  })

  it('配置按钮级完整码时精确匹配', () => {
    expect(matchPermit(['IAM_UNIT_ADD'], ['IAM_UNIT_ADD'], permissionTree)).toBe(true)
    expect(matchPermit(['IAM_UNIT_ADD'], ['IAM_UNIT_EDIT'], permissionTree)).toBe(false)
  })

  it('拥有短码本身也算通过', () => {
    expect(matchPermit(['IAM_UNIT'], ['IAM_UNIT'], permissionTree)).toBe(true)
  })

  it('权限树中不存在该权限码时不通过', () => {
    expect(matchPermit(['NOT_EXIST'], ['IAM_UNIT_ADD'], permissionTree)).toBe(false)
  })

  it('多个权限要求之间是「任一满足」语义', () => {
    expect(matchPermit(['IAM_UNIT_ADD', 'FIN_VOUCHER_ADD'], ['FIN_VOUCHER_ADD'], permissionTree)).toBe(true)
  })
})
