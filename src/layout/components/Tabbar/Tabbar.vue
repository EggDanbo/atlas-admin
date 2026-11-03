<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'
import tinyColor from 'tinycolor2'
import { VueDraggable } from 'vue-draggable-plus'
import { NaIcon } from '@/components/NaIcon'
import { NaIconButton } from '@/components/NaIconButton'
import { getRender, SpRender } from '@/components/SpRender'
import { projectConfig } from '@/config'
import { ERROR_ROUTE_NAME, HOME_ROUTE_PATH, LOGIN_ROUTE_NAME } from '@/config/page'
import { useGo } from '@/hooks/help/usePage'
import Flushed from '@/layout/components/Flushed/Flushed.vue'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { useConfigStore } from '@/store/modules/config'
import { getSimpleRoute, useTabbarStore } from '@/store/modules/tabbar'

import { openWindow } from '@/utils'
import { createIcon } from '@/utils/iconify'

const { clsPrefix } = projectConfig.app
const whiteList: string[] = [
  LOGIN_ROUTE_NAME,
  ERROR_ROUTE_NAME,
]
const themeVars = useThemeVars()

const primaryColor = computed(() => themeVars.value.primaryColor)
const dropdownX = ref(0)
const dropdownY = ref(0)
const isFullscreen = ref(false)
const { mobile, tabbarStyle, showNav, showSidebar, hideLayoutBorder, mode, showFlushed, showTabbarIcon } = storeToRefs(useConfigStore())
const tabbarStore = useTabbarStore()
const asyncRouteStore = useAsyncRouteStore()

const tagSelectedBg = computed(() => tinyColor(primaryColor.value).setAlpha(0.1).toRgbString())

const tagSelectedTextColor = computed(() => tinyColor(primaryColor.value).setAlpha(0.8).toRgbString())

const activeKey = ref()
const refreshCurrent = ref(true)
const closeCurrent = ref(false)
const closeLeftTab = ref(false)
const closeRightTab = ref(false)
const showDropdown = ref(false)
const currentTabRoute = ref(null)
const tabsRef = ref()

const go = useGo()
const message = useMessage()
const dialog = useDialog()
const route = useRoute()
const router = useRouter()
const tabsList = computed(() => tabbarStore.tabsList)

function handleFullscreen() {
  if (isFullscreen.value) {
    showNav.value = true
    showSidebar.value = true
  }
  else {
    showNav.value = false
    showSidebar.value = false
  }
  isFullscreen.value = !isFullscreen.value
}

function getTabIndex() {
  return tabsList.value.findIndex(item => item.fullPath === activeKey.value)
}

watch(
  () => route.fullPath,
  (to) => {
    // 如果您用的路由模式是 hash 请去掉，|| route.hash 判断条件
    if (whiteList.includes(route.name as string) || route.hash || route.meta.tagView === false)
      return
    activeKey.value = to
    currentTabRoute.value = null
    refreshCurrent.value = false
    tabbarStore.addTabs(getSimpleRoute(route))
    nextTick().then(() => {
      refreshTabDisabled(getTabIndex())
    })
  },
  { immediate: true },
)

// 当前路由对象 或者 右键选择tab路由对象
const getCurrentTabRoute = computed(() =>
  currentTabRoute.value ? currentTabRoute.value : route,
)

const operateOptions = computed(() => {
  const disabled = tabsList.value.length === 1
  // 获取当前右键操作的 Tab 路由名称
  const currentTabName = getCurrentTabRoute.value?.name as string
  // 判断是否已收藏
  const isFav = currentTabName ? tabbarStore.isFavorited(currentTabName) : false
  // 白名单路由不显示收藏选项
  const showFavorite = currentTabName && !whiteList.includes(currentTabName)

  const options = [
    {
      label: '重新加载',
      key: '1',
      icon: createIcon('ant-design:reload-outlined'),
      disabled: refreshCurrent.value,
    },
    {
      label: `关闭当前`,
      key: '2',
      disabled: closeCurrent.value || disabled,
      icon: createIcon('ant-design:close-circle-outlined'),
    },
    {
      // 当前标签与其他标签的操作分组分隔
      type: 'divider',
      key: 'd1',
    },
    {
      label: '关闭其他',
      key: '3',
      disabled,
      icon: createIcon('ant-design:delete-row-outlined'),
    },
    {
      label: '关闭左侧',
      key: '5',
      disabled: closeLeftTab.value,
      icon: createIcon('ant-design:vertical-right-outlined'),
    },
    {
      label: '关闭右侧',
      key: '6',
      disabled: closeRightTab.value,
      icon: createIcon('ant-design:vertical-left-outlined'),
    },
    {
      label: '关闭全部',
      key: '4',
      disabled,
      icon: createIcon('ant-design:close-outlined'),
    },
    {
      // 当前标签与其他标签的操作分组分隔
      type: 'divider',
      key: 'd2',
    },
    {
      label: '内容全屏',
      key: '7',
      icon: createIcon('ant-design:fullscreen-outlined'),
    },
    // {
    //   label: '新窗口打开',
    //   key: '9',
    //   disabled,
    //   icon: createIcon('ant-design:export-outlined'),
    // },
  ]

  // 白名单路由不显示收藏选项
  if (showFavorite) {
    options.push({
      label: isFav ? '取消收藏' : '添加收藏',
      key: '8',
      icon: createIcon(isFav ? 'ant-design:star-filled' : 'ant-design:star-outlined'),
    })
  }

  return options
})

function onClickOutside() {
  showDropdown.value = false
  currentTabRoute.value = null
  refreshCurrent.value = false
  const index = getTabIndex()
  refreshTabDisabled(index)
}

function handleContextMenu(e, item, index) {
  e.preventDefault()
  showDropdown.value = false
  currentTabRoute.value = toRaw(item)
  refreshCurrent.value = !(activeKey.value === item.fullPath)
  refreshTabDisabled(index)

  nextTick().then(() => {
    showDropdown.value = true
    dropdownX.value = e.clientX
    dropdownY.value = e.clientY
  })
}

function refreshTabDisabled(index) {
  closeCurrent.value = (tabsList.value?.[index]?.meta?.affix ?? false) as boolean
  closeLeftTab.value = !(tabsList.value.length > 0 && index > 0)
  closeRightTab.value = !(index < tabsList.value.length && index !== tabsList.value.length - 1)
}

// tab 操作
function closeHandleSelect(key) {
  switch (key) {
    // 刷新
    case '1':
      // reloadPage()
      asyncRouteStore.reloadPage()
      break
      // 关闭
    case '2':
      removeTab(getCurrentTabRoute)
      break
      // 关闭其他
    case '3':
      closeOther(getCurrentTabRoute)
      break
      // 关闭所有
    case '4':
      closeAll()
      break
      // 关闭左侧
    case '5':
      closeLeft(getCurrentTabRoute)
      break
      // 关闭右侧
    case '6':
      closeRight(getCurrentTabRoute)
      break
      // 内容页全屏
    case '7':
      // emit('pageFullScreen')
      mode.value = 'full-content'
      break
      // 收藏/取消收藏
    case '8':
      toggleFavorite()
      break
      // 新窗口打开
    case '9':
      openWindow(route.fullPath)
      break
  }
  showDropdown.value = false
}

// 切换收藏状态
function toggleFavorite() {
  const currentRoute = getCurrentTabRoute.value
  if (!currentRoute?.name)
    return

  const routeName = currentRoute.name as string
  if (whiteList.includes(routeName))
    return

  const isAdded = tabbarStore.addFavoritesPage(getSimpleRoute(currentRoute))
  message.success(isAdded ? '已添加到收藏' : '已取消收藏')
}

// 移除缓存组件名称
function delKeepAliveCompName() {
  if (route.meta.keepAlive) {
    const name = router.currentRoute.value.matched.find(item => item.name === route.name)
      ?.components
      ?.default
      ?.name
    if (name) {
      asyncRouteStore.keepAliveComp = asyncRouteStore.keepAliveComp.filter(
        item => item !== name,
      )
    }
  }
}

// 关闭左侧
function closeLeft(route) {
  tabbarStore.closeLeftTabs(route, activeKey.value)
  router.replace(route.fullPath)
}

// 关闭右侧
function closeRight(route) {
  tabbarStore.closeRightTabs(route, activeKey.value)
  router.replace(route.fullPath)
}

// 关闭全部
function closeAll() {
  tabbarStore.closeAllTabs()
  router.replace(HOME_ROUTE_PATH)
}

// 关闭其他
function closeOther(route) {
  tabbarStore.closeOtherTabs(route, activeKey.value)
  router.replace(route.fullPath)
}

// 关闭当前页面
function removeTab(route) {
  if (tabsList.value.length === 1) {
    return message.warning('这已经是最后一页，不能再关闭了！')
  }
  const routeInfo = unref(route)
  // 判断当前页标签状态 阻止关闭 只是提供思路，更多个性化功能，自行调整
  if (routeInfo.meta.state && routeInfo.meta.state === 'undone') {
    const { content } = routeInfo.meta.dialogOptions
    dialog.info({
      title: '提示',
      content,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        directRemoveTab(route)
      },
      onNegativeClick: () => {},
    })
  }
  else {
    directRemoveTab(route)
  }
}

function directRemoveTab(route) {
  delKeepAliveCompName()
  tabbarStore.closeCurrentTab(route)
  asyncRouteStore.removeKeepAliveComp([route.value.name])
  // 如果关闭的是当前页
  if (activeKey.value === route.value.fullPath) {
    const currentRoute = tabsList.value[Math.max(0, tabsList.value.length - 1)]!
    activeKey.value = currentRoute.fullPath
    router.push(currentRoute)
  }
}

// 删除tab
function closeTabItem(e) {
  const { fullPath } = e
  const routeInfo = ref(tabsList.value.find(item => item.fullPath === fullPath))
  removeTab(routeInfo)
}

// tags 跳转页面
function goPage(e) {
  const { fullPath } = e
  closeCurrent.value = e.meta?.affix ?? false
  activeKey.value = fullPath
  go(e, true)
}
</script>

<template>
  <n-el
    :class="{
      'simple-tag': tabbarStyle === 'simple',
      'card-tag': tabbarStyle === 'card',
      'google-tag': tabbarStyle === 'google',
      'hide-layout-border': tabbarStyle === 'google' && hideLayoutBorder,
    }"
    class="tabbar"
    tag="div"
  >
    <VueDraggable v-model="tabsList" :disabled="mobile" class="h-full" :animation="150" :target="`.${clsPrefix}-tabs-wrapper`">
      <n-tabs
        ref="tabsRef"
        :style="`--${clsPrefix}-tab-gap: 0`"
        :value="activeKey"
        class="tabbar-tabs"
        type="line"
      >
        <template #suffix>
          <n-flex :size="[0, 0]" align="center" style="padding-top: 1px;">
            <Flushed v-if="showFlushed" class="-mt-1" />
            <NaIconButton
              :icon=" isFullscreen ? 'ant-design:fullscreen-exit-outlined' : 'ant-design:fullscreen-outlined'"
              class="-mt-1" :tooltip="isFullscreen ? '退出全屏' : '内容全屏'"
              :tooltip-props="{ placement: 'bottom' }" @click="handleFullscreen"
            />
            <NaIconButton
              icon="ant-design:close-outlined" class="mr-2 -mt-1" tooltip="关闭全部"
              :tooltip-props="{ placement: 'bottom' }"
              @click="closeAll"
            />
          </n-flex>
        </template>
        <n-tab
          v-for="(item, index) in tabsList"
          :key="item.fullPath"
          :name="item.fullPath"
          @contextmenu="handleContextMenu($event, item, index)"
          @click.stop="goPage(item)"
        >
          <n-flex
            :size="[0, 0]"
            :class="{
              'tag-selected': item.fullPath === activeKey,
              'tag-affix': item.meta.affix,
            }"
            class="tag-item flex items-center justify-center"
          >
            <!-- 图标 -->
            <span v-if="showTabbarIcon && item.meta.icon" class="tag-icon flex items-center">
              <NaIcon :icon="item.meta.icon" />
            </span>
            <SpRender :ref="`tabbarRender_${item.name}`" :value="getRender(item.meta.title)" />
            <!-- 徽章 状态 标记 -->
            <n-badge v-if="item.meta.state === 'undone'" class="ml-1" dot type="warning" />
            <!-- 关闭按钮 -->
            <span
              v-if="!item.meta.affix"
              class="tag-icon tag-close-icon"

              @click.stop="closeTabItem(item)"
            >
              <NaIcon :size="14" icon="ant-design:close-outlined" />
            </span>
          </n-flex>
        </n-tab>
      </n-tabs>
    </VueDraggable>
    <n-dropdown
      :options="operateOptions"
      :show="showDropdown"
      :x="dropdownX"
      :y="dropdownY"
      placement="bottom-start"
      @clickoutside="onClickOutside"
      @select="closeHandleSelect"
    />
  </n-el>
</template>

<style lang="less" scoped>
:deep(.tabbar-tabs) {
  width: 100%;
  height: var(--pro-layout-tabbar-height);

  .@{cp}-tabs-nav {
    border: none;
    height: var(--pro-layout-tabbar-height);
    background-color: transparent;
  }

  .@{cp}-tabs-wrapper {
    height: var(--pro-layout-tabbar-height);
  }

  .@{cp}-tabs-bar {
    display: none;
  }

  .@{cp}-tabs-tab {
    padding: 0;
    border: none;
    height: var(--pro-layout-tabbar-height);
    display: flex;
    align-items: center;
    .@{cp}-tabs-tab__label {
      height: var(--pro-layout-tabbar-height);
    }
    &.@{cp}-tabs-tab--active {
      background-color: transparent;
    }
  }

  .@{cp}-tabs-tab-pad,
  .@{cp}-tabs-tab-wrapper {
    padding: 0;
  }

  .@{cp}-tabs-tab-wrapper {
    height: var(--pro-layout-tabbar-height);
  }

  .@{cp}-tabs-nav.@{cp}-tabs-nav--line-type.@{cp}-tabs-nav--top {
    .@{cp}-tabs-nav-scroll-content,
    .@{cp}-tabs-nav__suffix {
      border-bottom: none;
    }
  }
}

.tabbar {
  width: 100%;
  height: var(--pro-layout-tabbar-height);
  box-sizing: border-box;

  .tag-item {
    padding: 6px 12px;
    cursor: pointer;
    border-radius: var(--border-radius);
    color: var(--text-color-base);
    transition: all 0.3s ease;

    &:first-child {
      margin-left: 6px;
    }

    &:hover {
      span,
      .tag-icon {
        color: var(--primary-color);
      }
      .tag-close-icon {
        display: flex;
        color: var(--text-color-3);
        &:hover {
          background-color: var(--border-color);
          color: var(--text-color-2);
        }
      }
    }

    .tag-icon {
      margin-right: 5px;
    }

    .tag-close-icon {
      display: flex;
      align-items: center;
      color: var(--text-color-2);
      flex-shrink: 0;
      margin-left: 2px;
      margin-top: 1px;
      margin-right: -4px;
      background: transparent;
      border-radius: 50%;
      font-size: 18px;
      padding: 1px;
      box-sizing: border-box;
    }
  }

  .tag-selected {
    span,
    .tag-icon {
      color: var(--primary-color);
    }
    .tag-close-icon {
      display: flex;
      color: var(--text-color-3);
      &:hover {
        background-color: var(--border-color);
        color: var(--text-color-2);
      }
    }
  }
  .tag-affix {
    &:hover {
      // padding-right: 14px;
    }
  }
}

/* 简约风格 */
.simple-tag {
  .tag-item {
    &:hover {
      background-color: var(--table-color-hover);
    }
  }
  .tag-selected {
    background-color: v-bind(tagSelectedBg);
  }
}

/* 卡片风格 */
.card-tag {
  .tag-item {
    background-color: var(--card-color);
    border-radius: var(--border-radius);
    margin-right: 5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .tag-selected {
    background-color: v-bind(tagSelectedBg);
  }
}

/* 谷歌风格 */
.google-tag {
  height: 100%;
  .tag-item {
    padding: 11px 32px 11px 30px;
    -webkit-mask-box-image: url("data:image/svg+xml,%3Csvg width='67' height='33' viewBox='0 0 67 33' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M27 0c-6.627 0-12 5.373-12 12v6c0 8.284-6.716 15-15 15h67c-8.284 0-15-6.716-15-15v-6c0-6.627-5.373-12-12-12H27z' fill='%23F8EAE7'/%3E%3C/svg%3E")
      12 27 15;
    margin: 0 -15px;
    position: relative;
    border-radius: 0;
    margin-top: 3px;
    &:first-child {
      margin-left: 0;
    }
    &:hover {
      background-color: var(--table-color-hover);
    }
  }

  .tag-affix {
    &:hover {
      padding-right: 32px;
    }
  }

  .tag-selected {
    background-color: v-bind(tagSelectedBg);
    z-index: 1;
    &:hover {
      background-color: v-bind(tagSelectedBg);

      span {
        color: v-bind(tagSelectedTextColor);
      }
    }

    span {
      color: v-bind(tagSelectedTextColor);
    }
  }
}
/* 隐藏布局边框 */
.hide-layout-border {
  .tag-item {
    margin-top: 5px;
  }
}
</style>
