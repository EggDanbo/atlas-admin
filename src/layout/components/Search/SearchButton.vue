<script lang="ts" setup>
import { NaIcon } from '@/components/NaIcon'

const SearchMenu = defineAsyncComponent(() => import('./SearchMenu.vue'))

const searchMenuRef = ref()
</script>

<template>
  <n-el tag="div" class="search-button mr-2 hidden items-center justify-between lg:flex" @click="searchMenuRef.open()">
    <div class="flex items-center">
      <NaIcon icon="ant-design:search-outlined" :size="15" class="opacity-50" />
      <n-text class="ml-2" depth="3">
        搜索
      </n-text>
    </div>

    <div class="ctrl-text ml-2 flex items-center">
      <NaIcon icon="vaadin:ctrl-a" :size="20" class="opacity-50" />
      <span class="ml-1 opacity-50">k</span>
    </div>
  </n-el>
  <!-- 搜查菜单 -->
  <SearchMenu ref="searchMenuRef" />
</template>

<style lang="less" scoped>
.search-button {
  background-color: var(--divider-color);
  border-radius: 6px;
  height: 34px;
  padding: 0 10px;
  cursor: pointer;
  &:hover {
    background-color: var(--hover-color);
  }

  .ctrl-text {
    padding: 0 5px;
    background-color: var(--card-color);
    border-radius: 8px;
  }
}
</style>
