<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<IconProps>(), {
  size: 18,
})
// 开发模式下导入图标监察器
let recordIconUsage: ((icon: string, source: string) => void) | undefined
if (import.meta.env.DEV) {
  import('@/utils/iconTracker').then((module) => {
    recordIconUsage = module.recordIconUsage
  })
}

interface IconProps {
  icon?: string
  color?: string
  size?: number
  depth?: 1 | 2 | 3 | 4 | 5 // 深度
}
const isLocal = computed(() => props.icon?.startsWith('local:'))

const localIconContent = computed(() => {
  if (!props.icon || !isLocal.value)
    return ''

  const svgName = props.icon?.replace('local:', '')
  const svgModules = import.meta.glob<string>('@/assets/svg-icons/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  return svgModules[`/src/assets/svg-icons/${svgName}.svg`] || ''
})

// 开发模式监察图标使用（排除本地图标）
if (import.meta.env.DEV) {
  watch(
    () => props.icon,
    (icon) => {
      if (icon && !icon.startsWith('local:') && recordIconUsage) {
        recordIconUsage(icon, 'NaIcon')
      }
    },
    { immediate: true },
  )
}
</script>

<template>
  <n-icon
    v-if="icon"
    :color="color"
    :depth="depth"
    :size="size"
  >
    <template v-if="isLocal">
      <i v-html="localIconContent" />
    </template>
    <template v-else>
      <Icon :icon="icon" />
    </template>
  </n-icon>
</template>
