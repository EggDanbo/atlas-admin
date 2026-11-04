/**
 * 系统枚举字典（演示数据）
 *
 * 保留给 `/common/enums` 接口用；前端展示已改用 `src/dicts` 的本地字典。
 */
import type { SystemEnums } from '@/mock/types'

function createEnum(name: string, entries: Array<[string, string]>): SystemEnums {
  return {
    name,
    items: entries.map(([value, label]) => ({
      name: `item_${value}`,
      label,
      value,
    })),
  }
}

/** 单据状态取值：详情页右上角的印章与状态列都按它翻译 */
const BILL_STATUS_ENTRIES: Array<[string, string]> = [
  ['1', '草稿'],
  ['2', '待审核'],
  ['3', '审批中'],
  ['4', '已审批'],
  ['5', '已完成'],
  ['6', '已作废'],
]

export const SYSTEM_ENUMS: Record<string, SystemEnums> = {
  /** 单据状态 */
  BillStatus: createEnum('BillStatus', BILL_STATUS_ENTRIES),
  /**
   * 单据状态（页面沿用的后端枚举名）
   *
   * 详情页的印章与大量表格调用的是 `getLabel('workflow_status', ...)`，
   * 缺这个键时取不到标签，印章会渲染成一个只有边框的空红框。
   */
  workflow_status: createEnum('workflow_status', BILL_STATUS_ENTRIES),
  /** 人员状态 */
  UserStatus: createEnum('UserStatus', [
    ['1', '在职'],
    ['2', '试用'],
    ['3', '停用'],
    ['4', '离职'],
  ]),
  /** 性别 */
  Gender: createEnum('Gender', [
    ['10', '男'],
    ['11', '女'],
  ]),
  /** 是否 */
  YesNo: createEnum('YesNo', [
    ['1', '是'],
    ['0', '否'],
  ]),
  /** 资产状态 */
  AssetStatus: createEnum('AssetStatus', [
    ['1', '在用'],
    ['2', '闲置'],
    ['3', '维修中'],
    ['4', '已报废'],
  ]),
  /** 结算方式 */
  PayType: createEnum('PayType', [
    ['1', '银行转账'],
    ['2', '现金'],
    ['3', '支票'],
    ['4', '电子承兑'],
    ['5', '内部划转'],
  ]),
  /** 单据类型 */
  BillType: createEnum('BillType', [
    ['1', '收款单'],
    ['2', '付款单'],
    ['3', '转账单'],
    ['4', '报销单'],
    ['5', '借款单'],
  ]),
  /** 审核结果 */
  AuditResult: createEnum('AuditResult', [
    ['1', '同意'],
    ['2', '驳回'],
    ['3', '转办'],
  ]),
  /** 工作台数据校验类型 */
  board_valid_types: createEnum('board_valid_types', [
    ['1', '基础数据校验'],
    ['2', '凭证平衡校验'],
    ['3', '工资项目校验'],
    ['4', '资产台账校验'],
  ]),
}
