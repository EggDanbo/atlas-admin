<script lang="ts" setup>
import { NaIcon } from '@/components/Icon'
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()

const animateOptions = [
  { value: 'zoom-fade', label: '渐变' },
  { value: 'zoom-out', label: '闪现' },
  { value: 'fade-slide', label: '滑动' },
  { value: 'fade', label: '消退' },
  { value: 'fade-bottom', label: '底部消退' },
  { value: 'fade-scale', label: '缩放消退' },
]
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
      <n-flex :size="5" align="center">
        <n-text depth="3">
          页面切换进度条
        </n-text>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button text type="warning">
              <template #icon>
                <NaIcon icon="ant-design:question-circle-outlined" />
              </template>
            </n-button>
          </template>
          切换页面的时候，浏览器顶部会显示进度条
        </n-tooltip>
      </n-flex>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.pageProgress"
      />
    </n-gi>
  </n-grid>
  <!-- TOOD -->
  <!-- <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        页面切换动画
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
      class="text-right"
    >
      <n-switch
        v-model:value="configStore.pageAnimate"
      />
    </n-gi>
  </n-grid> -->
  <n-grid
    :cols="4"
    class="my-4"
  >
    <n-gi
      :span="2"
      class="pt-1.5"
    >
      <n-text depth="3">
        动画类型
      </n-text>
    </n-gi>
    <n-gi
      :span="2"
    >
      <n-select v-model:value="configStore.pageAnimateType" :disabled="!configStore.pageAnimate" :options="animateOptions" />
    </n-gi>
  </n-grid>
</template>
