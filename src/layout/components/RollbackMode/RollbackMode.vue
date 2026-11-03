<script lang="ts" setup>
import { usePrevious } from '@vueuse/core'
import { NaIcon } from '@/components/NaIcon'
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()
const { mode } = storeToRefs(configStore)
const previousMode = usePrevious(mode)

function rollbackMode() {
  if (previousMode.value && previousMode.value !== mode.value) {
    mode.value = previousMode.value
  }
  else {
    // 如果没有历史模式或与当前模式相同，则默认回到默认模式
    mode.value = 'vertical'
  }
}
</script>

<template>
  <n-el
    v-if="mode === 'full-content'"
    class="rollback-mode"
    tag="div"
    @click="rollbackMode"
  >
    <NaIcon :size="18" icon="ant-design:close-outlined" />
  </n-el>
</template>

<style lang="less" scoped>
.rollback-mode {
  position: fixed;
  top: 20px;
  right: 0;
  z-index: 1000;
  width: 46px;
  height: 40px;
  border-radius: 12px 0 0 12px;
  background-color: var(--primary-color);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--base-color);
  backdrop-filter: blur(8px);

  &:hover {
    background-color: var(--primary-color-hover);
    transform: scale(1.1);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.03);
  }
}
</style>
