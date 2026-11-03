<script lang="ts" setup>
import { projectConfig } from '@/config'
import { useThemeStore } from '@/store/modules/theme'

const themeStore = useThemeStore()
const {
  headerLucency,
  sidebarLucency,
  containerLucency,
  primaryColor,
  colorWeakness,
  isDark,
  navTheme,
  themeType,
  themeSkin,
  mode: themeMode,
} = storeToRefs(useThemeStore())

const skinMapColour = {
  'blue-sky': '#358cf1',
  'blue-christmas': '#358cf1',
  'blue-lattice': '#1d63b9',
  'pink-romantic': '#ff677b',
  'green-mountain': '#4e9c48',
  'paint-splashing': '#09a7e1',
  'orange-bubble': '#eb591d',
  'star-jellyfish': '#3376c1',
  'star-neon': '#c6372e',
}

function setSkin(value: ThemeSkin) {
  themeSkin.value = value
  primaryColor.value = skinMapColour[value]
  if (['star-jellyfish', 'star-neon'].includes(value)) {
    navTheme.value = 'dark'
    themeStore.toggleThemeMode('dark')
  }
  else {
    navTheme.value = 'light'
    themeStore.toggleThemeMode('light')
  }
}

function themeTypeChange(value) {
  if (isDark.value) {
    themeStore.toggleThemeMode()
  }
  if (value === 'skin' && themeSkin.value) {
    headerLucency.value = true
    sidebarLucency.value = true
    containerLucency.value = true
    themeStore.sidebarTheme = 'light'
  }
  else {
    navTheme.value = 'light'
    primaryColor.value = projectConfig.theme.primaryColor
    headerLucency.value = false
    sidebarLucency.value = false
    containerLucency.value = false
    themeStore.sidebarTheme = colorWeakness.value ? 'light' : 'dark'
  }
}
</script>

<template>
  <n-tabs
    v-model:value="themeType"
    animated
    default-value="pure"
    pane-wrapper-style="padding: 0"
    type="segment"
    class="mt-2"
    @update:value="themeTypeChange"
  >
    <n-tab-pane
      name="pure"
    >
      <template #tab>
        纯色主题
      </template>
    </n-tab-pane>
    <n-tab-pane
      name="skin"
    >
      <template #tab>
        主题皮肤
      </template>
    </n-tab-pane>
  </n-tabs>

  <div v-if="themeType === 'pure'" class="drawer-setting-item align-items-top py-3">
    <n-tabs
      v-model:value="themeMode"
      animated
      size="large"
      type="segment"
    >
      <n-tab name="light">
        <template #default>
          <n-flex align="center">
            <NaIcon icon="ant-design:sun-outlined" />
          </n-flex>
        </template>
      </n-tab>
      <n-tab name="dark">
        <template #default>
          <n-flex align="center">
            <NaIcon icon="ant-design:moon-outlined" />
          </n-flex>
        </template>
      </n-tab>
      <n-tab name="auto">
        <template #default>
          <n-flex align="center" size="small">
            <NaIcon icon="ant-design:desktop-outlined" />
          </n-flex>
        </template>
      </n-tab>
    </n-tabs>
  </div>

  <n-grid v-if="themeType === 'skin'" x-gap="12" y-gap="12" :cols="3" class="py-3">
    <n-gi>
      <n-card
        embedded
        :class="{ 'skin-card-on': themeSkin === 'blue-sky' }"
        class="skin-card"
        content-style="padding: 8px 0;"
        hoverable
        @click="setSkin('blue-sky')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/blue-sky-small.jpg">
          <n-text class="pt-2">
            蓝色天空
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'blue-christmas' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('blue-christmas')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/blue-christmas-small.jpg">
          <n-text class="pt-2">
            蓝色圣诞
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'blue-lattice' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('blue-lattice')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/blue-lattice-small.jpg">
          <n-text class="pt-2">
            彩色云母
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'pink-romantic' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('pink-romantic')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/pink-romantic-small.jpg">
          <n-text class="pt-2">
            粉色浪漫
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'green-mountain' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('green-mountain')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/green-mountain-small.jpg">
          <n-text class="pt-2">
            翡翠绿峰
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'paint-splashing' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('paint-splashing')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/paint-splashing-small.jpg">
          <n-text class="pt-2">
            流光溢彩
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'orange-bubble' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('orange-bubble')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/orange-bubble-small.jpg">
          <n-text class="pt-2">
            香橙泡泡
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'star-jellyfish' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('star-jellyfish')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/star-jellyfish-small.jpg">
          <n-text class="pt-2">
            深空水母
          </n-text>
        </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card
        :class="{ 'skin-card-on': themeSkin === 'star-neon' }"
        class="skin-card"
        embedded
        content-style="padding: 8px;"
        hoverable
        @click="setSkin('star-neon')"
      >
        <div class="flex flex-col justify-center text-center">
          <img src="@/assets/images/skins/star-neon-small.jpg">
          <n-text class="pt-2">
            星光霓虹
          </n-text>
        </div>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<style lang="less" scoped>
  .color-picker-item {
  width: 50%;
  margin: auto;

  :deep(.n-color-picker-trigger) {
    border-radius: 0.5rem;
  }
}
.skin-card {
  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }
  &-on {
    border-color: var(--n-color-target);
  }
  img {
    width: 70px;
    height: 50px;
    border-radius: 5px;
    display: inline-block;
    margin: auto;
  }
}
</style>
