<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { groupItem as api } from '@/service/api/hr/payroll'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const formRef = ref(null)
const modalRef = ref<ModalInst | null>(null)
const sourceModelRef = ref<ModalInst | null>(null)

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

// 系数型数据
interface CoefficientRow {
  id: string
  key: string
  value: number
}
const coefficientData = ref<CoefficientRow[]>([])

// 字段类型文本
const fieldTypeText = computed(() => {
  const typeMap = {
    0: '金额型',
    1: '数值型',
    4: '系数型',
  }
  return typeMap[formModel.value.field_type] || '未知'
})

// 系数型表格列
const coefficientColumns: any = [
  {
    title: '键',
    key: 'key',
    width: 360,
    render: (row, index) => {
      return h('input', {
        value: row.key,
        placeholder: '例如: A, B, C',
        class: 'n-input__input-el',
        style: {
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e0e0e6',
          borderRadius: '3px',
        },
        onInput: (e: any) => {
          coefficientData.value[index].key = e.target.value
        },
      })
    },
  },
  {
    title: '值',
    key: 'value',
    render: (row, index) => {
      return h('input', {
        type: 'number',
        value: row.value,
        placeholder: '例如: 1000',
        class: 'n-input__input-el',
        style: {
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e0e0e6',
          borderRadius: '3px',
        },
        onInput: (e: any) => {
          coefficientData.value[index].value = Number(e.target.value)
        },
      })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    align: 'center',
    render: (row, index) => {
      return h(
        'button',
        {
          class: 'n-button n-button--error-type n-button--small-type',
          onClick: () => removeCoefficientRow(index),
        },
        '删除',
      )
    },
  },
]

// 添加系数行
function addCoefficientRow() {
  coefficientData.value.push({
    id: `coeff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key: '',
    value: 0,
  })
}

// 删除系数行
function removeCoefficientRow(index: number) {
  coefficientData.value.splice(index, 1)
}

// 可视化转JSON
function visualToJson() {
  jsonFormula.value = ''
  try {
    // 系数型 - 移除id字段，只保留key和value
    const obj = {}
    coefficientData.value.forEach((item) => {
      if (item.key) {
        obj[item.key] = item.value
      }
    })
    jsonFormula.value = JSON.stringify(obj, null, 2)
  }
  catch (error) {
    console.error('转换失败:', error)
  }
}

// JSON转可视化
function jsonToVisual() {
  coefficientData.value = []
  try {
    if (!jsonFormula.value) {
      return
    }

    const parsed = JSON.parse(jsonFormula.value)

    // 系数型 - 为每行生成唯一ID
    coefficientData.value = Object.entries(parsed).map(([key, value]) => ({
      id: `coeff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, // 唯一ID
      key,
      value: Number(value),
    }))
  }
  catch (error) {
    console.error('解析失败:', error)
  }
}

// 验证公式格式
function validateFormula(): boolean {
  validationError.value = ''

  // 系数型
  if (coefficientData.value.length === 0) {
    validationError.value = '至少需要添加一个键值对'
    return false
  }
  for (const [i, item] of coefficientData.value.entries()) {
    if (!item.key || item.key.trim() === '') {
      validationError.value = `第${i + 1}行的键不能为空`
      return false
    }
    if (Number.isNaN(item.value)) {
      validationError.value = `第${i + 1}行的值必须是数字`
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

    // 系数型: 必须是对象
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      validationError.value = '系数型公式必须是JSON对象,例如 {"A": 1000, "B": 2000}'
      return false
    }
    if (Object.keys(parsed).length === 0) {
      validationError.value = '系数型公式不能为空对象'
      return false
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

async function open(params: any) {
  // 1. 强制重置所有状态（核心：避免多次打开残留旧数据）
  validationError.value = ''
  jsonFormula.value = ''
  coefficientData.value = []

  formModel.value = {
    item_id: params.id || 0,
    field_name: params?.field_name || '',
    title: params?.title || '',
    field_type: params?.field_type || 0,
    formula: params.formula || '',
    group_id: params.group_id || 0,
    month: params.month || 0,
  }

  // 先加载工资字典（建立映射关系）
  // await loadSalaryDict()

  // 解析公式
  jsonFormula.value = formModel.value.formula

  // 格式化已有的JSON(美化显示)
  if (jsonFormula.value) {
    try {
      const parsed = JSON.parse(jsonFormula.value)
      jsonFormula.value = JSON.stringify(parsed, null, 2)
    }
    catch {
      // 保持原值
    }
  }

  // 转换为可视化数据，没有数据时再初始化默认行
  // （需在 nextTick 中执行，否则默认行会先被 jsonToVisual 的重置清掉）
  nextTick(() => {
    jsonToVisual()
    if (coefficientData.value.length === 0) {
      addCoefficientRow()
    }
  })

  modalRef.value?.open()
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'StaffSalaryGroupEnumvarEditor' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" title="编辑系数">
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
          <n-space vertical style="width: 100%">
            <!-- 键值对表格 -->
            <n-data-table
              v-if="coefficientData.length > 0"
              :columns="coefficientColumns"
              :data="coefficientData"
              :bordered="true"
              :single-line="false"
              :row-key="(row) => row.id"
              size="small"
            />

            <n-button type="primary" dashed block @click="addCoefficientRow">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              添加键值对
            </n-button>
          </n-space>
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button @click="source">
          JSON源码
        </n-button>
        <n-button type="primary" @click="submit">
          提交
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal ref="sourceModelRef" width="80vw" height="85vh" title="JSON源码">
    <n-form :show-feedback="false">
      <n-text v-if="validationError" type="error">
        {{ validationError }}
      </n-text>
      <n-space vertical style="width: 100%">
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
</template>
