<script lang="ts" setup>
import { isBoolean } from 'lodash-es'
import { useThemeVars } from 'naive-ui'
import { useConfigStore } from '@/store/modules/config'
import { containerProps } from './props'

const props = defineProps(containerProps)
const containerRef = ref()
const themeVars = useThemeVars()
const configStore = useConfigStore()

const getCardColor = computed(() => themeVars.value.cardColor)
const getBorderRadius = computed(() => themeVars.value.borderRadius)
const showAppFooter = computed(() => configStore.showFooter)

/**
 * 默认的 loading 选项
 */
const defaultLoadingOptions = {
  loading: false,
  tip: '加载中...',
  fullscreen: false,
}

/**
 * 合并 loading 选项配置
 */
const mergeProps = computed(() => {
  const mergedLoadingOptions = isBoolean(props.loading)
    ? { ...defaultLoadingOptions, loading: props.loading }
    : {
        ...defaultLoadingOptions,
        ...(props.loading ?? {}),
      }
  return {
    loadingZIndex: mergedLoadingOptions.loading ? 11 : -1,
    loadingOptions: mergedLoadingOptions,
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="{
      'p-4': ['box', 'panel'].includes(styleMode),
      'bg-panel': styleMode === 'panel',
      'h-auto': heightMode === 'auto',
      'h-full': heightMode === 'fill',
      'height-fill': heightMode === 'fill' && !showAppFooter,
      'show-footer-height-fill': heightMode === 'fill' && showFooter && !showAppFooter,
      'hide-app-footer': !showAppFooter && showFooter,
      'mb-2': !showAppFooter && !showFooter,
    }"
    class="page-container w-full"
  >
    <slot />
    <div v-loading="mergeProps.loadingOptions" class="page-container-loading" />
    <footer v-if="$slots.footer" class="page-container-footer">
      <n-card class="size-full" content-style="padding: 0;">
        <slot name="footer" />
      </n-card>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.page-container {
  box-sizing: border-box;
  &-loading {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: v-bind('mergeProps.loadingZIndex');
    width: calc(100% - var(--pro-layout-content-margin-left, 0px));
    margin-left: var(--pro-layout-content-margin-left, 0); // 兼容 sidebar-layout、mixed-sidebar-layout 的布局
    transition:
      width 0.3s var(--n-bezier),
      margin-left 0.3s var(--n-bezier);
  }
  .no-transition {
    transform: translateZ(0);
    will-change: transform;
    // 禁用所有过渡和动画
    transition: none !important;
    animation: none !important;

    // 覆盖所有可能的动画类
    &.fade-enter-active,
    &.fade-leave-active,
    &.zoom-fade-enter-active,
    &.zoom-fade-leave-active,
    &.fade-slide-enter-active,
    &.fade-slide-leave-active,
    &.fade-bottom-enter-active,
    &.fade-bottom-leave-active,
    &.fade-scale-enter-active,
    &.fade-scale-leave-active {
      transition: none !important;
    }

    &.fade-enter-from,
    &.fade-leave-to,
    &.zoom-fade-enter-from,
    &.zoom-fade-leave-to,
    &.fade-slide-enter-from,
    &.fade-slide-leave-to {
      transform: none !important;
      opacity: 1 !important;
    }
  }
}
.bg-panel {
  background-color: v-bind(getCardColor);
  border-radius: v-bind(getBorderRadius);
}
.page-container-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  z-index: 10;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.hide-app-footer {
  margin-bottom: 68px;
}
.height-fill {
  height: calc(100% - 14px);
}
.show-footer-height-fill {
  height: calc(100% - 70px);
}
</style>
