<script lang="ts" setup>
import { useConfigStore } from '@/store/modules/config'
import AvatarRoot from '../AvatarRoot/AvatarRoot.vue'
import CutThemeMenu from '../CutThemeMenu/CutThemeMenu.vue'
import FullScreen from '../FullScreen/FullScreen.vue'
import Information from '../Information/Information.vue'
import Language from '../Language/Language.vue'
import SearchButton from '../Search/SearchButton.vue'
import Setup from '../Setup/Setup.vue'

const {
  showFullScreen,
  showLanguage,
  showInformation,
  preferencesLocation,
} = storeToRefs(useConfigStore())
</script>

<template>
  <n-flex
    align="center"
    class="h-full p-r-4"
    :size="[5, 0]"
  >
    <!-- 搜索菜单触发 按钮 -->
    <SearchButton />
    <!-- 消息通知 -->
    <div class="hidden lg:block">
      <Information v-if="showInformation" />
    </div>
    <!-- 主题切换 -->
    <CutThemeMenu />
    <!-- 多语言 -->
    <div class="hidden lg:block">
      <Language v-if="showLanguage" />
    </div>
    <!-- 全屏 -->
    <div class="hidden lg:block">
      <FullScreen v-if="showFullScreen" />
    </div>
    <!-- 账号头像 -->
    <AvatarRoot />
    <!-- 偏好设置 -->
    <Setup v-if="preferencesLocation === 'nav'" />
  </n-flex>
</template>
