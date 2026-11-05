/**
 * 本地枚举字典
 *
 * 原先枚举走 EnumStore → `/common/enums` 接口，但接口只回少数几个键，
 * 页面实际用到 60 余个，绝大多数查不到值，状态列、印章、下拉框全是空的。
 * 这里改成前端静态字典：数据完整、可离线、无加载时序问题。
 *
 * 用法：
 * ```ts
 * dictLabel('workflow_status', '2')            // '待审核'
 * dictOptions('pense_travel_types')            // [{ label: '国内出差', value: '1' }, ...]
 * <n-select :options="dictOptions('staff_info_types')" />
 * ```
 *
 * 约定：value 一律为字符串，与接口/表格单元格保持同一类型，避免数字与字符串比较不上。
 */

export type DictMatchBy = 'value' | 'name' | 'label'

export interface DictItem {
  /** 枚举项标识，与 value 一致，供按 name 匹配的场景使用 */
  name: string
  /** 展示文本 */
  label: string
  /** 取值 */
  value: string
}

export interface Dict {
  /** 枚举中文名 */
  name: string
  items: DictItem[]
}

/** 由 [value, label] 二元组构造枚举 */
function define(name: string, entries: Array<[string, string]>): Dict {
  return {
    name,
    items: entries.map(([value, label]) => ({ name: value, label, value })),
  }
}

/**
 * 取值即文本的枚举
 *
 * 这类字段在表单里用 `dictOptions(key, 'label')` 渲染，也就是把中文本身当作值存进单据。
 * 取值与展示都定成中文，两种写法（按 value 取、按 label 取）才能同时成立。
 */
function defineText(name: string, labels: string[]): Dict {
  return define(name, labels.map(label => [label, label]))
}

/** 单据状态：详情页印章、列表状态列共用 */
const BILL_STATUS: Array<[string, string]> = [
  ['1', '草稿'],
  ['2', '待审核'],
  ['3', '审批中'],
  ['4', '已审批'],
  ['5', '已完成'],
  ['6', '已作废'],
]

/** 审批结果 */
const AUDIT_RESULT: Array<[string, string]> = [
  ['1', '同意'],
  ['2', '不同意'],
  ['3', '退回修改'],
]

/** 人员状态：人事各台账共用 */
const STAFF_STATUS: Array<[string, string]> = [
  ['1', '在职'],
  ['2', '试用'],
  ['3', '停用'],
  ['4', '离职'],
  ['5', '退休'],
  ['6', '待入职'],
]

/** 收付款方式 */
const PAY_WAY: Array<[string, string]> = [
  ['1', '银行转账'],
  ['2', '现金'],
  ['3', '支票'],
  ['4', '电子承兑'],
  ['5', '内部划转'],
]

/** 资产取得方式 */
const ASSET_GET_METHOD: Array<[string, string]> = [
  ['1', '购入'],
  ['2', '自建'],
  ['3', '接受捐赠'],
  ['4', '投资者投入'],
  ['5', '盘盈'],
  ['6', '融资租入'],
]

export const DICTS: Record<string, Dict> = {
  // ---------------- 单据与流程 ----------------
  BillStatus: define('单据状态', BILL_STATUS),
  workflow_status: define('单据状态', BILL_STATUS),
  AuditResult: define('审批结果', AUDIT_RESULT),
  BillType: define('单据类型', [
    ['1', '普通单据'],
    ['2', '红字单据'],
    ['3', '调整单据'],
  ]),
  board_valid_types: defineText('看板有效状态', ['有效', '无效', '待验证']),

  // ---------------- 人员 ----------------
  UserStatus: define('人员状态', STAFF_STATUS),
  staff_info_status: define('员工状态', STAFF_STATUS),
  staff_info_types: define('人员类型', [
    ['1', '正式员工'],
    ['2', '试用员工'],
    ['3', '实习生'],
    ['4', '劳务派遣'],
    ['5', '退休返聘'],
    ['6', '兼职人员'],
  ]),
  staff_info_nation: defineText('民族', ['汉族', '回族', '满族', '壮族', '蒙古族', '苗族', '维吾尔族', '藏族']),
  staff_info_extent: defineText('学历', ['博士研究生', '硕士研究生', '本科', '大专', '中专', '高中及以下']),
  staff_info_politics: defineText('政治面貌', ['群众', '共青团员', '中共党员', '民主党派']),
  staff_info_marital: defineText('婚姻状况', ['未婚', '已婚', '离异', '丧偶']),
  staff_info_health: defineText('健康状况', ['良好', '一般', '较差']),
  staff_info_census: defineText('户籍类型', ['本地城镇', '本地农村', '外地城镇', '外地农村']),
  staff_info_house: define('住房情况', [
    ['1', '自有住房'],
    ['2', '租赁住房'],
    ['3', '公司宿舍'],
    ['4', '与亲属同住'],
    ['5', '其他'],
    ['6', '未登记'],
  ]),
  staff_info_social: define('社保状态', [
    ['1', '已参保'],
    ['2', '未参保'],
    ['3', '停缴'],
    ['4', '转移中'],
    ['5', '待办理'],
    ['6', '已减员'],
  ]),
  staff_labor_status: define('用工状态', [
    ['1', '履行中'],
    ['2', '已到期'],
    ['3', '已解除'],
    ['4', '待签订'],
    ['5', '已续签'],
    ['6', '已终止'],
  ]),
  staff_salary_status: define('薪资状态', [
    ['1', '待发放'],
    ['2', '发放中'],
    ['3', '已发放'],
    ['4', '已冲销'],
    ['5', '已暂停'],
    ['6', '已归档'],
  ]),
  staff_because_types: define('奖惩类型', [
    ['1', '奖励'],
    ['2', '处罚'],
  ]),
  staff_resume_status: define('简历状态', [
    ['1', '待筛选'],
    ['2', '面试中'],
    ['3', '已录用'],
    ['4', '已淘汰'],
    ['5', '已入职'],
    ['6', '已放弃'],
  ]),
  staff_grade_types: define('职级序列', [
    ['1', '管理序列'],
    ['2', '专业序列'],
    ['3', '操作序列'],
  ]),
  staff_scale_caste: defineText('薪级档次', ['初级', '中级', '高级', '资深']),
  staff_insure_status: define('投保状态', [
    ['1', '未参保'],
    ['2', '参保中'],
    ['3', '已停保'],
    ['4', '待办理'],
    ['5', '已减员'],
    ['6', '已转移'],
  ]),

  // ---------------- 组织与权限 ----------------
  organ_user_types: define('用户类型', [
    ['1', '内部员工'],
    ['2', '外部人员'],
    ['3', '系统账号'],
  ]),
  organ_user_gender: define('性别', [
    ['10', '男'],
    ['11', '女'],
  ]),
  Gender: define('性别', [
    ['10', '男'],
    ['11', '女'],
  ]),
  organ_outer_types: define('往来单位类型', [
    ['1', '客户'],
    ['2', '供应商'],
    ['3', '客户兼供应商'],
  ]),
  YesNo: define('是否', [
    ['1', '是'],
    ['0', '否'],
  ]),

  // ---------------- 合同 ----------------
  trade_contract_status: define('合同状态', [
    ['1', '草稿'],
    ['2', '履行中'],
    ['3', '已完成'],
    ['4', '已终止'],
    ['5', '待签署'],
    ['6', '已续签'],
  ]),
  trade_custom_nature: defineText('客户性质', ['国有企业', '民营企业', '外资企业', '个体工商户']),

  // ---------------- 费用 ----------------
  pense_bill_types: define('费用单据类型', [
    ['1', '报销单'],
    ['2', '借款单'],
    ['3', '付款单'],
    ['4', '预算单'],
  ]),
  pense_travel_types: define('出差类型', [
    ['1', '国内出差'],
    ['2', '境外出差'],
    ['3', '市内公务'],
  ]),
  pense_contract_types: define('合同类型', [
    ['1', '采购合同'],
    ['2', '服务合同'],
    ['3', '租赁合同'],
    ['4', '框架协议'],
  ]),
  pense_contract_payment: define('合同付款方式', [
    ['1', '一次性付款'],
    ['2', '分期付款'],
    ['3', '按进度付款'],
  ]),
  pense_contract_source: define('合同来源', [
    ['1', '招标'],
    ['2', '议价'],
    ['3', '直接委托'],
  ]),
  PayType: define('结算方式', PAY_WAY),

  // ---------------- 资产 ----------------
  AssetStatus: define('资产状态', [
    ['1', '在用'],
    ['2', '闲置'],
    ['3', '维修中'],
    ['4', '已报废'],
  ]),
  asset_info_method: define('取得方式', ASSET_GET_METHOD),
  asset_info_source: define('资产来源', [
    ['1', '采购'],
    ['2', '调入'],
    ['3', '租赁转入'],
    ['4', '接受捐赠'],
  ]),
  asset_check_status: define('盘点状态', [
    ['1', '待盘点'],
    ['2', '盘点中'],
    ['3', '已盘平'],
    ['4', '盘盈'],
    ['5', '盘亏'],
    ['6', '已关闭'],
  ]),

  // ---------------- 档案 ----------------
  paper_info_status: define('档案状态', [
    ['1', '在库'],
    ['2', '借出'],
    ['3', '已归档'],
    ['4', '已销毁'],
    ['5', '待整理'],
    ['6', '已移交'],
  ]),
  paper_borrow_types: define('借阅类型', [
    ['1', '内部借阅'],
    ['2', '外部借阅'],
    ['3', '复制申请'],
  ]),
  paper_borrow_states: define('借阅状态', [
    ['1', '待审批'],
    ['2', '已借出'],
    ['3', '已归还'],
    ['4', '已逾期'],
    ['5', '已续借'],
    ['6', '已拒绝'],
  ]),

  // ---------------- 考勤 ----------------
  checkin_outside_types: define('外出类型', [
    ['1', '外出办事'],
    ['2', '客户拜访'],
    ['3', '出差'],
    ['4', '其他'],
  ]),
  checkin_overtime_types: define('加班类型', [
    ['1', '工作日加班'],
    ['2', '休息日加班'],
    ['3', '法定节假日加班'],
  ]),
  checkin_vacation_types: define('请假类型', [
    ['1', '年假'],
    ['2', '事假'],
    ['3', '病假'],
    ['4', '婚假'],
    ['5', '产假'],
    ['6', '调休'],
  ]),

  // ---------------- 主数据 ----------------
  basic_content_assist: defineText('辅助核算', ['部门', '人员', '项目', '客户', '供应商']),
  basic_content_types: define('内容分类', [
    ['1', '收入'],
    ['2', '支出'],
    ['3', '转账'],
  ]),
  basic_content_direction: define('收支方向', [
    ['1', '流入'],
    ['2', '流出'],
  ]),
  basic_pattern_source: define('凭证来源', [
    ['1', '业务单据'],
    ['2', '手工凭证'],
    ['3', '期末结转'],
  ]),
  basic_pattern_types: define('凭证字类型', [
    ['1', '记账凭证'],
    ['2', '转账凭证'],
    ['3', '收款凭证'],
    ['4', '付款凭证'],
  ]),
  basic_salary_types: define('薪资项目类型', [
    ['1', '固定工资'],
    ['2', '绩效奖金'],
    ['3', '补贴'],
    ['4', '扣款'],
  ]),
  basic_account_types: define('账户类型', [
    ['1', '基本户'],
    ['2', '一般户'],
    ['3', '专用户'],
    ['4', '临时户'],
  ]),
  basic_account_bank: defineText('开户银行', ['工商银行', '建设银行', '农业银行', '中国银行', '交通银行', '招商银行', '浦发银行', '中信银行']),
  basic_asset_types: define('资产类别', [
    ['1', '电子设备'],
    ['2', '办公家具'],
    ['3', '运输工具'],
    ['4', '房屋建筑物'],
    ['5', '机器设备'],
  ]),
  basic_asset_method: define('取得方式', ASSET_GET_METHOD),
  basic_cashflow_group: defineText('现金流分组', ['经营活动', '投资活动', '筹资活动']),
  basic_cashflow_direction: define('现金流方向', [
    ['1', '流入'],
    ['2', '流出'],
  ]),
  basic_cashflow_types: define('现金流项目类型', [
    ['1', '销售商品、提供劳务收到的现金'],
    ['2', '购买商品、接受劳务支付的现金'],
    ['3', '支付给职工以及为职工支付的现金'],
    ['4', '购建固定资产支付的现金'],
    ['5', '取得借款收到的现金'],
    ['6', '偿还债务支付的现金'],
  ]),
  basic_article_types: defineText('物品类型', ['办公用品', '耗材', '劳保用品', '印刷品']),
}

/** 规范化取值字段，非法值回落 value */
export function normalizeDictType(field?: string | null): DictMatchBy {
  return field === 'label' || field === 'name' ? field : 'value'
}

/** 取枚举定义，不存在返回 undefined */
export function getDict(key?: string | null): Dict | undefined {
  if (!key)
    return undefined
  return DICTS[key]
}

/** 枚举是否存在（表格格式化、高级搜索用它决定是否接管） */
export function hasDict(key?: string | null): boolean {
  return !!getDict(key)?.items.length
}

/**
 * 按取值查展示文本
 *
 * 查不到时返回原值而不是空串：字典没覆盖的字段至少还能看到原始取值，
 * 不会出现整列空白。
 */
export function dictLabel(
  key: string,
  matchValue: string | number | null | undefined,
  matchBy: DictMatchBy = 'value',
): string {
  if (matchValue === null || matchValue === undefined || matchValue === '')
    return ''

  const text = String(matchValue)
  const item = getDict(key)?.items.find(entry => entry[matchBy] === text)
  return item?.label ?? text
}

/** 取下拉选项 */
export function dictOptions(
  key: string,
  valueField: DictMatchBy = 'value',
): Array<{ label: string, value: string }> {
  const items = getDict(key)?.items ?? []
  return items.map(item => ({ label: item.label, value: item[valueField] }))
}

/** 取完整枚举项 */
export function dictItem(
  key: string,
  matchValue: string | number | null | undefined,
  matchBy: DictMatchBy = 'value',
): DictItem | undefined {
  if (matchValue === null || matchValue === undefined)
    return undefined
  const text = String(matchValue)
  return getDict(key)?.items.find(entry => entry[matchBy] === text)
}
