<script setup lang="ts">
const props = withDefaults(defineProps<{
  tableRef?: any
  cols?: number | string
  xGap?: number | string
  yGap?: number | string
  collapsedRows?: number
  showFold?: boolean
}>(), {
  cols: 6,
  xGap: 16,
  yGap: 16,
  collapsedRows: 1,
  showFold: true,
})

const overflow = ref(true)

function toggle() {
  overflow.value = !overflow.value
  props.tableRef?.redoHeight()
}
</script>

<template>
  <n-grid
    :cols="cols"
    :x-gap="xGap"
    :y-gap="yGap"
    :collapsed="overflow"
    :collapsed-rows="collapsedRows"
    responsive="screen"
    style="overflow: hidden"
  >
    <!-- 业务查询条件 -->
    <slot />

    <!-- 展开/收起按钮 -->
    <n-gi v-if="showFold" :suffix="true" :span="1">
      <n-flex justify="end" style="width: 100%;">
        <n-button
          text
          icon-placement="right"
          type="primary"
          @click="toggle"
        >
          <template #icon>
            <NaIcon :icon="overflow ? 'ant-design:down-outlined' : 'ant-design:up-outlined'" />
          </template>
          {{ overflow ? '展开更多条件' : '收起更多条件' }}
        </n-button>
      </n-flex>
    </n-gi>
  </n-grid>
</template>
