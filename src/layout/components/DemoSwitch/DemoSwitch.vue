<script setup lang="ts">
import { getDemoMode, setDemoMode } from '@/mock/demo-mode'
import toast from '@/utils/toast'

/**
 * 演示模式浮标
 *
 * 演示时现场切「正常 / 空数据 / 接口异常」，不用改代码。
 * 切换后刷新页面，让所有列表重新走一遍请求。
 */
type DemoMode = 'normal' | 'empty' | 'error'

const mode = ref<DemoMode>(getDemoMode())

const OPTIONS: Array<{ label: string, value: DemoMode }> = [
  { label: '正常数据', value: 'normal' },
  { label: '空数据（看空状态）', value: 'empty' },
  { label: '接口异常（看报错）', value: 'error' },
]

const label = computed(() => {
  if (mode.value === 'empty')
    return '空数据'
  if (mode.value === 'error')
    return '接口异常'
  return '正常'
})

function change(value: DemoMode) {
  if (value === mode.value)
    return
  setDemoMode(value)
  mode.value = value
  toast.success(`已切换到「${OPTIONS.find(item => item.value === value)?.label}」，正在刷新`)
  setTimeout(() => location.reload(), 400)
}
</script>

<template>
  <n-popselect :value="mode" :options="OPTIONS" trigger="click" @update:value="change">
    <button type="button" class="demo-switch" :class="`is-${mode}`">
      <span class="demo-switch__dot" />
      演示 · {{ label }}
    </button>
  </n-popselect>
</template>

<style scoped lang="less">
.demo-switch {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--atlas-border);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  color: var(--atlas-text-secondary);
  background: color-mix(in srgb, var(--atlas-canvas) 92%, transparent);
  box-shadow: 0 4px 14px rgb(0 0 0 / 10%);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: all 0.2s ease;

  &:hover {
    color: var(--atlas-brand);
    border-color: var(--atlas-brand);
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--atlas-success, #18a058);
  }

  &.is-empty &__dot {
    background: var(--atlas-warning, #f0a020);
  }

  &.is-error &__dot {
    background: var(--atlas-danger, #d03050);
  }
}
</style>
