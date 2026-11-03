<script setup>
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()
</script>

<template>
  <div class="px-0 pt-4">
    <n-grid
      cols="3"
      x-gap="12"
      y-gap="12"
    >
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'vertical' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('vertical')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-left h-full">
                  <div class="bg-primary sidebar w-3 rounded" />
                </div>
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="header mb-1 h-6 w-full rounded" />
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>垂直布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'horizontal' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('horizontal')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="header bg-primary mb-1 h-6 w-full rounded" />
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>水平布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'two-column' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('two-column')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-left h-full flex">
                  <div class="bg-primary sidebar w-2 rounded" />
                  <div class="bg-primary sidebar ml-1 w-3 rounded opacity-5" />
                </div>
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="header mb-1 h-7 w-full rounded" />
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>双栏布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'mixed-two-column' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('mixed-two-column')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-left h-full flex">
                  <div class="bg-primary sidebar w-2 rounded" />
                  <div class="bg-primary sidebar ml-1 w-3 rounded opacity-5" />
                </div>
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="bg-primary header mb-1 h-7 w-full rounded" />
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>混合双栏布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'sidebar' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('sidebar')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex flex-col gap-1 rounded p-2 shadow-md">
                <div class="w-full">
                  <div class="bg-primary header h-3 w-full rounded" />
                </div>
                <div class="grid flex gap-1">
                  <div class="layout-left h-full">
                    <div class="bg-primary sidebar w-3 rounded" />
                  </div>
                  <div class="layout-right h-full w-full flex flex-col">
                    <div class="content h-7 rounded" />
                  </div>
                </div>
              </div>
            </template>
            <span>侧边栏布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'mixed-sidebar' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('mixed-sidebar')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-left h-full">
                  <div class="bg-primary sidebar w-3 rounded" />
                </div>
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="bg-primary header mb-1 h-7 w-full rounded" />
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>混合侧边栏布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <n-gi>
        <n-el
          :class="{ 'layout-selected': configStore.mode === 'full-content' }"
          class="layout h-16 flex cursor-pointer border-2px border-transparent rounded-md"
          tag="div"
          @click="configStore.setMode('full-content')"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="grid w-96 flex gap-1 rounded p-2 shadow-md">
                <div class="layout-right h-full w-full flex flex-col">
                  <div class="grid flex gap-1">
                    <div class="header mb-1 h-7 w-full rounded" />
                    <div class="header mb-1 h-7 w-full rounded" />
                  </div>
                  <div class="content h-13 rounded" />
                </div>
              </div>
            </template>
            <span>内容全屏布局</span>
          </n-tooltip>
        </n-el>
      </n-gi>
      <!--      <n-gi> -->
      <!--        <n-el -->
      <!--          :class="{ 'layout-selected': configStore.mode === 'mobile' }" -->
      <!--          class="layout h-16 flex rounded-md border-2px border-transparent cursor-pointer" -->
      <!--          tag="div" -->
      <!--          @click="configStore.setMode('mobile')" -->
      <!--        > -->
      <!--          <n-tooltip trigger="hover"> -->
      <!--            <template #trigger> -->
      <!--              <div class="flex grid gap-1 w-96 shadow-md rounded p-2"> -->
      <!--                <div class="layout-right flex flex-col w-full h-full"> -->
      <!--                  <div class="flex grid gap-1"> -->
      <!--                    <div class="rounded bg-primary header h-7 mb-1 w-1/4" /> -->
      <!--                    <div class="rounded header h-7 mb-1 flex-1" /> -->
      <!--                  </div> -->
      <!--                  <div class="rounded content h-13" /> -->
      <!--                </div> -->
      <!--              </div> -->
      <!--            </template> -->
      <!--            <span>移动端布局</span> -->
      <!--          </n-tooltip> -->
      <!--        </n-el> -->
      <!--      </n-gi> -->
    </n-grid>
  </div>
</template>

<style lang="less" scoped>
.layout {
  &:hover {
    border: 2px solid var(--primary-color);
  }
  .sidebar {
    height: 100%;
    opacity: 0.8;
  }
  .bg-primary {
    background-color: var(--primary-color);
  }
  &-right {
    .header {
      opacity: 0.5;
      background-color: var(--border-color);
    }
    .content {
      opacity: 0.5;
      background-color: var(--border-color);
    }
    .bg-primary {
      background-color: var(--primary-color);
    }
  }
}
.layout-selected {
  border: 2px solid var(--primary-color);
}
</style>
