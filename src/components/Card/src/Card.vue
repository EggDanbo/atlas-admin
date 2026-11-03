<script lang="ts" setup>
import { collapseTransitionProps, NCard } from 'naive-ui'
import { ref, watch } from 'vue'
import { basicCardProps, cardExtendProps } from './props'
import { useOmitProps } from './useOmitProps'

const props = defineProps({
  ...basicCardProps,
})

const nCardProps = useOmitProps(props, {
  ...cardExtendProps,
  ...collapseTransitionProps,
  title: props.title,
})

const nCollapseProps = useOmitProps(props, { ...cardExtendProps })

const openCollapse = ref(false)

watch(
  () => props.show,
  (value) => {
    openCollapse.value = value ?? true
  },
  { immediate: true },
)

function handleExpand(area: 'main' | 'arrow') {
  const { triggers = [] } = props
  if (triggers.includes(area)) {
    openCollapse.value = !openCollapse.value
  }
}
</script>

<template>
  <NCard v-bind="nCardProps">
    <template #header>
      <div
        :class="{ 'cursor-pointer': triggers.includes('main') }"
        class="flex items-center"
        @click="handleExpand('main')"
      >
        <span v-if="title" :class="{ 'card-title-divider': showDivider }" class="card-title mr-1">
          {{ title }}
        </span>
        <n-tooltip v-if="tooltip" trigger="hover">
          <template #trigger>
            <NaIcon icon="ant-design:question-circle-outlined" class="cursor-pointer text-gray-400" />
          </template>
          {{ tooltip }}
        </n-tooltip>
      </div>
    </template>
    <template #header-extra>
      <div :class="{ 'cursor-pointer': triggers.includes('arrow') }" @click="handleExpand('arrow')">
        <slot v-if="$slots.collapse" :expanded="openCollapse" name="collapse" />
        <n-flex v-if="showCollapse && !$slots.collapse">
          <div class="handle-collapse flex items-center">
            <span class="handle-collapse-text">{{ openCollapse ? foldText : spreadText }}</span>

            <NaIcon :icon="openCollapse ? 'ant-design:down-outlined' : 'ant-design:up-outlined' " />
          </div>
        </n-flex>
      </div>
    </template>
    <template
      v-for="item in Object.keys($slots).filter((item) => item !== 'default')"
      :key="item"
      #[item]="data"
    >
      <slot :name="item" v-bind="data || {}" />
    </template>
    <n-collapse-transition :show="openCollapse" v-bind="nCollapseProps">
      <slot name="default" />
    </n-collapse-transition>
  </NCard>
</template>

<style lang="less" scoped>
  .basic-card-header-trigger,
.handle-collapse-trigger {
  cursor: pointer;
}
.handle-collapse {
  &:hover {
    color: var(--n-color-target);
  }
}
.handle-collapse-text {
  margin-right: 5px;
  font-size: var(--n-font-size);
}
.card-title {
  position: relative;
}
.card-title-divider {
  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: var(--n-color-target);
    border-radius: 10px;
  }
}
</style>
