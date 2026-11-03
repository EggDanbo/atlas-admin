<script lang="ts" setup>
import { NaIconBtn } from '@/components/IconBtn'
import { useAsyncRouteStore } from '@/store/modules/async-route.ts'

const asyncRouteStore = useAsyncRouteStore()

async function handleReload() {
  await asyncRouteStore.reloadPage()
  await new Promise(resolve => setTimeout(resolve, 300))
}
</script>

<template>
  <NaIconBtn icon="ant-design:reload-outlined" tooltip="刷新页面" :tooltip-props="{ placement: 'bottom' }" @click="handleReload" />
</template>
