<script lang="ts" setup>
import { NaIconButton } from '@/components/NaIconButton'

const { isFullscreen, toggle } = useFullscreen()
// 全屏切换
function toggleFullScreen() {
  toggle()
}
</script>

<template>
  <NaIconButton :icon="isFullscreen ? 'ant-design:compress-outlined' : 'ant-design:expand-outlined'" @click="toggleFullScreen" />
</template>
