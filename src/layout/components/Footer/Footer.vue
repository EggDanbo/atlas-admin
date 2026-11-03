<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

// 摘取主体变量，挂载
const excerptThemeVars = computed(() => {
  return {
    '--primary-color': themeVars.value.primaryColor,
    '--card-color': themeVars.value.cardColor,
    '--border-radius': themeVars.value.borderRadius,
  }
})
</script>

<template>
  <div
    class="footer-box py-3 text-center"
    :style="excerptThemeVars"
  >
    <div class="flex justify-center opacity-80">
      <n-flex :size="26">
        <n-text depth="3" class="text-xs">
          演示版本 · 数据由本地 mock 生成，不代表真实业务
        </n-text>
      </n-flex>
    </div>

    <div class="mt-2">
      <n-text depth="3">
        Copyright © 2026 Atlas Admin
      </n-text>
    </div>
  </div>
</template>

<style lang="less" scoped>
.footer-box {
  background-color: var(--pro-layout-content-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-sizing: border-box;
  height: 100%;
}
</style>
