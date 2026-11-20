<script lang="ts" setup>
/**
 * 表格骨架屏
 *
 * 首次进列表页时，vxe-table 的 loading 遮罩下面是一张空表，观感上会「闪一下」。
 * 这里用骨架行占位，等数据回来再换成真表格。
 */
const props = withDefaults(defineProps<{
  rows?: number
  columns?: number
}>(), {
  rows: 8,
  columns: 6,
})

/** 固定一组宽度，避免每次渲染随机导致抖动 */
const WIDTHS = ['46%', '72%', '58%', '84%', '52%', '65%', '40%', '76%']

function widthAt(index: number) {
  return WIDTHS[index % WIDTHS.length]
}
</script>

<template>
  <div class="table-skeleton" role="status" aria-label="加载中">
    <div class="table-skeleton__head">
      <n-skeleton v-for="c in props.columns" :key="`h-${c}`" height="13px" :width="widthAt(c)" />
    </div>
    <div v-for="r in props.rows" :key="`r-${r}`" class="table-skeleton__row">
      <n-skeleton v-for="c in props.columns" :key="`c-${r}-${c}`" height="13px" :width="widthAt(c + r)" />
    </div>
  </div>
</template>

<style scoped lang="less">
.table-skeleton {
  padding: 4px 0;

  &__head,
  &__row {
    display: grid;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    grid-template-columns: repeat(v-bind('props.columns'), minmax(0, 1fr));
  }

  &__head {
    border-bottom: 1px solid var(--atlas-border);
  }

  &__row {
    border-bottom: 1px solid color-mix(in srgb, var(--atlas-border) 60%, transparent);
  }
}
</style>
