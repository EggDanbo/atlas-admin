<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { NaIcon } from '@/components/NaIcon'
import { useGlobSetting } from '@/hooks/setting'
import { resetStore } from '@/store'
import { useConfigStore } from '@/store/modules/config'
import {
  AnimationSetup,
  BreadcrumbSetup,
  FooterSetup,
  LayoutSelector,
  NavSetup,
  OtherSetup,
  SidebarSetup,
  Skin,
  TabBarSetup,
  ThemeSetup,
  Widget,
} from './components/index'

const globSetting = useGlobSetting()

const configStore = useConfigStore()
const { copy } = useClipboard()
const isVisible = ref(false)
const Message = useMessage()
const preferencesTab = useStorage(`${globSetting.shortName}:preferencesTab`, 'themeSettings')

function open() {
  isVisible.value = true
}

function close() {
  isVisible.value = false
}

async function resetConfig() {
  resetStore({ storeIds: ['config-store', 'theme-store', 'language-store'] })
  await nextTick()
  window.location.reload()
}

function copyConfig() {
  const preferences = localStorage.getItem(`__${globSetting.shortName}__config-store`)
  copy(preferences || '')
  Message.success('复制成功')
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <n-drawer
    v-model:show="isVisible"
    :default-width="340"
    display-directive="show"
  >
    <n-drawer-content
      :native-scrollbar="false"
      closable
      title="偏好配置"
    >
      <div class="mt—3 mb-4 w-full text-center text-left">
        <n-tabs
          v-model:value="preferencesTab"
          animated
          default-value="1"
          pane-wrapper-style="padding:0"
          type="segment"
        >
          <n-tab-pane
            name="themeSettings"
            tab="主题设置"
          >
            <ThemeSetup />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                圆角
              </n-text>
            </div>
            <div class="flex flex-col justify-center text-center">
              <n-radio-group v-model:value="configStore.borderRadius" size="large">
                <n-radio-button :value="0">
                  0
                </n-radio-button>
                <n-radio-button :value="0.25">
                  0.25
                </n-radio-button>
                <n-radio-button :value="0.5">
                  0.5
                </n-radio-button>
                <n-radio-button :value="0.75">
                  0.75
                </n-radio-button>
                <n-radio-button :value="1">
                  1
                </n-radio-button>
              </n-radio-group>
            </div>
          </n-tab-pane>
          <n-tab-pane
            name="frameLayout"
            tab="框架布局"
          >
            <div>
              <n-text
                class="text-base"
                strong
              >
                布局模式
              </n-text>
              <LayoutSelector />
            </div>
            <n-divider class="!mb-3" />
            <n-grid
              :cols="4"
              class="my-4 mt-0"
            >
              <n-gi
                :span="2"
                class="pt-1.5"
              >
                <n-text depth="3">
                  间隙布局
                </n-text>
              </n-gi>
              <n-gi
                :span="2"
                class="text-right"
              >
                <n-switch v-model:value="configStore.intervalLayout" />
              </n-gi>
            </n-grid>
            <n-grid
              :cols="4"
              class="my-4 mt-0"
            >
              <n-gi
                :span="2"
                class="pt-1.5"
              >
                <n-text depth="3">
                  菜单分组
                </n-text>
              </n-gi>
              <n-gi
                :span="2"
                class="text-right"
              >
                <n-switch v-model:value="configStore.sidebarMenuGroup" />
              </n-gi>
            </n-grid>
            <n-grid
              :cols="4"
              class="my-4 mt-0"
            >
              <n-gi
                :span="2"
                class="pt-1.5"
              >
                <n-text depth="3">
                  菜单分割线
                </n-text>
              </n-gi>
              <n-gi
                :span="2"
                class="text-right"
              >
                <n-switch v-model:value="configStore.sidebarMenuDivider" />
              </n-gi>
            </n-grid>
            <n-divider />
            <div class="my-4 mt-4">
              <n-text
                class="text-base"
                strong
              >
                顶栏
              </n-text>
            </div>
            <NavSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                面包屑
              </n-text>
            </div>
            <BreadcrumbSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                页签
              </n-text>
            </div>
            <TabBarSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                侧边栏
              </n-text>
            </div>
            <SidebarSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                底部
              </n-text>
            </div>
            <FooterSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                小部件
              </n-text>
            </div>
            <Widget />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                动画
              </n-text>
            </div>
            <AnimationSetup />
            <n-divider />
            <div class="my-4">
              <n-text
                class="text-base"
                strong
              >
                其他
              </n-text>
            </div>
            <OtherSetup />
          </n-tab-pane>
          <n-tab-pane
            name="themedSkins"
            tab="主题风格"
          >
            <div class="flex flex-col justify-center p-3 text-center">
              <Skin />
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
      <template #footer>
        <div class="w-full flex justify-between">
          <n-button type="primary" @click="copyConfig">
            <template #icon>
              <NaIcon icon="ant-design:copy-outlined" />
            </template>
            复制配置
          </n-button>
          <n-button secondary strong type="tertiary" @click="resetConfig">
            <template #icon>
              <NaIcon icon="ant-design:rollback-outlined" />
            </template>
            重置配置
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="less" scoped>
//:deep(.color-picker .@{cp}-input__wrap) {
//  margin-left: auto;
//  max-width: 134px;
//  min-width: 134px;
</style>
