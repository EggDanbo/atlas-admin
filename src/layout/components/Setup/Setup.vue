<script lang="ts" setup>
import { NaIconBtn } from '@/components/IconBtn'
import Preferences from '../Preferences/Preferences.vue'

const preferencesRef = ref<InstanceType<typeof Preferences> | null>(null)
</script>

<template>
  <div @click="preferencesRef?.open()">
    <NaIconBtn icon="ant-design:setting-outlined" tooltip="偏好配置" />
  </div>
  <Preferences ref="preferencesRef" />
</template>
