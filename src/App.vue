<script lang="ts" setup>
import AppProvider from '@/components/Provider/Provider.vue'
</script>

<template>
  <AppProvider>
    <router-view />
    <n-global-style />
  </AppProvider>
</template>
