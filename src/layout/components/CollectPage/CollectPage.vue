<script lang="tsx" setup>
import { cloneDeep } from 'lodash-es'
import { useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { vDraggable } from 'vue-draggable-plus'
import { useRoute } from 'vue-router'
import { NaIcon } from '@/components/Icon'
import { NaIconBtn } from '@/components/IconBtn'
import { useGo } from '@/hooks/help/usePage'
import { useI18n } from '@/hooks/i18n/useI18n'
import { clapMultipleRoute } from '@/router/helper'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { getSimpleRoute, TABBAR_WHITE_LIST, useTabbarStore } from '@/store/modules/tabbar'

const { t } = useI18n()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()
const go = useGo()
const popoverShow = ref(false) // 新增
const asyncRouteStore = useAsyncRouteStore()
const tabbarStore = useTabbarStore()
const { visibleFavoritesPage } = storeToRefs(tabbarStore)

const isShowMenus = ref(false)
const menusList = ref<any[]>([])

// 当前页面是否已收藏
const isCurrentFavorited = computed(() => {
  const routeName = route.name as string
  if (!routeName || TABBAR_WHITE_LIST.includes(routeName))
    return false
  return tabbarStore.isFavorited(routeName)
})

// 当前页面是否可收藏
const canFavoriteCurrentPage = computed(() => {
  const routeName = route.name as string
  return routeName && !TABBAR_WHITE_LIST.includes(routeName)
})

// 是否有收藏数据
const hasFavorites = computed(() => tabbarStore.favoritesPage.length > 0)

function updateMenus() {
  const newMenus = clapMultipleRoute(cloneDeep(asyncRouteStore.getMenus))
  newMenus.forEach((item: any) => {
    item.isCollect = tabbarStore.isFavorited(item.name)
    if (item.children && item.children.length) {
      item.children.forEach((children) => {
        children.isCollect = tabbarStore.isFavorited(children.name)
      })
    }
  })
  menusList.value = newMenus
}

function goPage(item) {
  if (isShowMenus.value) {
    message.warning('请先收起全部页面')
    return
  }
  const { name, meta } = item
  // 处理外链
  if (meta && meta.link) {
    window.open(meta.link)
    return
  }
  if (name === route.name) {
    return message.warning('您当前已经是该页面了')
  }
  go(item, true)
  popoverShow.value = false
}

function addMystore(item) {
  tabbarStore.addFavoritesPage(item)
  updateMenus()
}

// 一键收藏当前页
function toggleCurrentFavorite() {
  if (!canFavoriteCurrentPage.value)
    return

  const routeItem = getSimpleRoute(route)
  const isAdded = tabbarStore.addFavoritesPage(routeItem)
  message.success(isAdded ? '已添加到收藏' : '已取消收藏')
  updateMenus()
}

// 一键清空所有收藏
function handleClearAllFavorites() {
  if (!hasFavorites.value)
    return

  dialog.warning({
    title: '确认清空',
    content: `确定要清空所有收藏吗？共 ${tabbarStore.favoritesPage.length} 个收藏项`,
    positiveText: '确定清空',
    negativeText: '取消',
    onPositiveClick: () => {
      const count = tabbarStore.clearAllFavorites()
      message.success(`已清空 ${count} 个收藏`)
      updateMenus()
    },
  })
}

function toggleShowMenus() {
  isShowMenus.value = !isShowMenus.value
}

function hideShowMenus() {
  isShowMenus.value = false
}

function renderCardTitle() {
  return (
    <n-flex align="center" size="small">
      <div>收藏夹</div>
      <n-divider vertical />
      <n-text depth="3" class="pt-1 text-sm">
        可按住菜单拖拽排序
      </n-text>
    </n-flex>
  )
}

onMounted(() => {
  updateMenus()
})
</script>

<template>
  <n-popover v-model:show="popoverShow" trigger="click" placement="bottom-start" style="padding: 0" :show-arrow="false">
    <template #trigger>
      <div @click="popoverShow = !popoverShow">
        <NaIconBtn :size="20" icon="ant-design:star-outlined" tooltip="收藏夹" class="mr-2" />
      </div>
    </template>
    <div class="stock-nav">
      <n-el tag="div" class="w-full flex">
        <n-card
          :bordered="false"
          :title="renderCardTitle"
          size="small"
          :segmented="{
            content: true,
          }"
          class="stock-nav-left"
        >
          <template #header-extra>
            <n-flex align="center" size="small">
              <n-button
                v-if="canFavoriteCurrentPage"
                size="tiny"
                :type="isCurrentFavorited ? 'warning' : 'default'"
                secondary
                @click="toggleCurrentFavorite"
              >
                <template #icon>
                  <NaIcon :size="14" :icon="isCurrentFavorited ? 'ant-design:star-filled' : 'ant-design:star-outlined'" />
                </template>
                {{ isCurrentFavorited ? '已收藏当前页' : '收藏当前页' }}
              </n-button>
              <n-button
                v-if="hasFavorites"
                size="tiny"
                type="error"
                secondary
                @click="handleClearAllFavorites"
              >
                <template #icon>
                  <NaIcon :size="14" icon="ant-design:clear-outlined" />
                </template>
                清空
              </n-button>
              <div v-if="false" @click="toggleShowMenus">
                <NaIconBtn :width="24" :height="24" :size="17" icon="ant-design:vertical-left-outlined" :tooltip="isShowMenus ? '收起全部页面' : '展开全部页面'" class="mr-1" />
              </div>
            </n-flex>
          </template>
          <div
            v-draggable="[
              visibleFavoritesPage,
              {
                animation: 150,
                ghostClass: 'ghost',
              },
            ]"
            class="stock-nav-list"
          >
            <div v-for="item in visibleFavoritesPage" :key="item.name" class="stock-nav-item">
              <n-button icon-placement="right" secondary type="tertiary" class="w-full" @click="goPage(item)">
                {{ t(item.meta?.title as string) }}
                <template #icon>
                  <NaIcon :size="16" icon="ant-design:close-outlined" class="stock-nav-item-icon cursor-pointer" @click.stop="addMystore(item)" />
                </template>
              </n-button>
            </div>
            <n-text v-if="!visibleFavoritesPage.length" depth="3" class="my-3 w-full text-center">
              暂无数据
            </n-text>
          </div>
        </n-card>
        <div v-if="isShowMenus" class="h-full w-[1px] bg-gray-2" />
        <n-card
          v-if="isShowMenus"
          title="全部页面"
          size="small"
          :segmented="{
            content: true,
          }" :bordered="false" class="stock-nav-right"
        >
          <template #header-extra>
            <n-flex align="center">
              <n-text depth="3">
                点击收藏、下次快捷访问
              </n-text>
              <n-button circle type="tertiary" size="tiny" text @click="hideShowMenus">
                <template #icon>
                  <NaIcon icon="ant-design:close-outlined" :size="22" />
                </template>
              </n-button>
            </n-flex>
          </template>
          <n-tabs type="line" animated>
            <n-tab-pane
              v-for="item in menusList"
              :key="item.name"
              :name="item.name"
              :tab="t(item.meta?.title as string)"
            >
              <n-flex class="stock-nav-list right-nav-list">
                <div v-for="items in item.children" :key="items.name" class="stock-nav-item">
                  <n-button
                    dashed
                    class="stock-nav-item"
                    @click="addMystore(items)"
                  >
                    <n-flex size="small" align="center">
                      {{ t(items.meta?.title as string) }}
                      <NaIcon v-if="items.isCollect" :size="16" icon="ant-design:star-filled" />
                      <NaIcon v-else :size="16" icon="ant-design:star-outlined" />
                    </n-flex>
                  </n-button>
                </div>
                <!-- 一级菜单或者外链 -->
                <div v-if="!item.children" class="stock-nav-item">
                  <n-button
                    dashed
                    class="stock-nav-item"
                    @click="addMystore(item)"
                  >
                    <n-flex size="small" align="center">
                      {{ t(item.meta?.title as string) }}
                      <NaIcon v-if="item.isCollect" :size="16" icon="ant-design:star-filled" />
                      <NaIcon v-else :size="16" icon="ant-design:star-outlined" />
                    </n-flex>
                  </n-button>
                </div>
              </n-flex>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-el>
    </div>
  </n-popover>
</template>

<style lang="less" scoped>
  .stock-nav {
  display: flex;

  &-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, 122px); /* 固定列宽 */
    grid-gap: 8px;
  }

  &-item {
    width: 122px;
    .stock-nav-item-icon {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &-left {
    width: 414px;
  }

  &-right {
    min-width: 560px;
    max-width: 560px;
  }
}
</style>
