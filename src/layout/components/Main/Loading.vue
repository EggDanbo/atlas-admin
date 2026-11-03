<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useVisitedPages } from '@/hooks/page/useVisitedPages'
import { useAsyncRouteStore } from '@/store/modules/async-route.ts'
import { useConfigStore } from '@/store/modules/config'

const showLoading = ref(true)
const { pageLoading, loading } = storeToRefs(useConfigStore())
const { reloadFlag } = storeToRefs(useAsyncRouteStore())

const route = useRoute()
const { markPageAsVisited, isPageVisited } = useVisitedPages()

// 判断是否应该显示加载动画
const shouldShowLoading = computed(() => {
  if (!reloadFlag.value) {
    return true
  }
  if (!pageLoading.value)
    return false
  // 如果页面已访问过，不显示加载动画
  if (isPageVisited(route.fullPath)) {
    return false
  }
  // 否则根据loading状态和showLoading状态显示
  return loading.value && showLoading.value
})

// 监听路由变化和加载状态
watch(
  [() => route.fullPath, () => loading.value],
  ([newPath, newLoading]) => {
    // 只有当加载完成时才标记页面为已访问
    if (newLoading === false) {
      // 使用微延迟确保标记操作在渲染之后
      setTimeout(() => {
        markPageAsVisited(newPath)
      }, 0)
    }
  },
  { immediate: true },
)
</script>

<template>
  <n-spin :show="shouldShowLoading" class="container-loading">
    <slot />
  </n-spin>
</template>

<style lang="less" scoped>
.container-loading {
  width: 100%;
  height: 100%;
  position: static;
  :deep(.n-spin-content) {
    height: 100%;
    position: static;
  }
}
</style>
