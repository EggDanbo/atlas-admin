<script lang="ts" setup>
import { defaultThemeColor } from '@/config'
import { useThemeStore } from '@/store/modules/theme'

const themeStore = useThemeStore()
const {
  headerLucency,
  sidebarLucency,
  containerLucency,
  primaryColor,
  isDark,
  navTheme,
  themeType,
  themeSkin,
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

function colorPickerComplete(value: string) {
  primaryColor.value = value
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
  navTheme.value = 'light'
  if (value === 'skin') {
    headerLucency.value = true
    sidebarLucency.value = true
    containerLucency.value = true
  }
  else {
    headerLucency.value = false
    sidebarLucency.value = false
    containerLucency.value = false
  }
}
</script>

<template>
  <div class="mb-4 text-center">
    <n-radio-group
      v-model:value="themeType"
      name="themeTypeGroup"
      @update:value="themeTypeChange"
    >
      <n-radio-button key="pure" value="pure" label="纯色主题" />
      <n-radio-button key="skin" value="skin" label="主题皮肤" />
    </n-radio-group>
  </div>

  <div v-if="themeType === 'pure'" class="drawer-setting-item align-items-top mb-3 pt-2">
    <div class="flex justify-center">
      <n-color-picker
        :actions="['confirm']"
        :default-value="themeStore.primaryColor"
        :swatches="defaultThemeColor"
        class="color-picker"
        @confirm="colorPickerComplete"
      />
    </div>
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

  <n-grid
    :cols="4"
    class="my-2"
  >
    <n-gi
      :span="2"
      class="text-left"
    >
      <n-text depth="3">
        顶部透明
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="headerLucency" />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-2"
  >
    <n-gi
      :span="2"
      class="text-left"
    >
      <n-text depth="3">
        侧边栏透明
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="sidebarLucency" />
    </n-gi>
  </n-grid>
  <!-- <n-grid
    :cols="4"
    class="my-2"
  >
    <n-gi
      :span="2"
      class="text-left"
    >
      <n-text depth="3">
        容器透明
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="containerLucency" />
    </n-gi>
  </n-grid> -->
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
