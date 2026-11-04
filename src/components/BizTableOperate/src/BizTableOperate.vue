<script lang="ts" setup>
import type { PropType } from 'vue'
import { useTableItems } from '@/hooks/detail'

/**
 * 明细表格的行操作列
 *
 * 上移 / 下移 / 复制 / 插入 / 删除这五个按钮在二十多个明细表里重复实现过，
 * 差别只在操作的数组字段名和是否要复制、插入。收敛成一个组件后，
 * 页面里只需要一行：
 *
 * ```vue
 * <template #operate="{ rowIndex }">
 *   <BizTableOperate :model="formModel" opt="list" :row-index="Number(rowIndex)" copy add />
 * </template>
 * ```
 */
const props = defineProps({
  /** 单据模型，行操作直接作用在 model[opt] 上 */
  model: {
    type: Object as PropType<Recordable>,
    required: true,
  },
  /** 明细数组字段名，如 list / incomes / alloctes */
  opt: {
    type: String,
    default: 'list',
  },
  /** 当前行下标 */
  rowIndex: {
    type: Number,
    required: true,
  },
  /** 是否显示「复制本行」 */
  copy: {
    type: Boolean,
    default: false,
  },
  /** 是否显示「在此行后插入空行」 */
  add: {
    type: Boolean,
    default: false,
  },
})

const { tableItemsAdd, tableItemsCopy, tableItemsMoveDown, tableItemsMoveUp, tableItemsRemove }
  = useTableItems(props.model)

const total = computed(() => {
  const items = props.model[props.opt]
  return Array.isArray(items) ? items.length : 0
})

/** 只有多行时才谈得上排序 */
const sortable = computed(() => total.value > 1)
const isFirst = computed(() => props.rowIndex <= 0)
const isLast = computed(() => props.rowIndex >= total.value - 1)
</script>

<template>
  <div class="flex items-center justify-right gap-[10px]">
    <n-button
      v-if="sortable"
      :disabled="isFirst"
      text
      title="上移"
      @click="tableItemsMoveUp({ opt, key: rowIndex })"
    >
      <template #icon>
        <n-icon>
          <Icon icon="ant-design:arrow-up-outlined" />
        </n-icon>
      </template>
    </n-button>
    <n-button
      v-if="sortable"
      :disabled="isLast"
      text
      title="下移"
      @click="tableItemsMoveDown({ opt, key: rowIndex })"
    >
      <template #icon>
        <n-icon>
          <Icon icon="ant-design:arrow-down-outlined" />
        </n-icon>
      </template>
    </n-button>
    <n-button v-if="copy" text title="复制本行" @click="tableItemsCopy({ opt, key: rowIndex })">
      <template #icon>
        <n-icon>
          <Icon icon="ant-design:copy-outlined" />
        </n-icon>
      </template>
    </n-button>
    <n-button v-if="add" text title="插入一行" @click="tableItemsAdd({ opt, key: rowIndex })">
      <template #icon>
        <n-icon>
          <Icon icon="ant-design:plus-outlined" />
        </n-icon>
      </template>
    </n-button>
    <n-button text title="删除本行" @click="tableItemsRemove({ opt, key: rowIndex })">
      <template #icon>
        <n-icon>
          <Icon icon="ant-design:delete-outlined" />
        </n-icon>
      </template>
    </n-button>
  </div>
</template>
