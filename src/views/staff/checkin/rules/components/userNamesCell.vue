<script lang="ts" setup>
// 网格列内直接展示姓名缩略:前3个姓名,人数在单元格内可见,悬浮显示完整名单
const props = defineProps<{ names: string[] }>()

const briefText = computed(() => {
  const names = props.names
  const head = names.slice(0, 3).join('、')
  return names.length > 3 ? `${head} 等${names.length}人` : `${head}（${names.length}人）`
})
</script>

<template>
  <n-popover v-if="names.length > 0" placement="top" trigger="hover" :scrollable="true" style="max-height: 60vh;">
    <div class="user_names_pop">
      <p>共 {{ names.length }} 人</p>
      <p>{{ names.join('、') }}</p>
    </div>
    <template #trigger>
      <div class="user_names_cell">
        {{ briefText }}
      </div>
    </template>
  </n-popover>
  <span v-else>无</span>
</template>

<style lang="less" scoped>
.user_names_cell {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: default;
}

.user_names_pop {
  max-width: 320px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-all;
}
</style>
