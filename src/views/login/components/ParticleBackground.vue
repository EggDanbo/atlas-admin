<script lang="ts" setup>
import { useThemeStore } from '@/store/modules/theme'

const { isDark } = storeToRefs(useThemeStore())

const color = isDark.value ? '#000' : '#fff'
</script>

<template>
  <div class="particle-bg">
    <div class="particle-orb" />
  </div>
</template>

<style lang="less" scoped>
.particle-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  // z-index:0 低于卡片容器(2)，依赖 DOM 顺序盖住 login-bg
  z-index: 0;
}

.particle-orb {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  // 橙色光晕对比强，降低不透明度避免整页泛橙、压住登录卡片
  background: radial-gradient(circle at center, v-bind(color), rgba(249, 115, 22, 0.42));
  filter: blur(120px);
  animation: particle-float 5s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes particle-float {
  0% {
    transform: translate(-120px, -60px) scale(1);
  }

  100% {
    transform: translate(120px, 60px) scale(1.5);
  }
}
</style>
