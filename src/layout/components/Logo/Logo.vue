<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'
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
const themeVars = useThemeVars()

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

const primaryColors = computed(() => {
  return themeVars.value.primaryColor
})
</script>

<template>
  <div class="logo-item">
    <n-button text type="primary" tag="a">
      <div v-if="showTitle" class="tagBox">
        <img class="tagBox__logo" :src="logo" alt="">
        <h2 class="text mt-0">
          {{ AppConfig.title }}
        </h2>
      </div>
      <n-image v-else width="32" height="32" :src="logo" preview-disabled />
    </n-button>
  </div>
</template>

<style lang="less" scoped>
.logo-item {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  padding-inline: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  a {
    text-decoration: none;
  }
  img {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
}

.tagBox {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 18px;
  height: 38px;
  padding: 0 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  margin-top: 4px;

  // 展开态同时显示图标与名称，避免只有一行描边文字
  &__logo {
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    border-radius: 6px;
    flex: 0 0 auto;
  }

  &:hover {
    background-color: v-bind(primaryColors) !important;
    border-color: v-bind(primaryColors) !important;
    color: #fff !important;
  }
}

html[data-vxe-ui-theme='light'] {
  .tagBox {
    color: v-bind(primaryColors);
    border-color: transparent;
  }
}

html[data-vxe-ui-theme='light'] {
  .sidebar-dark {
    .tagBox {
      color: #fff;
      border-color: transparent;
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .tagBox {
    color: #fff;
    border-color: transparent;
  }
}
</style>
