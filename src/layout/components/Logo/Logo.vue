<script lang="ts" setup>
import logo from '@/assets/logo.png'
import { projectConfig } from '@/config'
import { useConfigStore } from '@/store/modules/config'

const props = defineProps({
  source: {
    type: String,
  },
})

const { app: AppConfig } = projectConfig
const configStore = useConfigStore()

const showTitle = computed(() => {
  if (props.source === 'mobile') {
    return true
  }
  const layoutMode = configStore.mode
  if (configStore.mobile) {
    return false
  }
  return layoutMode === 'sidebar'
    || layoutMode === 'horizontal'
    || layoutMode === 'mixed-sidebar'
    || (layoutMode === 'vertical' && !configStore.collapsed)
})
</script>

<template>
  <div class="logo-item">
    <a class="brand" href="/">
      <span class="brand__mark">
        <img :src="logo" :alt="AppConfig.title">
      </span>
      <span v-if="showTitle" class="brand__text">
        <strong class="brand__name">{{ AppConfig.title }}</strong>
        <em class="brand__tagline">{{ AppConfig.tagline }}</em>
      </span>
    </a>
  </div>
</template>

<style lang="less" scoped>
.logo-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 4px;
  text-decoration: none;
  cursor: pointer;

  &__mark {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: var(--atlas-radius-md);
    background: linear-gradient(140deg, var(--atlas-brand) 0%, #fb923c 100%);
    box-shadow: 0 4px 10px -4px var(--atlas-brand-ring);
    transition: transform var(--atlas-duration) var(--atlas-ease);

    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      /* 图标本身是彩色的，放在渐变块上做反白处理 */
      filter: brightness(0) invert(1);
    }
  }

  &:hover &__mark {
    transform: translateY(-1px) scale(1.03);
  }

  &__text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    line-height: 1.2;
  }

  &__name {
    font-size: 14px;
    font-weight: 650;
    letter-spacing: 0.01em;
    color: var(--atlas-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__tagline {
    margin-top: 2px;
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--atlas-text-tertiary);
    white-space: nowrap;
  }
}

/* 侧栏为深色/主题色时反白 */
html[data-vxe-ui-theme='dark'] .brand__name,
.sidebar-dark .brand__name {
  color: #fff;
}

html[data-vxe-ui-theme='dark'] .brand__tagline,
.sidebar-dark .brand__tagline {
  color: rgba(255, 255, 255, 0.55);
}
</style>
