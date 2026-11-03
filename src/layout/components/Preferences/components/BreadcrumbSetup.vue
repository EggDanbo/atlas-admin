<script lang="ts" setup>
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()
</script>

<template>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        显示面包屑
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showBreadcrumb" />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        显示面包屑图标
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showBreadcrumbIcon" />
    </n-gi>
  </n-grid>
</template>
