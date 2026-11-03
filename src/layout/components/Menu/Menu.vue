<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { useVModel } from '@vueuse/core'
import { useI18n } from '@/hooks/help/useI18n.ts'
import { useThemeStore } from '@/store/modules/theme'
import { proMenuProps } from './props'
import { useMenuExpandedKeys } from './useMenuExpandedKeys'

defineOptions({
  name: 'ProMenu',
})

const props = defineProps(proMenuProps)
const { t } = useI18n()

const { sidebarTheme, navTheme } = storeToRefs(useThemeStore())
const { collapsedRef } = inject('n-layout-sider') as any
const expandedKeysRef = useVModel(props, 'expandedKeys')
const { mergedExpandedKeys, handleExpandedKeysUpdate } = useMenuExpandedKeys(props, expandedKeysRef)

const mergedCollapsed = computed(() => {
  return props.collapsed ?? toValue(collapsedRef) ?? false
})

const getInverted = computed(() => {
  if (props.location === 'nav' && navTheme.value === 'dark') {
    return true
  }
  if (props.location === 'sidebar' && sidebarTheme.value === 'primary') {
    return false
  }
  return props.location === 'sidebar' && sidebarTheme.value === 'dark'
})

const nMenuProps = computed(() => {
  const {
    collapsedShowTitle,
    menuItemHeightWhenCollapsedShowTitle,
    renderLabel,
    expandedKeys,
    onUpdateExpandedKeys,
    'onUpdate:expandedKeys': onUpdateExpandedKeysAlias,
    ...rest
  } = props
  const nextMenuProps = {
    ...rest,
    expandedKeys: mergedExpandedKeys.value,
    onUpdateExpandedKeys: handleExpandedKeysUpdate,
  }

  if (!collapsedShowTitle || !mergedCollapsed.value) {
    return {
      ...nextMenuProps,
      inverted: getInverted.value,
      renderLabel: renderMenuLabel,
    }
  }

  const itemHeight = menuItemHeightWhenCollapsedShowTitle ?? 64
  return {
    ...nextMenuProps,
    inverted: getInverted.value,
    builtinThemeOverrides: {
      ...(rest.builtinThemeOverrides ?? {}),
      itemHeight: `${itemHeight}px`,
    },
    renderLabel: renderMenuLabel,
  }
})
function renderMenuLabel(option: MenuOption) {
  const renderLabelContent = () => h('div', {
    class: 'flex items-center',
  }, t(option.label as string))
  const renderExtra = () => {
    if (!option._extraRender)
      return null
    return h('div', {
      class: 'flex items-center menu-extra-render',
    }, h(option._extraRender))
  }
  return h(
    'div',
    { class: 'flex justify-between items-center' },
    [renderLabelContent(), renderExtra()].filter(Boolean),
  )
}
</script>

<template>
  <!--  :accordion="sidebarMenuAccordion" -->
  <n-menu
    :class="[
      mergedCollapsed && collapsedShowTitle && 'pro-menu--collapsed-show-title',
    ]"
    class="pro-menu"
    v-bind="nMenuProps"
  />
</template>

<style lang="less" scoped>
.pro-menu.pro-menu--collapsed-show-title {
  :deep(.n-menu-item-content) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  :deep(.n-menu-item-content) {
    padding-left: 0 !important;
    padding-right: 0;
    transition: height 0.3s var(--n-bezier);
  }

  :deep(.n-menu-item-content__icon) {
    margin-right: 0px !important;
  }

  :deep(.n-menu-item-content-header) {
    opacity: 1;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70%;
    text-align: center;
  }

  :deep(.n-menu-item-content__arrow) {
    display: none;
  }
}

.pro-menu.n-menu.n-menu--collapsed {
  * {
    transition: none;
  }

  :deep(.n-menu-item-content) {
    transition: height 0.3s var(--n-bezier);
  }
  :deep(.menu-extra-render) {
    display: none;
  }
}
</style>
