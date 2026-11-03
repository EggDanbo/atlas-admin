<script lang="ts" setup>
import type { TableSelectItem } from './useTableSelect'
import type { TableProps } from '@/components/SpTable'
import { user as userApi } from '@/service/api/organ'
import { useEnumStore } from '@/store/modules/enums'
import { isArray } from '@/utils/is'
import { SelectProps } from './props'
import { useTableSelect } from './useTableSelect'

const props = defineProps({
  ...SelectProps,
})

const emit = defineEmits<{
  /** 清空选择时触发 */
  'clear': []
  /** 选中值变化时触发 */
  'change': [value: string | string[]]
  /** 更新 v-model 值 */
  'update:value': [value: string | string[] | null]
  /** 更新 回显 值 */
  'update:options': [value: string | string[] | null | TableSelectItem[]]
}>()

const enumStore = useEnumStore()

// ==================== 常量 ====================

const EnumKeys = {
  ORGAN_USER_TYPES: 'organ_user_types',
} as const

// ==================== 响应式状态 ====================

const selectRef = ref<any>(null)
const tableRef = ref<any>(null)

const selectItems = ref<TableSelectItem[]>([])

const tableSelectedList = ref<Set<string>>(new Set())
const tableSelectedItems = ref<Map<string, { id: string, label: string }>>(new Map())
const isCheckedAll = ref<boolean>(false)
const checkedOptions = ref<{ [key: number]: boolean }>({})

// 筛选模型（业务特定）
interface FilterModel {
  filter: null | string
  types: null | string
}

const filterModel = reactive<FilterModel>({
  filter: null,
  types: null,
})

const gridOptions = reactive<TableProps>({
  dataFormat: 'select/user',
  columns: [
    {
      isOperate: true,
      width: 60,
      align: 'center',
      headerAlign: 'center',
      slots: { default: 'chk_default', header: 'chk_header' },
      fixed: 'right',
      visible: props.multiple,
    },
    {
      isOperate: true,
      title: '操作',
      width: 60,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  pagination: {
    showQuickJumper: false,
    showSizePicker: false,
    pageSize: 20,
  },
  showPageMode: false,
  showReload: false,
  immediate: true,
  height: 420,
  canResize: false,
  showResetBtn: false,
  fetchData,
  checkboxDisabled: true,
  showToolbarRight: false,
  filterDisabled: true,
  resizableDisabled: true,
  columnDropDisabled: true,
})

// ==================== 使用通用 Hook ====================

const {
  addItem,
  hasItem,
  getItems,
  renderLabel,
  onShow,
  closeDropdown,
  clearSelect,
} = useTableSelect({
  selectRef,
  tableRef,
  multiple: toRef(props, 'multiple'),
  selectItems,
  clearItem: () => { selectItems.value = [] },
  emitUpdate: value => emit('update:value', value),
})

// ==================== 计算属性 ====================

const getContentWidth = computed(() => ({
  width: props.contentWidth,
  maxWidth: props.maxContentWidth,
}))

const getWidth = computed(() => ({
  width: props.width,
  ...props.style,
}))

/**
 * 选择器绑定值
 * - 多选模式：返回 { label, value } 对象数组
 * - 单选模式：返回 label 字符串
 */
const getSelectItems = computed<any>({
  get() {
    if (props.multiple) {
      return selectItems.value.map(m => ({ label: m.label, value: m.id }))
    }
    else {
      return selectItems.value.length > 0 ? selectItems.value[0]!.label : null
    }
  },
  set() {},
})

// ==================== 内部状态 ====================

/** 内部更新计数器 */
let updateDepth = 0

// ==================== 业务特定逻辑 ====================

/**
 * 根据值回显用户名称
 */
async function fetchNames(value: string | string[]) {
  selectItems.value = []

  if (props.multiple) {
    const listArr = (props.options || []) as Array<{ value: string, label: string }>
    for (const item of listArr) {
      if (item?.value && item?.label) {
        addItem({ id: item.value, label: item.label })
      }
    }
  }
  else {
    if (value && props.options) {
      const label: any = props.options
      addItem({ id: value as string, label })
    }
  }
}

/**
 * 获取用户列表数据（业务特定）
 */
async function fetchData(params: any) {
  const team_id = props.team_id ? [props.team_id] : null
  const { isSuccess, data } = await userApi.list({
    ...params,
    ...filterModel,
    all: props.all,
    stoped: props.stoped ? 1 : 0,
    team_id,
    permission: [props.permission],
  })
  if (!isSuccess)
    return []
  return data
}

/**
 * 重新加载表格数据
 */
async function refresh() {
  filterModel.filter = null
  tableSelectedList.value.clear()
  tableSelectedItems.value.clear()
  await tableRef?.value?.fetch({ page: 1 })
}

// ==================== 监听器 ====================

watch(
  () => props.value,
  (value) => {
    if (updateDepth > 0)
      return

    if (value === null || value === undefined) {
      selectItems.value = []
      return
    }

    if (isArray(value)) {
      const items = selectItems.value
      if (value.length === items.length) {
        let matched = true
        for (const [i, element] of value.entries()) {
          if (element !== items[i]!.id) {
            matched = false
            break
          }
        }
        if (matched)
          return
      }
    }
    else {
      if (hasItem(value))
        return
    }

    fetchNames(value)
  },
  { immediate: true, deep: false },
)

watch(() => props.team_id, () => refresh(), { immediate: false, deep: false })
watch(() => props.types, () => {
  filterModel.types = props.types
  refresh()
}, { immediate: false, deep: false })

onMounted(() => {
  filterModel.types = props.types
})

// ==================== 事件处理 ====================

/**
 * 选择器选项变更事件
 */
function selectChange(_value: any, options: any) {
  if (options && isArray(options)) {
    selectItems.value = []
    for (const item of options) {
      addItem({ id: item.value.value, label: item.value.label })
    }
  }
  else if (_value) {
    const valueSet = new Set(isArray(_value) ? _value : [_value])
    selectItems.value = selectItems.value.filter(item => valueSet.has(item.id))
  }

  const items = getItems()
  updateDepth++
  emit('update:value', props.multiple ? items : _value)
  emit('change', items)
  nextTick(() => {
    updateDepth--
  })
}

/**
 * 表格行双击事件
 */
function dblClick({ row }: { row: any }) {
  const item: TableSelectItem = {
    id: row.user_id,
    label: row.name,
  }

  updateDepth++

  if (props.multiple) {
    if (checkedOptions.value[row.user_id]) {
      checkedOptions.value[row.user_id] = false
      tableSelectedList.value.delete(row.user_id)
      tableSelectedItems.value.delete(row.user_id)
    }
    else {
      checkedOptions.value[row.user_id] = true
      tableSelectedList.value.add(row.user_id)
      tableSelectedItems.value.set(row.user_id, { id: row.user_id, label: row.name })
    }

    addItem(item)
    const items = getItems()
    emit('update:value', items)
    emit('update:options', selectItems.value)
    emit('change', items)
  }
  else {
    selectItems.value = []
    addItem(item)
    emit('update:value', item.id)
    emit('update:options', item.label)
    emit('change', item.id)
    closeDropdown()
  }

  nextTick(() => {
    updateDepth--
  })
}

function submit() {
  const rows = tableRef.value?.getData()
  const checkedRows = rows?.filter(row => checkedOptions.value[row.user_id])
  const options: any = checkedRows?.map((row) => {
    return { ...row }
  })

  updateDepth++

  if (props.multiple) {
    selectItems.value = Array.from(tableSelectedItems.value.values())
    emit('update:value', Array.from(tableSelectedList.value))
    emit('update:options', selectItems.value)
  }
  emit('change', options)

  nextTick(() => {
    updateDepth--
  })
}

function handleTableAllChecked() {
  const rows = tableRef.value?.getData() || []
  rows.forEach((row: Recordable) => {
    if (isCheckedAll.value) {
      tableSelectedList.value.add(row.user_id)
      tableSelectedItems.value.set(row.user_id, { id: row.user_id, label: row.name })
    }
    else {
      tableSelectedList.value.delete(row.user_id)
      tableSelectedItems.value.delete(row.user_id)
    }
  })

  generateCheckedOptions()
  submit()
}

function handleTableChecked(isChecked: boolean, row: Recordable) {
  if (isChecked) {
    tableSelectedList.value.add(row.user_id)
    tableSelectedItems.value.set(row.user_id, { id: row.user_id, label: row.name })
  }
  else {
    tableSelectedList.value.delete(row.user_id)
    tableSelectedItems.value.delete(row.user_id)
  }

  submit()
}

function generateCheckedOptions() {
  const data: any = tableRef.value?.getData()
  const options: { [key: number]: boolean } = {}
  data.forEach((row) => {
    options[row.user_id] = tableSelectedList.value.has(row.user_id)
  })

  checkedOptions.value = options
}

function isCurrentPageAllChecked(): boolean {
  const data: any = tableRef.value?.getData()
  if (data.length === 0)
    return false
  return data.every(row => tableSelectedList.value.has(row.user_id))
}

// 网格数据重新加载时重新计算checkbox状态
function handleDataChange() {
  generateCheckedOptions()
  isCheckedAll.value = isCurrentPageAllChecked()
}

// ==================== 阻止内部控件键盘事件冒泡 ====================

function stopBubble(e?: Event) {
  if (e)
    e.cancelBubble = true
}

function handleFilterUpdate(e?: Event) {
  if (e) {
    e.cancelBubble = true
    tableRef.value?.search()
  }
}

// ==================== 暴露方法 ====================

defineExpose({ refresh })
</script>

<template>
  <n-select
    ref="selectRef"
    v-model:value="getSelectItems"
    clearable
    :style="getWidth"
    :placeholder="props.placeholder"
    :consistent-menu-width="false"
    :multiple="props.multiple"
    max-tag-count="responsive"
    :render-label="renderLabel"
    :disabled="props.disabled"
    @update:value="selectChange"
    @update:show="isShow => onShow(isShow, gridOptions)"
    @clear="clearSelect"
  >
    <template #empty>
      <div class="selectContent" :style="getContentWidth">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="dblClick" @data-change="handleDataChange">
          <template #toolbarLeftBtn>
            <n-input
              v-model:value="filterModel.filter"
              style="width: 280px"
              placeholder="搜索手机、编码、名称、缩写码等"
              clearable
              @keyup="stopBubble"
              @keydown.enter="handleFilterUpdate"
            />
            <n-select
              v-model:value="filterModel.types"
              style="width: 100px"
              placeholder="人员类型"
              :options="enumStore.getEnumOptions(EnumKeys.ORGAN_USER_TYPES)"
              clearable
            />
          </template>

          <template #chk_header>
            <n-checkbox v-model:checked="isCheckedAll" @update:checked="handleTableAllChecked" />
          </template>
          <template #chk_default="{ row }">
            <n-checkbox v-model:checked="checkedOptions[row.user_id]" @update:checked="(val) => handleTableChecked(val, row)" />
          </template>

          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="dblClick({ row })">
                {{ checkedOptions[row.id] ? '取消' : '选择' }}
              </n-button>
            </div>
          </template>
        </SpTable>
      </div>
    </template>
  </n-select>
</template>
