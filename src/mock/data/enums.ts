/**
 * 系统枚举字典（演示数据）
 *
 * 供 store/modules/enums 加载，使表格中的状态列能显示中文标签。
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

export const SYSTEM_ENUMS: Record<string, SystemEnums> = {
  /** 单据状态 */
  BillStatus: createEnum('BillStatus', [
    ['1', '草稿'],
    ['2', '待审核'],
    ['3', '审批中'],
    ['4', '已审批'],
    ['5', '已完成'],
    ['6', '已作废'],
  ]),
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
