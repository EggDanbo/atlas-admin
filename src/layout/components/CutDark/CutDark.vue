<script lang="ts" setup>
import { useMessage } from 'naive-ui'

import { NaIconBtn } from '@/components/IconBtn'
import { useThemeStore } from '@/store/modules/theme'

const rotateDuration = 300
const rotating = ref(false)
const themeStore = useThemeStore()
const Message = useMessage()

const { start } = useTimeoutFn(
  () => rotating.value = false,
  rotateDuration,
  { immediate: false },
)

watch(() => themeStore.isDark, () => {
  rotating.value = true
  start()
})

function enableTransitions() {
  return (
    'startViewTransition' in document
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

async function toggleTheme({ clientX: x, clientY: y }: MouseEvent) {
  if (themeStore.themeType === 'skin') {
    Message.warning('当前为皮肤主题，无法切换深色模式，请先切换为纯色主题')
    return
  }
  function interceptor() {
    themeStore.toggleThemeMode()
  }

  if (!enableTransitions()) {
    return interceptor()
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ]
  await document.startViewTransition(interceptor).ready

  document.documentElement.animate(
    { clipPath: themeStore.isDark ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${themeStore.isDark ? 'old' : 'new'}(root)`,
    },
  )
}
</script>

<template>
  <NaIconBtn :class="{ 'rotate-180': rotating }" :icon="themeStore.isDark ? 'ant-design:sun-outlined' : 'ant-design:moon-outlined'" class="theme-toggle" @click="toggleTheme" />
</template>
