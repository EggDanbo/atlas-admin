<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'
import { ref } from 'vue'
import Preferences from '../Preferences.vue'

const preferencesRef = ref<InstanceType<typeof Preferences> | null>(null)

const themeVars = useThemeVars()

// 摘取主题变量
const excerptThemeVars = computed(() => {
  return {
    '--primary-color': themeVars.value.primaryColor,
    '--card-color': themeVars.value.cardColor,
  }
})
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <div class="preferences-setting" :style="excerptThemeVars">
        <div class="preferences-setting-btn shadow" @click="preferencesRef?.open()">
          <NaIcon icon="ant-design:setting-filled" :size="32" color="var(--primary-color)" />
        </div>
      </div>
    </template>
    偏好配置
  </n-tooltip>
  <Preferences ref="preferencesRef" />
</template>

<style lang="less" scoped>
.preferences-setting {
  position: fixed;
  z-index: 10;
  right: 16px;
  bottom: 16px;

  &-btn {
    background: var(--card-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    color: var(--card-color);
    box-shadow:
      0 1px 2px -2px rgba(0, 0, 0, 0.08),
      0 3px 6px 0 rgba(0, 0, 0, 0.06),
      0 5px 12px 4px rgba(0, 0, 0, 0.04);
  }
}
</style>
