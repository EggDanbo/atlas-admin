/**
 * 模块字段 → 枚举 映射
 *
 * 枚举是数据属性，不应该在每个页面的 transform 配置里各写一遍。
 * 这里集中声明「哪个模块的哪个字段用哪套枚举」，供两处使用：
 * - mock 生成列表/详情数据时按枚举取值，保证单元格是 1/2/3 而不是随机中文
 * - 列定义（dataformat）据此挂上 enums，表格自动翻译成中文
 *
 * 键为接口模块名，与 `src/views` 下的目录路径一致。
 */

export const FIELD_ENUMS: Record<string, Record<string, string>> = {

  // ---------------- 资产 ----------------
  'asset/info': {
    source: 'asset_info_source',
    methods: 'asset_info_method',
  },

  // ---------------- 档案 ----------------
  'archive/borrow': {
    types: 'paper_borrow_types',
    states: 'paper_borrow_states',
  },

  // ---------------- 组织与权限 ----------------
  'access/member': {
    gender: 'organ_user_gender',
    types: 'organ_user_types',
  },
  'access/partner': {
    types: 'organ_outer_types',
  },

  // ---------------- 主数据 ----------------
  'masterdata/subject': {
    direction: 'basic_content_direction',
    types: 'basic_content_types',
  },
  'masterdata/carryover': {
    source: 'basic_pattern_source',
    types: 'basic_pattern_types',
  },
  'masterdata/payroll-item': {
    field_type: 'basic_salary_types',
  },
  'masterdata/bank-account': {
    types: 'basic_account_types',
    bank: 'basic_account_bank',
  },
  'masterdata/asset-category': {
    types: 'basic_asset_types',
    methods: 'basic_asset_method',
  },
  'masterdata/cashflow-item': {
    direction: 'basic_cashflow_direction',
    types: 'basic_cashflow_types',
  },
}

/** 取某模块某字段的枚举名 */
export function resolveFieldEnum(module: string, field: string): string | undefined {
  return FIELD_ENUMS[module]?.[field]
}
