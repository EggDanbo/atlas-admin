<script lang="ts" setup>
import type { TooltipProps } from 'naive-ui'
import { useThemeVars } from 'naive-ui'
import tinyColor from 'tinycolor2'
import { NaIcon } from '@/components/Icon'
import { useConfigStore } from '@/store/modules/config'
import { formatHeight, formatSizeValue, formatWidth } from '@/utils/style.ts'

interface IconProps {
  icon?: string
  color?: string
  size?: number
  depth?: 1 | 2 | 3 | 4 | 5 // 深度
}
const props = withDefaults(defineProps<{
  size?: number
  icon?: string
  iconProps?: IconProps
  tooltip?: string
  tooltipProps?: TooltipProps
  width?: string | number
  height?: string | number
  embedded?: boolean // 嵌入效果
}>(), {
  width: 38,
  height: 38,
})
const themeVars = useThemeVars()
const { borderRadius } = storeToRefs(useConfigStore())

const computedIconProps = computed<IconProps>(() => {
  // 确保基础默认值
  const baseProps: IconProps = {
    icon: props.icon || '',
    size: props.size ?? 18,
  }
  // 如果有传入的 iconProps，则合并，优先使用传入的值
  if (props.iconProps) {
    return { ...baseProps, ...props.iconProps }
  }
  return baseProps
})

const computedStyles = computed(() => {
  const primaryColor = themeVars.value.primaryColor
  return {
    borderRadius: formatSizeValue(borderRadius.value, 'rem'),
    toolBtnBg: tinyColor(primaryColor).setAlpha(0.1).toRgbString(),
    toolBtnBgTextColor: tinyColor(primaryColor).setAlpha(0.8).toRgbString(),
    width: `${formatWidth(props.width)}`,
    height: `${formatHeight(props.height)}`,
    tableColorHover: themeVars.value.tableColorHover,
    textColor2: themeVars.value.textColor2,
  }
})
</script>

<template>
  <div v-if="tooltip">
    <n-tooltip
      trigger="hover"
      v-bind="tooltipProps || {}"
    >
      <template #trigger>
        <div
          class="tool-button"
          :class="{ 'tool-button-embedded': embedded }"
          :style="`--textColor2:${computedStyles.textColor2}`"
        >
          <slot v-if="$slots.default" name="default" />
          <NaIcon v-bind="computedIconProps" />
        </div>
      </template>
      {{ tooltip }}
    </n-tooltip>
  </div>
  <template v-else>
    <div
      class="tool-button"
      :class="{ 'tool-button-embedded': embedded }"
      :style="`--textColor2:${computedStyles.textColor2}`"
    >
      <slot v-if="$slots.default" name="default" />
      <NaIcon v-bind="computedIconProps" />
    </div>
  </template>
</template>

<style lang="less" scoped>
.tool-button {
  width: v-bind('computedStyles.width');
  height: v-bind('computedStyles.height');
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: v-bind('computedStyles.borderRadius');
  cursor: pointer;
  transition: all 0.3s ease;
  color: v-bind('computedStyles.textColor2');
  &:hover {
    background-color: v-bind('computedStyles.toolBtnBg');
    color: v-bind('computedStyles.toolBtnBgTextColor');
    .n-icon {
      transform: scale(1.2);
      transition: all 0.25s;
    }
  }
  &-embedded {
    background-color: v-bind('computedStyles.tableColorHover');
  }
}
</style>
