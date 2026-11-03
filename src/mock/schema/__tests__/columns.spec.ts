import { describe, expect, it } from 'vitest'
import { buildColumns, resolveModuleDir } from '../columns'

/**
 * 表格列生成
 *
 * dataformat 接口下发的列由这里产出，是 110 个列表页共用的链路，
 * 因此重点守住：格式名能解析到模块、列标题不重复不为空、隐藏字段不外泄。
 */
describe('resolveModuleDir', () => {
  it('完整格式名直接命中模块', () => {
    expect(resolveModuleDir('asset/info')).toBe('asset/info')
    expect(resolveModuleDir('access/role')).toBe('access/role')
  })

  it('带命名空间前缀的格式名能按后缀解析', () => {
    expect(resolveModuleDir('atlas/crm/invoice')).toBe('crm/invoice')
    expect(resolveModuleDir('atlas/hr/roster')).toBe('hr/roster')
  })

  it('日志类前缀别名指向统一的日志模块', () => {
    expect(resolveModuleDir('logs/app')).toBe('system/log')
    expect(resolveModuleDir('logs/bizlog')).toBe('system/log')
  })

  it('无法识别的格式名返回 null', () => {
    expect(resolveModuleDir('not-a-module/xyz')).toBeNull()
    expect(resolveModuleDir(undefined)).toBeNull()
  })
})

describe('buildColumns', () => {
  it('为已知模块生成带标题的列', () => {
    const columns = buildColumns('atlas/crm/invoice')
    expect(columns.length).toBeGreaterThan(0)
    for (const column of columns) {
      expect(column.column).toBeTruthy()
      expect(column.title).toBeTruthy()
      expect(column.width).toBeGreaterThan(0)
    }
  })

  it('列标题互不重复', () => {
    for (const name of ['atlas/crm/invoice', 'asset/info', 'access/role', 'hr/roster']) {
      const titles = buildColumns(name).map(item => item.title)
      expect(new Set(titles).size).toBe(titles.length)
    }
  })

  it('不下发隐藏字段（id / sort / stoped 等由页面自行渲染）', () => {
    const fields = buildColumns('asset/info').map(item => item.column)
    expect(fields).not.toContain('id')
    expect(fields).not.toContain('sort')
    expect(fields).not.toContain('stoped')
  })

  it('角色类格式使用台账字段而不是授权表单字段', () => {
    const columns = buildColumns('access/role')
    const titles = columns.map(item => item.title)
    expect(titles).toContain('角色名称')
    expect(titles).toContain('数据范围')
    // 授权表单里的纵向树字段不应出现在列表
    expect(titles).not.toContain('权限')
  })

  it('未知格式回退到通用单据列，保证表格不为空', () => {
    const columns = buildColumns('unknown/module')
    expect(columns.length).toBeGreaterThan(3)
    expect(columns.map(item => item.title)).toContain('单号')
  })

  it('状态列标记为枚举类型，便于表格显示中文', () => {
    const status = buildColumns('atlas/crm/invoice').find(item => item.column === 'status')
    expect(status?.type).toBe('enums')
  })
})
