<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/store/modules/theme.ts'

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '主题色', value: 'primary' },
]

const navThemeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '主题色', value: 'primary' },
]

const themeStore = useThemeStore()

const {
  grayscale,
  colorWeakness,
  themeType,
  mode: themeMode,
} = storeToRefs(useThemeStore())
</script>

<template>
  <div class="my-1 mb-3">
    <n-text
      class="text-base"
      strong
    >
      主题模式
    </n-text>
  </div>
  <div class="mb-3 px-6">
    <n-tabs
      v-model:value="themeMode"
      animated
      size="large"
      type="segment"
    >
      <n-tab name="light" :disabled="themeType === 'skin'">
        <template #default>
          <n-flex align="center">
            <NaIcon icon="ant-design:sun-outlined" />
          </n-flex>
        </template>
      </n-tab>
      <n-tab name="dark" :disabled="themeType === 'skin'">
        <template #default>
          <n-flex align="center">
            <NaIcon icon="ant-design:moon-outlined" />
          </n-flex>
        </template>
      </n-tab>
      <n-tab name="auto" :disabled="themeType === 'skin'">
        <template #default>
          <n-flex align="center" size="small">
            <NaIcon icon="ant-design:desktop-outlined" />
          </n-flex>
        </template>
      </n-tab>
    </n-tabs>
  </div>

  <div class="my-4">
    <n-text
      class="text-base"
      strong
    >
      布局主题
    </n-text>
  </div>

  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        侧边栏主题
      </n-text>
    </n-gi>
    <n-gi :span="2">
      <n-select
        v-model:value="themeStore.sidebarTheme"
        :options="themeOptions"
        :disabled="themeType === 'skin'"
      />
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
        顶栏主题
      </n-text>
    </n-gi>
    <n-gi :span="2">
      <n-select
        v-model:value="themeStore.navTheme"
        :options="navThemeOptions"
        :disabled="themeType === 'skin'"
      />
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
        色弱模式
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="colorWeakness" />
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
        灰色模式
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="grayscale" />
    </n-gi>
  </n-grid>
</template>
