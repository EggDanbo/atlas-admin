<script lang="ts" setup>
import { NaIconBtn } from '@/components/IconBtn'
import { useThemeStore } from '@/store/modules/theme'

import { Menu } from './components/index'

const themeStore = useThemeStore()
const {
  grayscale,
  colorWeakness,
} = storeToRefs(useThemeStore())

const rotateDuration = 300
const rotating = ref(false)

const { start } = useTimeoutFn(
  () => rotating.value = false,
  rotateDuration,
  { immediate: false },
)

watch(() => themeStore.isDark, () => {
  rotating.value = true
  start()
})

function iconsValue() {
  if (themeStore.themeType === 'skin' && themeStore.themeSkin !== '') {
    return 'ant-design:skin-outlined'
  }
  else {
    if (themeStore.mode === 'light') {
      return 'ant-design:sun-outlined'
    }
    else if (themeStore.mode === 'dark') {
      return 'ant-design:moon-outlined'
    }
    else {
      return 'ant-design:desktop-outlined'
    }
  }
}

function handlePopoverShow() {
  if (themeStore.themeType === 'skin' && themeStore.themeSkin === '') {
    themeStore.themeType = 'pure'
  }
}

function colorWeaknessChange() {
  if (themeStore.themeType === 'pure') {
    themeStore.sidebarTheme = colorWeakness.value ? 'light' : 'dark'
  }
}
</script>

<template>
  <n-popover trigger="hover" style="padding: 0; width: 350px;" scrollable @update:show="handlePopoverShow">
    <template #trigger>
      <NaIconBtn :class="{ 'rotate-180': rotating }" :icon="iconsValue()" class="theme-toggle" />
    </template>

    <n-card
      size="small"
      :bordered="false"
      :segmented="{
        content: true,
      }"
      header-style="padding: 5px 0 13px 0;"
      content-style="padding: 0;"
    >
      <div class="w-full text-center text-left">
        <Menu />
      </div>

      <template #footer>
        <n-grid
          :cols="4"
          class="mt-3"
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
            <n-switch v-model:value="colorWeakness" @update:value="colorWeaknessChange" />
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
    </n-card>
  </n-popover>
</template>
