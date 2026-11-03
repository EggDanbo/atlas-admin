<script lang="ts" setup>
import type { PropType } from 'vue'
import { useThemeStore } from '@/store/modules/theme'

const props = defineProps({
  tip: {
    type: String as PropType<string>,
    default: '',
  },
  absolute: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  background: {
    type: String as PropType<string>,
  },
})

const { primaryColor } = storeToRefs(useThemeStore())
</script>

<template>
  <section
    v-show="loading"
    :class="{ absolute }"
    :style="[props.background ? `background-color: ${props.background}` : '']"
    class="full-loading"
  >
    <slot v-if="$slots.default" name="default" />
    <div v-else class="first-loading-wrap">
      <div class="loading-wrap">
        <span class="dot dot-spin"><i /><i /><i /><i /></span>
      </div>
      <div class="loading-wrap-tip">
        {{ props.tip }}
      </div>
    </div>
  </section>
</template>

<style lang="less" scoped>
  .full-loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 4px;

  &.absolute {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 300;
  }
}

.first-loading-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.first-loading-wrap > h1 {
  font-size: 128px;
}

.first-loading-wrap .loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.first-loading-wrap .loading-wrap-tip {
  padding-top: 10px;
  color: v-bind(primaryColor);
}

.dot {
  animation: antRotate 1.2s infinite linear;
  transform: rotate(45deg);
  position: relative;
  display: inline-block;
  font-size: 32px;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
}

.dot i {
  width: 14px;
  height: 14px;
  position: absolute;
  display: block;
  background-color: v-bind(primaryColor);
  border-radius: 100%;
  transform: scale(0.75);
  transform-origin: 50% 50%;
  opacity: 0.3;
  animation: antSpinMove 1s infinite linear alternate;
}

.dot i:nth-child(1) {
  top: 0;
  left: 0;
}

.dot i:nth-child(2) {
  top: 0;
  right: 0;
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}

.dot i:nth-child(3) {
  right: 0;
  bottom: 0;
  -webkit-animation-delay: 0.8s;
  animation-delay: 0.8s;
}

.dot i:nth-child(4) {
  bottom: 0;
  left: 0;
  -webkit-animation-delay: 1.2s;
  animation-delay: 1.2s;
}

@keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg);
  }
}

@-webkit-keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg);
  }
}

@keyframes antSpinMove {
  to {
    opacity: 1;
  }
}

@-webkit-keyframes antSpinMove {
  to {
    opacity: 1;
  }
}
</style>
