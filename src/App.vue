<script lang="ts" setup>
import AppProvider from '@/components/AppProvider/AppProvider.vue'
</script>

<template>
  <AppProvider>
    <router-view />
    <n-global-style />
  </AppProvider>
</template>
