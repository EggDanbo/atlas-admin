<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useConfigStore } from '@/store/modules/config'

const { pageAnimate, pageAnimateType } = storeToRefs(useConfigStore())
const { keepAliveComp, reloadFlag } = storeToRefs(useAsyncRouteStore())

/**
 * 获取需要缓存的组件列表
 */
const keepAliveComponents = computed(() => keepAliveComp.value)
/**
 * 获取路由组件的过渡动画名称
 */
const getTransitionName = computed(() => pageAnimate.value ? pageAnimateType.value : '')
</script>

<template>
  <RouterView>
    <template #default="{ Component, route }">
      <transition :name="getTransitionName" appear mode="out-in">
        <keep-alive v-if="keepAliveComponents.length && reloadFlag" :include="keepAliveComponents">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
        <component :is="Component" v-else-if="reloadFlag" :key="route.fullPath" />
      </transition>
    </template>
  </RouterView>
</template>
