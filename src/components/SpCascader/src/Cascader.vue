<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { TablePickerProps } from './props'

const props = defineProps({
  ...TablePickerProps,
})

const emit = defineEmits(['update:value'])

interface CascaderOption {
  [key: string]: any
  children?: CascaderOption[]
}

/** 级联选择组件引用，用于调用 focus/blur 方法 */
const selectRef = ref<any>(null)
/** 当前选中的值 */
const selectItemsValue = ref<any[]>([])
/** 全选时使用的值数组，包含所有叶子节点的值 */
const checkAllValue = ref<any[]>([])

const getSelectOptions = computed(() => props.options)
const getCheckStrategy = computed(() => props.checkStrategy)

/**
 * 递归提取树结构中所有叶子节点的值
 * @description 深度优先遍历树结构，收集所有没有 children 或 children 为空的节点值
 * @param options - 树形选项数组
 * @param valueField - 值字段名
 * @returns 所有叶子节点的值数组
 */
function extractLeafValues(options: CascaderOption[], valueField: string): any[] {
  const result: any[] = []
  for (const item of options) {
    if (item.children?.length) {
      // 有子节点则递归处理
      result.push(...extractLeafValues(item.children, valueField))
    }
    else {
      // 无子节点说明是叶子节点
      result.push(item[valueField])
    }
  }
  return result
}

/**
 * 自定义过滤函数
 * @description 大小写不敏感的模糊匹配
 * @param pattern - 搜索关键词
 * @param option - 当前节点
 * @returns 是否匹配
 */
function filter(pattern: string, option: CascaderOption) {
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
 * @description 切换选中状态：有选中项时取补集，无选中项时执行全选
 */
function handleInverse() {
  const currentValue = selectItemsValue.value
  if (currentValue && currentValue.length > 0) {
    // 取补集
    selectItemsValue.value = checkAllValue.value.filter(v => !currentValue.includes(v))
  }
  else {
    // 无选中项时执行全选
    selectItemsValue.value = [...checkAllValue.value]
  }
  emit('update:value', selectItemsValue.value)
}

/**
 * 清空处理
 * @description 清空所有已选中的值
 */
function handleClear() {
  selectItemsValue.value = []
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
  emit('update:value', value, options)
}

/**
 * 关闭下拉框处理
 * @description 通过 focus + blur 组合触发下拉框关闭
 */
function handleClose() {
  selectRef.value?.focus()
  selectRef.value?.blur()
}

/**
 * 监听 options 变化，更新全选值缓存
 */
watch(
  () => props.options,
  (options) => {
    checkAllValue.value = options ? extractLeafValues(options as CascaderOption[], props.valueField) : []
  },
  { immediate: true },
)

/**
 * 监听外部 value 变化，同步到内部状态
 */
watch(
  () => props.value,
  (value) => {
    selectItemsValue.value = value ?? []
  },
  { immediate: true },
)
</script>

<template>
  <n-cascader
    ref="selectRef"
    v-model:value="selectItemsValue"
    :options="getSelectOptions"
    max-tag-count="responsive"
    cascade
    filterable
    :placeholder="props.placeholder"
    :filter="filter"
    :filter-menu-props="{ style: 'width: 350px' }"
    :value-field="props.valueField"
    :label-field="props.labelField"
    :check-strategy="getCheckStrategy"
    :multiple="props.multiple"
    :disabled="props.disabled"
    :clearable="props.clearable"
    :show-path="true"
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
  </n-cascader>
</template>
