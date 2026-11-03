<script lang="ts" setup>
import { NaIcon } from '@/components/NaIcon'
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()
</script>

<template>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        显示 Logo
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch v-model:value="configStore.showLogo" />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        放大 Logo
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.logoLarge"
        :disabled="!configStore.showLogo"
      />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        隐藏布局边框
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.hideLayoutBorder"
      />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-flex :size="5" align="center">
        <n-text depth="3">
          动态标题
        </n-text>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button text type="warning">
              <template #icon>
                <NaIcon icon="ant-design:question-circle-outlined" />
              </template>
            </n-button>
          </template>
          开启：当前路由标题 - 网站名称，关闭：网站名称
        </n-tooltip>
      </n-flex>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.dynamicTitle"
      />
    </n-gi>
  </n-grid>
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        开启水印
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.openWatermark"
      />
    </n-gi>
  </n-grid>
</template>
