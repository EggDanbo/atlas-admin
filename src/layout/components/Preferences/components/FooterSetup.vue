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
        显示底部
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showFooter" />
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
        固定底部
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.footerFixed" :disabled="!configStore.showFooter" />
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
        底部高度
      </n-text>
    </n-gi>
    <n-gi :span="2">
      <n-input-number v-model:value="configStore.footerHeight" />
    </n-gi>
  </n-grid>
</template>
