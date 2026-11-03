<script setup lang="ts">
import type { Ref } from 'vue'
import type { ModalInst } from '@/components/SpModal'
import type { TableInstance, TableProps } from '@/components/SpTable'
import { groupItem as api } from '@/service/api/staff/salary'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const formRef = ref(null)
const modalRef = ref<ModalInst | null>(null)
const sourceModelRef = ref<ModalInst | null>(null)
const previewModelRef = ref<ModalInst | null>(null)

const rulesConditionsModalRef = ref<ModalInst | null>(null)
const rulesContentModalRef = ref<ModalInst | null>(null)

const conditionInputRef = ref(null)
const contentInputRef = ref(null)

const formModel = ref({
  item_id: 0,
  field_name: '',
  title: '',
  field_type: 0,
  formula: '',
  group_id: 0,
  month: 0,
})

const validationError = ref('')
const jsonFormula = ref('')

const rulesConditionInfo = ref({
  text: null as string | null,
  index: 0 as number,
})
const rulesContentInfo = ref({
  text: null as string | null,
  index: 0 as number,
})

// 表达式规则数据
interface ExpressionRule {
  id: string
  conditions: string
  content: string
  describe: string
}
const expressionRules = ref<ExpressionRule[]>([])

// 工资字典列表（从API获取）
interface SalaryDict {
  id: number
  field_name: string
  title: string
  field_type: number // 0:金额 1:数值 2:文本 3:日期 4:系数
}
const salaryDictList = ref<SalaryDict[]>([])

// 字段名→标题的映射
const fieldToTitleMap = ref<Record<string, string>>({})
// 标题→字段名的映射
const titleToFieldMap = ref<Record<string, string>>({})

// 可用字段列表（显示标题）
const conditionFields = computed(() => {
  return salaryDictList.value.map(item => item.title)
})

// 字段选项（用于下拉菜单）
const contentFieldOptions = computed(() => {
  return salaryDictList.value
    .filter(q => q.field_type === 0 || q.field_type === 1 || q.field_type === 4)
    .map(item => item.title)
  // return salaryDictList.value.map(item => ({
  //   label: item.title,
  //   value: item.title,
  // }))
})

// 运算符选项（空格由插入逻辑自动补齐，避免出现连续多个空格）
const operatorOptions = [
  { label: '+ (加)', key: '+' },
  { label: '- (减)', key: '-' },
  { label: '* (乘)', key: '*' },
  { label: '/ (除)', key: '/' },
  { label: '> (大于)', key: '>' },
  { label: '< (小于)', key: '<' },
  { label: '>= (大于等于)', key: '>=' },
  { label: '<= (小于等于)', key: '<=' },
  { label: '== (等于)', key: '==' },
  { label: '!= (不等于)', key: '!=' },
  { label: 'AND (与)', key: 'AND' },
  { label: 'OR (或)', key: 'OR' },
]

const contentOptions = [
  { label: '+ (加)', key: '+' },
  { label: '- (减)', key: '-' },
  { label: '* (乘)', key: '*' },
  { label: '/ (除)', key: '/' },
]

// 公式预览相关
const testData = ref<Record<string, any>>({})
const dictLoading = ref(false)
const previewResult = ref<{
  error: string // 错误信息
  matchedRule: number // 匹配的规则索引(-1表示无匹配)
  result: number | string // 计算结果
  ruleResults: Array<{ matched: boolean, result: string }> // 每条规则的结果
}>({
  matchedRule: -1,
  result: 0,
  error: '',
  ruleResults: [],
})

// 字段类型文本
const fieldTypeText = computed(() => {
  const typeMap = {
    0: '金额型',
    1: '数值型',
    4: '系数型',
  }
  return typeMap[formModel.value.field_type] || '未知'
})

// 生成一条空规则
function createEmptyRule(): ExpressionRule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, // 唯一ID
    conditions: '',
    content: '',
    describe: '',
  }
}

// 添加规则
function addRule() {
  expressionRules.value.push(createEmptyRule())
}

// 预览输入项
interface PreviewField {
  label: string // 显示名（字典字段=标题，外部字段=原名）
  field: string // 预览求值时的变量名（字段名）
  type: number // 字典 field_type；-1=外部字段(不在工资项目字典中，类型未知)
}

// 当前公式(所有规则的条件+内容)中实际用到的输入项
// 1) 字典字段：标题/字段名两种写法都能识别，按长度降序匹配并从文本中移除，避免"工资"误匹配"基本工资"
// 2) 剩余标识符视为外部字段(如 outer_name、days 这类非工资项目字典变量)，原样显示供预览输入
const previewFields = computed<PreviewField[]>(() => {
  const dictByField = new Map(salaryDictList.value.map(f => [f.field_name, f]))
  const used = new Map<string, PreviewField>()

  for (const rule of expressionRules.value) {
    // 统一转成字段名形式再扫描，兼容公式中"标题"和"字段名"两种写法
    let text = convertTitlesToFields(`${rule.conditions || ''} ${rule.content || ''}`)
    // 剔除字符串字面量，避免其中的内容被误识别为字段
    text = text.replace(/'[^']*'|"[^"]*"/g, ' ')

    for (const name of [...dictByField.keys()].filter(Boolean).sort((a, b) => b.length - a.length)) {
      if (text.includes(name)) {
        if (!used.has(name)) {
          const f = dictByField.get(name)!
          used.set(name, { label: f.title, field: name, type: f.field_type })
        }
        text = text.split(name).join(' ')
      }
    }

    for (const m of text.matchAll(/[a-z_]\w*/gi)) {
      const name = m[0]
      if (name === 'AND' || name === 'OR' || used.has(name))
        continue
      used.set(name, { label: name, field: name, type: -1 })
    }
  }
  return [...used.values()]
})

// 计算公式预览
function calculatePreview() {
  if (expressionRules.value.length === 0) {
    return
  }

  try {
    // 将测试数据按输入项映射为"字段名→值"的求值上下文
    const fieldsByLabel = new Map(previewFields.value.map(pf => [pf.label, pf]))
    const fieldData: Record<string, any> = {}
    Object.entries(testData.value).forEach(([label, value]) => {
      const pf = fieldsByLabel.get(label)
      if (!pf)
        return
      // 外部字段类型未知：纯数字输入按数值参与运算，便于数值公式的测试
      if (pf.type === -1 && typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        fieldData[pf.field] = Number(value)
      }
      else {
        fieldData[pf.field] = value ?? 0
      }
    })

    // 评估每条规则
    const ruleResults: Array<{ matched: boolean, result: string }> = []
    let matchedIndex = -1
    let finalResult: number | string = 0

    for (let i = 0; i < expressionRules.value.length; i++) {
      const rule = expressionRules.value[i]

      // 将标题转换为字段名
      const conditions = convertTitlesToFields(rule.conditions)
      const content = convertTitlesToFields(rule.content)

      try {
        // 评估条件
        let conditionMet = true
        if (conditions.trim()) {
          // 转换 AND/OR 为 &&/||
          const normalizedCondition = conditions
            .replaceAll(/\bAND\b/gi, '&&')
            .replaceAll(/\bOR\b/gi, '||')
          conditionMet = evaluateExpression(normalizedCondition, fieldData)
        }

        const resultValue = evaluateExpression(content, fieldData)
        ruleResults.push({
          matched: conditionMet,
          result: String(resultValue), // 只显示计算结果,不包含描述
        })

        // 记录第一条匹配的规则
        if (conditionMet && matchedIndex === -1) {
          matchedIndex = i
          finalResult = resultValue
        }
      }
      catch (error: any) {
        ruleResults.push({
          matched: false,
          result: `错误: ${error.message}`,
        })
      }
    }

    previewResult.value = {
      matchedRule: matchedIndex,
      result: typeof finalResult === 'number' ? finalResult.toFixed(2) : String(finalResult),
      error: '',
      ruleResults,
    }
  }
  catch (error: any) {
    previewResult.value = {
      matchedRule: -1,
      result: 0,
      error: `计算错误: ${error.message}`,
      ruleResults: [],
    }
  }
}

// 安全地评估表达式
function evaluateExpression(expression: string, data: Record<string, any>): any {
  if (!expression.trim()) {
    return 0
  }

  try {
    // 构建变量声明,支持字符串和数值
    const varDeclarations = Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          // 字符串值需要转义单引号
          return `const ${key} = '${value.replaceAll('\'', String.raw`\'`)}';`
        }
        return `const ${key} = ${value};`
      })
      .join('\n')

    // 使用 Function 构造函数安全评估表达式
    // eslint-disable-next-line no-new-func
    const func = new Function(`
        ${varDeclarations}
        return ${expression};
      `)

    const result = func()
    return result
  }
  catch (error: any) {
    throw new Error(`表达式"${expression}"评估失败: ${error.message}`)
  }
}

// 将公式字符串中的字段名转换为标题（用于显示）
function convertFieldsToTitles(formula: string): string {
  if (!formula)
    return formula

  let result = formula
  // 按字段名长度降序排序，避免短字段名替换长字段名的问题
  const fieldNames = Object.keys(fieldToTitleMap.value).sort((a, b) => b.length - a.length)

  fieldNames.forEach((fieldName) => {
    const title = fieldToTitleMap.value[fieldName]
    // 使用正则确保只替换完整的单词，避免部分匹配
    const regex = new RegExp(String.raw`\b${fieldName}\b`, 'g')
    result = result.replace(regex, title)
  })

  return result
}

// 将公式字符串中的标题转换为字段名（用于保存）
function convertTitlesToFields(formula: string): string {
  if (!formula)
    return formula

  let result = formula
  // 按标题长度降序排序，避免短标题替换长标题的问题
  const titles = Object.keys(titleToFieldMap.value).sort((a, b) => b.length - a.length)

  titles.forEach((title) => {
    const fieldName = titleToFieldMap.value[title]
    // 使用正则确保只替换完整的单词
    const regex = new RegExp(title.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`), 'g')
    result = result.replace(regex, fieldName)
  })

  return result
}

// 可视化转JSON
function visualToJson() {
  jsonFormula.value = ''
  try {
    // 金额型 - 需要将标题转换为字段名，移除id字段
    const rules = expressionRules.value.map(rule => ({
      conditions: convertTitlesToFields(rule.conditions),
      content: convertTitlesToFields(rule.content),
      describe: rule.describe,
    }))
    jsonFormula.value = JSON.stringify(rules, null, 2)
  }
  catch (error) {
    console.error('转换失败:', error)
  }
}

// JSON转可视化
function jsonToVisual() {
  expressionRules.value = []
  try {
    if (!jsonFormula.value) {
      return
    }

    const parsed = JSON.parse(jsonFormula.value)

    // 金额型 - 需要将字段名转换为标题，并为每条规则生成唯一ID
    expressionRules.value = parsed.map((rule: any) => ({
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, // 唯一ID
      conditions: convertFieldsToTitles(rule.conditions || ''),
      content: convertFieldsToTitles(rule.content || ''),
      describe: rule.describe || '',
    }))
  }
  catch (error) {
    console.error('解析失败:', error)
  }
}

// 验证公式格式
function validateFormula(): boolean {
  validationError.value = ''

  // 金额型
  if (expressionRules.value.length === 0) {
    validationError.value = '至少需要添加一条规则'
    return false
  }
  for (const [i, rule] of expressionRules.value.entries()) {
    if (!rule.content || rule.content.trim() === '') {
      validationError.value = `第${i + 1}条规则的计算内容不能为空`
      return false
    }
  }

  // 转换为JSON以便提交
  visualToJson()

  // JSON模式验证
  if (!jsonFormula.value || jsonFormula.value.trim() === '') {
    validationError.value = '公式不能为空'
    return false
  }

  try {
    const parsed = JSON.parse(jsonFormula.value)

    if (!Array.isArray(parsed)) {
      validationError.value = '表达式公式必须是JSON数组'
      return false
    }
    if (parsed.length === 0) {
      validationError.value = '表达式公式不能为空数组'
      return false
    }
    // 验证每个规则
    for (const [i, rule] of parsed.entries()) {
      if (!rule.content) {
        validationError.value = `第${i + 1}条规则缺少content字段`
        return false
      }
    }

    return true
  }
  catch (error: any) {
    validationError.value = `JSON格式错误: ${error.message}`
    return false
  }
}

function source() {
  visualToJson()
  sourceModelRef.value?.open()
}

function confirm() {
  jsonToVisual()
  sourceModelRef.value?.close()
  tableRef.value?.redoHeight()
}

// 确保预览用到的输入项有测试数据默认值（文本型/外部字段为空串，其余为0）
function ensureTestData() {
  for (const pf of previewFields.value) {
    if (!(pf.label in testData.value)) {
      testData.value[pf.label] = (pf.type === 2 || pf.type === -1) ? '' : 0
    }
  }
}

function preview() {
  ensureTestData()
  calculatePreview()
  previewModelRef.value?.open()
}

// 提交
async function submit() {
  if (!validateFormula()) {
    return
  }

  const { isSuccess } = await api.updateFormula({
    item_id: formModel.value.item_id,
    formula: jsonFormula.value,
  })

  if (!isSuccess)
    return

  toast.success('公式更新成功')
  modalRef.value?.close()
  emit('on-action')
}

// 清空公式
function clearFormula() {
  toast.infoModal('确定清空该工资项的公式吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await api.updateFormula({
        item_id: formModel.value.item_id,
        formula: '',
      })
      if (!isSuccess)
        return
      toast.success('公式已清空')
      jsonFormula.value = ''
      expressionRules.value = [createEmptyRule()]
      modalRef.value?.close()
      emit('on-action')
    },
  })
}

async function open(params: any) {
  // 1. 强制重置所有状态（核心：避免多次打开残留旧数据）
  validationError.value = ''
  jsonFormula.value = ''
  expressionRules.value = []
  testData.value = {}
  previewResult.value = {
    matchedRule: -1,
    result: 0,
    error: '',
    ruleResults: [],
  }

  formModel.value = {
    item_id: params.id || 0,
    field_name: params?.field_name || '',
    title: params?.title || '',
    field_type: params?.field_type || 0,
    formula: params.formula || '',
    group_id: params.group_id || 0,
    month: params.month || 0,
  }

  // 2. 先展示弹窗，字典数据异步加载（避免点击后等网络返回才见弹窗）
  modalRef.value?.open()

  dictLoading.value = true
  try {
    // 加载工资字典（建立标题/字段名映射关系）
    await loadSalaryDict()

    // 解析公式并格式化已有的JSON(美化显示)
    jsonFormula.value = formModel.value.formula
    if (jsonFormula.value) {
      try {
        jsonFormula.value = JSON.stringify(JSON.parse(jsonFormula.value), null, 2)
      }
      catch {
        // 保持原值
      }
    }

    // 转换为可视化数据，没有数据时初始化一条默认规则
    jsonToVisual()
    if (expressionRules.value.length === 0) {
      addRule()
    }
  }
  finally {
    dictLoading.value = false
  }
}

// 加载工资字典列表
async function loadSalaryDict() {
  try {
    // 使用新的 searchFields API 获取当月工资组的字段列表
    const { isSuccess, data } = await api.searchFields({
      group_id: formModel.value.group_id,
      month: formModel.value.month,
    })

    if (!isSuccess) {
      return
    }
    const info: any = data || []
    salaryDictList.value = info

    // 构建映射关系
    fieldToTitleMap.value = {}
    titleToFieldMap.value = {}

    salaryDictList.value.forEach((item) => {
      fieldToTitleMap.value[item.field_name] = item.title
      titleToFieldMap.value[item.title] = item.field_name
    })
  }
  catch (error) {
    console.error('加载工资字段失败:', error)
  }
}

function rulesConditionsModal(index: string | number) {
  rulesConditionInfo.value.text = expressionRules.value[index].conditions || ''
  rulesConditionInfo.value.index = Number(index)
  rulesConditionsModalRef.value?.open()
  focusTextEnd(rulesConditionInfo, conditionInputRef)
}

function rulesConditionsModalSubmit() {
  const index = rulesConditionInfo.value.index
  expressionRules.value[index].conditions = rulesConditionInfo.value.text ?? ''
  rulesConditionsModalRef.value?.close()
}

function rulesContentModal(index: string | number) {
  rulesContentInfo.value.text = expressionRules.value[index].content || ''
  rulesContentInfo.value.index = Number(index)
  rulesContentModalRef.value?.open()
  focusTextEnd(rulesContentInfo, contentInputRef)
}

function rulesContentModalSubmit() {
  const index = rulesContentInfo.value.index
  expressionRules.value[index].content = rulesContentInfo.value.text ?? ''
  rulesContentModalRef.value?.close()
}

// ===== 条件/内容文本框共用的插入与定位逻辑 =====

type RuleEditInfo = Ref<{ text: string | null, index: number }>

function getTextAreaEl(inputRef: Ref<any>): HTMLTextAreaElement | null {
  return (inputRef.value as { $el?: HTMLElement } | null)?.$el?.querySelector('textarea') ?? null
}

// 打开弹窗后聚焦文本框，光标置于末尾（避免首次点击字段被插入到文本开头）
function focusTextEnd(info: RuleEditInfo, inputRef: Ref<any>) {
  function apply() {
    const textarea = getTextAreaEl(inputRef)
    if (!textarea)
      return false
    const pos = (info.value.text ?? '').length
    textarea.focus()
    textarea.setSelectionRange(pos, pos)
    return true
  }

  nextTick(() => {
    // 弹窗首次打开时内容可能晚一帧渲染，兜底再试一次
    if (!apply())
      setTimeout(apply, 60)
  })
}

// 在光标处插入文本：前后各补至多一个空格，光标定位到插入项末尾
function insertRuleText(info: RuleEditInfo, textarea: HTMLTextAreaElement, raw: string) {
  const text = raw.trim()
  if (!text)
    return
  const current = info.value.text ?? ''
  const start = textarea.selectionStart ?? current.length
  const end = textarea.selectionEnd ?? start
  const before = current.slice(0, start)
  const after = current.slice(end)
  const leading = before && !/\s$/.test(before) ? ' ' : ''
  const trailing = after && !/^\s/.test(after) ? ' ' : ''
  info.value.text = `${before}${leading}${text}${trailing}${after}`
  const pos = (before + leading + text).length
  textarea.focus()
  nextTick(() => {
    textarea.setSelectionRange(pos, pos)
  })
}

// 点击可用字段：光标在哪就插入到哪（条件中同一字段可重复出现，不做搜索定位）
function pickConditionField(title: string) {
  const textarea = getTextAreaEl(conditionInputRef)
  if (textarea)
    insertRuleText(rulesConditionInfo, textarea, title)
}

function pickConditionOperator(op: string) {
  const textarea = getTextAreaEl(conditionInputRef)
  if (textarea)
    insertRuleText(rulesConditionInfo, textarea, op)
}

function pickContentField(title: string) {
  const textarea = getTextAreaEl(contentInputRef)
  if (textarea)
    insertRuleText(rulesContentInfo, textarea, title)
}

function pickContentOperator(op: string) {
  const textarea = getTextAreaEl(contentInputRef)
  if (textarea)
    insertRuleText(rulesContentInfo, textarea, op)
}

const tableRef = ref<TableInstance | null>(null)

// 规则表格：输入框常驻显示，不用行编辑模式
// （此前用行编辑 + current-change 强制激活编辑，点击操作列按钮会先触发行编辑导致按钮无响应）
const gridOptions = reactive<TableProps>({
  canResize: true,
  fitContainer: true,
  resizeHeightOffset: 20,
  rowConfig: { isCurrent: true, isHover: false, keyField: 'id' },
  cellConfig: {
    height: 56,
  },
  showToolbar: false,
  columns: [
    { type: 'seq', title: '行号', width: 60, align: 'right' },
    {
      field: 'conditions',
      title: '条件内容',
      width: 300,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'conditions' },
    },
    {
      field: 'content',
      title: '公式内容',
      width: 300,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'content' },
    },
    {
      field: 'describe',
      title: '公式说明',
      minWidth: 160,
      align: 'left',
      headerAlign: 'center',
      slots: { default: 'describe' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  pagination: false,
})

// 行操作统一生成新数组引用：vxe-table 对原地 splice 不会自动重渲染（否则上移/下移看起来无反应）
function tableItemsAdd({ key = 0 }: { key?: number | string }) {
  const items = [...expressionRules.value]
  items.splice(Number(key) + 1, 0, createEmptyRule())
  expressionRules.value = items
}

function tableItemsRemove({ key = 0 }: { key?: number | string }) {
  const items = [...expressionRules.value]
  items.splice(Number(key), 1)
  expressionRules.value = items
}

function tableItemsMoveUp({ key = 0 }: { key?: number | string }) {
  const nuns = Number(key)
  if (nuns === 0)
    return
  const items = [...expressionRules.value]
  ;[items[nuns], items[nuns - 1]] = [items[nuns - 1], items[nuns]]
  expressionRules.value = items
}

function tableItemsMoveDown({ key = 0 }: { key?: number | string }) {
  const nuns = Number(key)
  const items = [...expressionRules.value]
  if (nuns < items.length - 1) {
    ;[items[nuns], items[nuns + 1]] = [items[nuns + 1], items[nuns]]
    expressionRules.value = items
  }
}

function tableItemsCopy({ key = 0 }: { key?: number | string }) {
  const items = [...expressionRules.value]
  const { id: _sourceId, ...copied } = items[Number(key)]
  items.splice(Number(key) + 1, 0, { ...createEmptyRule(), ...copied })
  expressionRules.value = items
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'StaffSalaryGroupFormulaEditor' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" title="编辑公式" :loading="dictLoading">
    <n-form
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="120"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="24">
        <!-- 字段信息 -->
        <n-form-item-gi :span="8" label="字段名称">
          <n-input :value="formModel.field_name" readonly />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="字段标题">
          <n-input :value="formModel.title" readonly />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="字段类型">
          <n-input :value="fieldTypeText" readonly />
        </n-form-item-gi>
        <n-form-item-gi :span="24">
          <n-text v-if="validationError" type="error">
            {{ validationError }}
          </n-text>
        </n-form-item-gi>

        <n-form-item-gi :span="24">
          <n-space vertical style="gap: 16px; width: 100%">
            <!-- 规则列表 -->
            <SpTable ref="tableRef" v-bind="gridOptions" :data-source="expressionRules">
              <template #operate="{ rowIndex }">
                <div class="flex items-center justify-right gap-[10px]">
                  <n-button v-if="expressionRules.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ key: rowIndex })">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="expressionRules.length > 1" :disabled="Number(rowIndex) === expressionRules.length - 1" text @click="tableItemsMoveDown({ key: rowIndex })">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="tableItemsCopy({ key: rowIndex })">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="tableItemsAdd({ key: rowIndex })">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:plus-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="tableItemsRemove({ key: rowIndex })">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>

              <template #conditions="{ row, rowIndex }">
                <n-input v-model:value="row.conditions" placeholder="留空表示无条件" readonly>
                  <template #suffix>
                    <n-button text title="设置条件" style="font-size: 20px" @click="rulesConditionsModal(rowIndex)">
                      <n-icon>
                        <Icon icon="ant-design:bars-outlined" />
                      </n-icon>
                    </n-button>
                  </template>
                </n-input>
              </template>
              <template #content="{ row, rowIndex }">
                <n-input v-model:value="row.content" placeholder="如: 基本工资 + 岗位工资 + 职级工资" readonly>
                  <template #suffix>
                    <n-button text title="设置公式" style="font-size: 20px" @click="rulesContentModal(rowIndex)">
                      <n-icon>
                        <Icon icon="ant-design:bars-outlined" />
                      </n-icon>
                    </n-button>
                  </template>
                </n-input>
              </template>
              <template #describe="{ row }">
                <n-input v-model:value="row.describe" placeholder="规则说明(可选)" />
              </template>
            </SpTable>
          </n-space>
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button @click="preview">
          公式预览
        </n-button>
        <n-button @click="source">
          JSON源码
        </n-button>
        <n-button type="error" secondary @click="clearFormula">
          清空公式
        </n-button>
        <n-button type="primary" @click="submit">
          提交
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="rulesConditionsModalRef" width="80vw" height="85vh" :title="`计算条件 / 规则-${rulesConditionInfo.index}`">
    <n-form :show-feedback="false" :show-label="false">
      <n-form-item>
        <n-input ref="conditionInputRef" v-model:value="rulesConditionInfo.text" type="textarea" :autosize="{ minRows: 6, maxRows: 12 }" />
      </n-form-item>
      <n-form-item>
        <div>
          <n-divider title-placement="left">
            可用字段（点击插入）
          </n-divider>
          <n-space>
            <n-tag
              v-for="(field, index) in conditionFields"
              :key="index"
              :bordered="false"
              style="cursor: pointer"
              @click="pickConditionField(field)"
            >
              {{ field }}
            </n-tag>
          </n-space>
          <n-divider title-placement="left">
            运算符（点击插入）
          </n-divider>
          <n-space>
            <n-tag
              v-for="(field, index) in operatorOptions"
              :key="index"
              :bordered="false"
              style="cursor: pointer"
              @click="pickConditionOperator(field.key)"
            >
              {{ field.label }}
            </n-tag>
          </n-space>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="rulesConditionsModalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          @click="rulesConditionsModalSubmit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="rulesContentModalRef" width="80vw" height="85vh" :title="`公式内容 / 规则-${rulesContentInfo.index}`">
    <n-form :show-feedback="false" :show-label="false">
      <n-form-item>
        <n-input ref="contentInputRef" v-model:value="rulesContentInfo.text" type="textarea" :autosize="{ minRows: 12, maxRows: 16 }" />
      </n-form-item>
      <n-form-item>
        <div>
          <n-divider title-placement="left">
            可用字段（点击插入）
          </n-divider>
          <n-space>
            <n-tag
              v-for="(field, index) in contentFieldOptions"
              :key="index"
              :bordered="false"
              style="cursor: pointer"
              @click="pickContentField(field)"
            >
              {{ field }}
            </n-tag>
          </n-space>
          <n-divider title-placement="left">
            运算符（点击插入）
          </n-divider>
          <n-space>
            <n-tag
              v-for="(field, index) in contentOptions"
              :key="index"
              :bordered="false"
              style="cursor: pointer"
              @click="pickContentOperator(field.key)"
            >
              {{ field.label }}
            </n-tag>
          </n-space>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="rulesContentModalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          @click="rulesContentModalSubmit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="sourceModelRef" width="80vw" height="85vh" title="JSON源码">
    <n-form :show-feedback="false">
      <n-space vertical style="width: 100%">
        <n-text v-if="validationError" type="error">
          {{ validationError }}
        </n-text>
        <n-input
          v-model:value="jsonFormula"
          type="textarea"
          placeholder="[{&quot;conditions&quot;: &quot;&quot;, &quot;content&quot;: &quot;bases + grade&quot;, &quot;describe&quot;: &quot;说明&quot;}]"
          :rows="15"
          :autosize="{ minRows: 15 }"
        />
      </n-space>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="sourceModelRef?.close">
          关闭
        </n-button>
        <n-button type="primary" @click="confirm">
          确定
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="previewModelRef" width="80vw" height="85vh" title="公式预览">
    <n-form :label-width="140" :show-feedback="false">
      <n-space vertical style="width: 100%">
        <n-empty
          v-if="previewFields.length === 0"
          description="当前公式未使用任何字段"
        />
        <n-grid v-else :cols="3" :x-gap="12" :y-gap="12">
          <n-gi v-for="(pf, index) in previewFields" :key="index">
            <n-form-item :label="pf.type === -1 ? `${pf.label}（外部）` : pf.label" label-placement="left">
              <!-- 外部字段与文本型使用文本输入框（外部字段输入纯数字时按数值参与运算） -->
              <n-input-number
                v-if="pf.type !== 2 && pf.type !== -1"
                v-model:value="testData[pf.label]"
                :precision="2"
                :show-button="false"
                placeholder="输入数值"
                style="width: 100%"
                @update:value="calculatePreview"
              />
              <n-input
                v-else
                v-model:value="testData[pf.label]"
                placeholder="输入文本"
                style="width: 100%"
                @update:value="calculatePreview"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-divider />

        <!-- 计算结果 -->
        <n-text depth="3" strong>
          计算结果:
        </n-text>
        <n-alert v-if="previewResult.error" type="error" :show-icon="true">
          {{ previewResult.error }}
        </n-alert>
        <n-space v-else vertical>
          <n-text>
            匹配规则: 规则 {{ previewResult.matchedRule + 1 }}
            <n-text v-if="previewResult.matchedRule === -1" type="warning">
              (无匹配)
            </n-text>
          </n-text>
          <n-text strong style="font-size: 16px">
            结果: {{ previewResult.result }}
          </n-text>

          <!-- 每条规则的匹配情况 -->
          <n-collapse>
            <n-collapse-item title="查看每条规则的匹配情况">
              <n-space vertical>
                <div
                  v-for="(ruleResult, index) in previewResult.ruleResults"
                  :key="index"
                >
                  <n-text>
                    规则 {{ index + 1 }}:
                    <n-tag
                      :type="ruleResult.matched ? 'success' : 'default'"
                      size="small"
                    >
                      {{ ruleResult.matched ? '✓ 匹配' : '✗ 不匹配' }}
                    </n-tag>
                    - {{ ruleResult.result }}
                  </n-text>
                </div>
              </n-space>
            </n-collapse-item>
          </n-collapse>
        </n-space>
      </n-space>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="previewModelRef?.close">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
