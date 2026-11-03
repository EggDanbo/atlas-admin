<script lang="tsx" setup>
import type { MenuOption } from 'naive-ui'
import type { VNodeChild } from 'vue'
import { useClipboard, useStorage } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { NButton, NTooltip, useMessage } from 'naive-ui'
import { pinyin } from 'pinyin-pro'
import NaIcon from '@/components/NaIcon/src/NaIcon.vue'
import { getRender, SpRender } from '@/components/SpRender'
import { useGo } from '@/hooks/help/usePage'
import { useGlobSetting } from '@/hooks/setting'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import { filter } from '@/utils/helper/treeHelper'

interface SearchResult {
  label: string
  icon?: () => VNodeChild | undefined
  key: string
}

const globSetting = useGlobSetting()

const showModal = ref(false)
const activeIndex = ref(-1)
const loading = ref(false)
const Message = useMessage()
const searchKeyword = ref('')
const searchResult = ref<SearchResult[]>([])
const searchHistory = useStorage<SearchResult[]>(`${globSetting.shortName}:search-history`, [])
const { copy } = useClipboard()
const go = useGo()
let menuList: MenuOption[] = []

const asyncRouteStore = useAsyncRouteStore()

const menusList = computed<MenuOption[]>(() => asyncRouteStore.getMenus as MenuOption[])

// 复制链接
function handleCopyLink(path) {
  copy(path)
  Message.success('复制成功')
}

// 新窗口打开
function handleNewWindow(path) {
  window.open(path)
}

// 定义复制链接组件
const CopyLink = defineComponent({
  props: {
    path: String,
  },
  setup(props) {
    return () => (
      <NTooltip>
        {{
          trigger: () => (
            <NButton
              circle
              size="small"
              class="opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyLink(props.path)
              }}
            >
              <NaIcon icon="ant-design:link-outlined" size={15} />
            </NButton>
          ),
          default: () => (
            <div>复制链接</div>
          ),
        }}
      </NTooltip>
    )
  },
})

// 定义新窗口打开组件
const OpenNewWindow = defineComponent({
  props: {
    path: String,
  },
  setup(props) {
    return () => (
      <NTooltip>
        {{
          trigger: () => (
            <NButton
              circle
              size="small"
              class="opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                handleNewWindow(props.path)
              }}
            >
              <NaIcon icon="ant-design:export-outlined" size={14} />
            </NButton>
          ),
          default: () => (
            <div>新窗口打开</div>
          ),
        }}
      </NTooltip>
    )
  },
})

function open() {
  showModal.value = true
}

function hide() {
  showModal.value = false
}

// 组件挂载前克隆菜单列表
onBeforeMount(async () => {
  menuList = cloneDeep(menusList.value)
})

// 防抖搜索
const handleSearch = useDebounceFn(search, 200)

// 删除搜索记录
function deleteSearchHistory(searchItem: SearchResult) {
  searchHistory.value = searchHistory.value.filter(item => item.key !== searchItem.key)
}

// 搜索功能
function search() {
  loading.value = true
  searchKeyword.value = searchKeyword.value.trim()

  if (!searchKeyword.value) {
    searchResult.value = []
    loading.value = false
    activeIndex.value = -1
    return
  }

  const filterMenu = filter(menuList, (item: MenuOption) => {
    return matchSearch(item.label as string, searchKeyword.value)
  })

  searchResult.value = handlerSearchResult(filterMenu)
  activeIndex.value = searchResult.value.length > 0 ? 0 : -1

  nextTick(() => {
    loading.value = false
  })
}

// 匹配搜索关键词（支持中文、拼音首字母、模糊搜索）
function matchSearch(label: string, keyword: string): boolean {
  if (!label || !keyword)
    return false

  // 直接包含
  if (label.includes(keyword))
    return true

  // 获取拼音首字母
  const pinyinInitial = pinyin(label, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase()
  const keywordLower = keyword.toLowerCase()

  // 拼音首字母匹配
  if (pinyinInitial.includes(keywordLower))
    return true

  // 获取完整拼音
  const pinyinFull = pinyin(label, { pattern: 'pinyin', toneType: 'none', type: 'array' }).join('').toLowerCase()

  // 完整拼音匹配
  if (pinyinFull.includes(keywordLower))
    return true

  return false
}

// 处理搜索结果
function handlerSearchResult(filterMenu: MenuOption[]): SearchResult[] {
  const results: SearchResult[] = []
  const processMenu = (menu: MenuOption[]) => {
    menu.forEach((item) => {
      const { label, key, icon, children } = item
      if (matchSearch(label as string, searchKeyword.value) && !children?.length) {
        results.push({
          label: label as string,
          icon,
          key: key as string,
        })
      }

      if (Array.isArray(children) && children.length) {
        processMenu(children as MenuOption[])
      }
    })
  }

  processMenu(filterMenu)
  return results
}

// 鼠标进入
function handleMouseenter(e) {
  const index = Number((e.target as HTMLElement)?.dataset?.index)
  if (!Number.isNaN(index)) {
    activeIndex.value = index
  }
}

function handleClose() {
  searchResult.value = []
  searchKeyword.value = ''
  activeIndex.value = -1
  hide()
}

async function handleEnter() {
  if (!searchResult.value.length || activeIndex.value < 0) {
    return
  }

  const selectedItem = searchResult.value[activeIndex.value]

  // 记录历史搜索记录
  if (!searchHistory.value.some(item => item.key === selectedItem.key)) {
    searchHistory.value.push(selectedItem)
  }

  await handleClose()
  await nextTick()
  go(selectedItem.key)
}

// 按方向上键
function handleUp() {
  if (!searchResult.value.length)
    return

  activeIndex.value--
  if (activeIndex.value < 0) {
    activeIndex.value = searchResult.value.length - 1
  }
}

// 按方向下键
function handleDown() {
  if (!searchResult.value.length)
    return
  activeIndex.value++
  if (activeIndex.value > searchResult.value.length - 1) {
    activeIndex.value = 0
  }
}

// 回车搜索
onKeyStroke('Enter', handleEnter)

// 按方向上键
onKeyStroke('ArrowUp', handleUp)

// 按方向下键
onKeyStroke('ArrowDown', handleDown)

// 键盘 esc 取消弹窗
onKeyStroke('Escape', handleClose)

// 监听 Ctrl + K 打开搜索框
onKeyStroke('k', (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    open()
  }
})

defineExpose({ open })
</script>

<template>
  <n-modal
    v-model:show="showModal"
    width="600px" style="position: fixed; top: 100px; left: 50%; margin-left: -300px;"
  >
    <n-card
      style="width: 600px"
      content-style="padding: 0"
      header-style="padding: 0"
      footer-style="padding: 0;margin:0"
      :bordered="false"
      size="huge"
      :segmented="{
        content: true,
        footer: 'soft',
      }"
    >
      <template #header>
        <div class="mt-4 pl-2 pr-2">
          <n-input
            v-model:value="searchKeyword"
            :loading="loading"
            clearable
            size="large"
            autofocus class="search-input mb-3" placeholder="输入内容、支持按首字母搜索" @input="handleSearch"
          >
            <template #prefix>
              <NaIcon icon="ant-design:search-outlined" :size="15" />
            </template>
            <template #suffix>
              <NButton circle size="small" secondary class="opacity-50" @click="showModal = false">
                <NaIcon icon="ant-design:close-outlined" :size="15" />
              </NButton>
            </template>
          </n-input>
        </div>
      </template>
      <n-el tag="div" class="menu-list px-5">
        <n-scrollbar v-if="searchResult.length || searchHistory.length" style="max-height: 420px">
          <div
            v-for="(item, index) in searchResult"
            :key="item.key"
            :class="{ selected: index === activeIndex }"
            :data-index="index"
            class="menu-item flex items-center justify-between"
            @click="handleEnter"
            @mouseenter="handleMouseenter"
          >
            <div>
              <div class="flex items-center">
                <SpRender v-if="item.icon" :value="getRender(item.icon)" style="font-size: 18px;" />
                <NaIcon v-else icon="ant-design:menu-outlined" />
                <n-text class="ml-1 text-base leading-none">
                  {{ item.label }}
                </n-text>
              </div>
              <n-text depth="3">
                {{ item.key }}
              </n-text>
            </div>
            <n-flex>
              <CopyLink :path="item.key" />
              <OpenNewWindow :path="item.key" />
            </n-flex>
          </div>
          <!-- 搜索记录 -->
          <div v-if="!searchKeyword && searchHistory.length">
            <div class="py-2">
              <n-text depth="3">
                搜索历史
              </n-text>
            </div>
            <div
              v-for="(item, index) in searchHistory"
              :key="item.key"
              :class="{ selected: index === activeIndex }"
              :data-index="index"
              class="menu-item flex items-center justify-between"
              @click="handleEnter"
              @mouseenter="handleMouseenter"
            >
              <div>
                <div class="flex items-center">
                  <SpRender v-if="item.icon" :value="getRender(item.icon)" style="font-size: 18px;" />
                  <NaIcon v-else icon="ant-design:menu-outlined" />
                  <n-text class="ml-1 text-base leading-none">
                    {{ item.label }}
                  </n-text>
                </div>
                <n-text depth="3">
                  {{ item.key }}
                </n-text>
              </div>
              <n-flex>
                <CopyLink :path="item.key" />
                <OpenNewWindow :path="item.key" />
                <NTooltip trigger="hover">
                  <template #trigger>
                    <NButton circle size="small" class="opacity-50" @click="deleteSearchHistory(item)">
                      <NaIcon icon="ant-design:close-outlined" :size="15" />
                    </NButton>
                  </template>
                  删除记录
                </NTooltip>
              </n-flex>
            </div>
          </div>
        </n-scrollbar>
        <div v-if="(!searchResult.length && !searchHistory.length) || (searchKeyword && !searchResult.length)" class="flex flex-col justify-center py-8 text-center">
          <div class="mb-2 opacity-30">
            <NaIcon icon="ant-design:filter-outlined" :size="38" />
          </div>
          <n-text v-if="searchKeyword" depth="3">
            没有找到 <n-text class="font-bold">
              “{{ searchKeyword }}”
            </n-text> 的结果
          </n-text>
          <n-text v-else depth="3">
            输入搜索关键字开始搜索吧~
          </n-text>
        </div>
      </n-el>

      <template #footer>
        <n-flex align="center" size="small" class="mb-4 w-full px-3 pt-4">
          <NButton size="tiny" secondary class="cursor-default opacity-50">
            <NaIcon icon="ant-design:enter-outlined" :size="15" />
          </NButton>
          <n-text depth="3">
            选择
          </n-text>
          <n-divider vertical />
          <NButton size="tiny" secondary class="cursor-default opacity-50">
            <NaIcon icon="ant-design:export-outlined" :size="13" />
          </NButton>
          <n-text depth="3">
            新窗口
          </n-text>
          <n-divider vertical />
          <NButton size="tiny" secondary class="cursor-default opacity-50">
            <NaIcon icon="ant-design:arrow-up-outlined" :size="15" />
          </NButton>
          <NButton size="tiny" secondary class="cursor-default opacity-50">
            <NaIcon icon="ant-design:arrow-down-outlined" :size="15" />
          </NButton>
          <n-text depth="3">
            切换
          </n-text>
          <n-divider vertical />
          <NButton size="tiny" secondary class="cursor-default opacity-50">
            <NaIcon icon="vaadin:esc-a" :size="15" />
          </NButton>
          <n-text depth="3">
            退出
          </n-text>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<style lang="less" scoped>
.search-input {
  :deep(.n-input__border) {
    display: none;
  }
  :deep(.n-input__state-border) {
    display: none;
  }
}
.menu-list {
  margin-top: 10px;
  margin-bottom: 20px;
  .menu-item {
    border: 1px dashed transparent;
    border-bottom-color: var(--border-color);
    padding: 6px 12px;
    border-radius: var(--border-radius);
    background-color: transparent;
    cursor: pointer;
    margin-bottom: 5px;
    &:hover {
      background-color: var(--table-color-hover);
      border-color: var(--primary-color);
    }
    &:last-child {
      margin-bottom: 1px;
    }
  }
  .selected {
    background-color: var(--table-color-hover);
    border-color: var(--primary-color);
  }
}
</style>
