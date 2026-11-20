<script lang="ts" setup>
import { Icon } from '@iconify/vue'

/**
 * 错误边界
 *
 * 页面里某个组件渲染抛错时，Vue 会一路往上冒，最终整页白屏。
 * 用它包住主内容区：只坏这一块，显示「重新加载」，还能点一下重试，
 * 其他区域照常可用 —— 演示时最怕的就是白屏。
 */
const props = withDefaults(defineProps<{
  /** 出错时的提示文案，按场景可换 */
  title?: string
}>(), {
  title: '这块内容加载出错了',
})

const error = ref<Error | null>(null)
const renderKey = ref(0)

onErrorCaptured((err) => {
  error.value = err as Error
  // 返回 false 阻止继续冒泡到全局
  return false
})

function retry() {
  error.value = null
  renderKey.value += 1
}

defineExpose({ retry })
</script>

<template>
  <div v-if="error" class="error-boundary" role="alert">
    <Icon icon="ant-design:warning-outlined" class="error-boundary__icon" />
    <p class="error-boundary__title">
      {{ props.title }}
    </p>
    <p class="error-boundary__detail">
      {{ error.message }}
    </p>
    <n-button size="small" secondary type="primary" @click="retry">
      重新加载
    </n-button>
  </div>
  <div v-else :key="renderKey" class="error-boundary__content">
    <slot />
  </div>
</template>

<style scoped lang="less">
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 240px;
  padding: 32px 16px;
  text-align: center;

  &__icon {
    font-size: 36px;
    color: var(--atlas-warning, #f0a020);
  }

  &__title {
    margin: 4px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--atlas-text);
  }

  &__detail {
    max-width: 520px;
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--atlas-text-tertiary);
    word-break: break-all;
  }

  &__content {
    display: contents;
  }
}
</style>
