<script lang="ts" setup>
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()

const tabbarStyleOptions = [
  {
    label: '简约',
    value: 'simple',
  },
  {
    label: '卡片',
    value: 'card',
  },
  {
    label: '谷歌',
    value: 'google',
  },
]
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
        显示页签
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showTabbar" />
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
        显示页签图标
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showTabbarIcon" :disabled="!configStore.showTabbar" />
    </n-gi>
  </n-grid>

  <!--  由于布局限制，修改高度会影响布局 -->
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        页签高度
      </n-text>
    </n-gi>
    <n-gi :span="2">
      <n-input-number v-model:value="configStore.tabbarHeight" />
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
        页签风格
      </n-text>
    </n-gi>
    <n-gi :span="2">
      <n-select
        v-model:value="configStore.tabbarStyle"
        :options="tabbarStyleOptions"
      />
    </n-gi>
  </n-grid>
</template>
