<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { TablePickerProps } from './props'

const props = defineProps({
  ...TablePickerProps,
})

const emit = defineEmits(['update:value', 'change'])

interface TreeOption {
  [key: string]: any
  children?: TreeOption[]
}

/** 树选择组件引用，用于调用 focus/blur 方法 */
const selectRef = ref<any>(null)
/** 当前选中的值 */
const selectItemsValue = ref<string | number | (string | number)[] | null | undefined>([])
/** 全选时使用的值数组，包含所有叶子节点的值 */
const checkAllValue = ref<any[]>([])

const getSelectOptions = computed(() => props.options)
const getCheckStrategy = computed(() => props.checkStrategy)

/**
 * 递归提取树结构中所有叶子节点的值
 * @description 深度优先遍历树结构，收集所有没有 children 或 children 为空的节点值
 * @param options - 树形选项数组
 * @param valueField - 值字段名，默认为 'value'
 * @returns 所有叶子节点的值数组
 * @example
 * // 输入: [{ id: 1, children: [{ id: 2 }] }]
 * // 输出: [2]
 */
function extractLeafValues(options: TreeOption[], valueField: string): any[] {
  const result: any[] = []
  for (const item of options) {
    if (item.children?.length) {
      // 有子节点则递归处理，继续向下查找叶子节点
      result.push(...extractLeafValues(item.children, valueField))
    }
    else if (!item.disabled) {
      // 无子节点说明是叶子节点，收集其值；禁用节点（无权限）排除在全选/反选之外
      result.push(item[valueField])
    }
  }
  return result
}

/**
 * 自定义过滤函数，用于树节点的搜索筛选
 * @description 大小写不敏感的模糊匹配，匹配节点的 filter 属性（非本函数名）
 * @param pattern - 用户输入的搜索关键词
 * @param option - 当前遍历到的树节点，需包含 filter 属性用于搜索
 * @returns 是否匹配
 */
function filter(pattern: string, option: TreeOption) {
  return option.filter?.toUpperCase().includes(pattern.toUpperCase()) ?? false
}

/**
 * 全选处理
 * @description 将当前所有叶子节点的值设置为选中状态
 */
function handleCheckAll() {
  selectItemsValue.value = [...checkAllValue.value]
  emit('update:value', selectItemsValue.value)
}

/**
 * 反选处理
 * @description 仅在多选模式下有效，切换选中状态：
 * - 有选中项时：取所有值的补集（未选中的变为选中）
 * - 无选中项时：执行全选
 */
function handleInverse() {
  const currentValue = selectItemsValue.value

  // 仅处理数组类型（多选模式）
  if (Array.isArray(currentValue)) {
    if (currentValue.length > 0) {
      // 过滤出不在当前选中列表中的值
      selectItemsValue.value = checkAllValue.value.filter(v => !currentValue.includes(v))
    }
    else {
      // 无选中项时执行全选
      selectItemsValue.value = [...checkAllValue.value]
    }
    emit('update:value', selectItemsValue.value)
  }
}

/**
 * 清空处理
 * @description 清空所有已选中的值，多选模式返回空数组，单选模式返回 null
 */
function handleClear() {
  selectItemsValue.value = props.multiple ? [] : null
  emit('update:value', selectItemsValue.value)
}

/**
 * 选择变化处理
 * @description n-tree-select 的 update:value 事件回调
 * @param value - 新的选中值
 * @param options - 选中项的完整数据
 */
function handleSelected(value: any, options: any) {
  selectItemsValue.value = value
  emit('update:value', value)
  emit('change', options)
}

/**
 * 关闭下拉框处理
 * @description 通过 focus + blur 组合触发下拉框关闭
 * @hack n-tree-select 没有提供直接的关闭方法，利用焦点机制间接实现
 */
function handleClose() {
  selectRef.value?.focus()
  selectRef.value?.blur()
}

/**
 * 自定义节点点击行为
 * @description 控制点击节点时的响应行为：
 * - 父节点（有 children）：点击展开/收起
 * - 叶子节点（无 children）：执行默认选择行为
 * @param option - 被点击的节点数据
 * @returns 行为类型 'toggleExpand' | 'default'
 */
function override({ option }: { option: TreeOption }) {
  return props.openOverride && option.children ? 'toggleExpand' : 'default'
}

/**
 * 监听 options 变化，更新全选值缓存
 * @description 当外部传入的树数据变化时，重新计算所有叶子节点的值，
 * 用于支持全选/反选功能
 */
watch(
  () => props.options,
  (options) => {
    checkAllValue.value = options ? extractLeafValues(options as TreeOption[], props.valueField) : []
  },
  { immediate: true },
)

/**
 * 监听外部 value 变化，同步到内部状态
 * @description 支持外部通过 v-model 控制选中值
 * 多选模式默认为空数组，单选模式默认为 null
 */
watch(
  () => props.value,
  (value) => {
    // 保持与外部传入值类型一致，未传入时根据 multiple 设置默认值
    selectItemsValue.value = value ?? (props.multiple ? [] : null)
  },
  { immediate: true },
)
</script>

<template>
  <n-tree-select
    ref="selectRef"
    v-model:value="selectItemsValue"
    :options="getSelectOptions"
    max-tag-count="responsive"
    cascade
    show-line
    filterable
    :placeholder="props.placeholder"
    :filter="filter"
    :key-field="props.valueField"
    :label-field="props.labelField"
    :check-strategy="getCheckStrategy"
    :override-default-node-click-behavior="override"
    :style="{ width: props.width }"
    :disabled="props.disabled"
    :multiple="props.multiple"
    :checkable="props.multiple"
    :clearable="props.clearable"
    :consistent-menu-width="false"
    @update:value="handleSelected"
  >
    <template v-if="props.multiple" #action>
      <n-flex justify="end">
        <n-button type="primary" text @click="handleCheckAll">
          全选
        </n-button>
        <n-button type="primary" text @click="handleInverse">
          反选
        </n-button>
        <n-button type="primary" text @click="handleClear">
          清空
        </n-button>
        <n-button type="primary" text @click="handleClose">
          关闭
        </n-button>
      </n-flex>
    </template>
  </n-tree-select>
</template>
