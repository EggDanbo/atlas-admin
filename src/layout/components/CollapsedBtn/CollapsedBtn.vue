<script lang="ts" setup>
import { NaIconButton } from '@/components/NaIconButton'
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()

function handleCollapsed() {
  configStore.toggleCollapsed()
}
</script>

<template>
  <div @click="handleCollapsed">
    <NaIconButton :icon="configStore.collapsed ? 'ant-design:menu-unfold-outlined' : 'ant-design:menu-fold-outlined'" :tooltip="configStore.collapsed ? '展开菜单' : '折叠菜单'" />
  </div>
</template>
