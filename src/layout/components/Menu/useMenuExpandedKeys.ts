import type { Ref } from 'vue'
import type { ExpandedKeysHandler, MenuKey } from './index'
import type { ProMenuProps } from './props'
import { computed, ref, watch } from 'vue'
import { useConfigStore } from '@/store/modules/config'
import { findMenuKeyPath, isSameKeys, normalizeSingleBranchExpandedKeys } from './index'

function callExpandedKeysHandler(handler: ExpandedKeysHandler | undefined, keys: MenuKey[]) {
  if (!handler)
    return

  if (Array.isArray(handler)) {
    handler.forEach(fn => fn(keys))
    return
  }

  handler(keys)
}

export function useMenuExpandedKeys(props: ProMenuProps, expandedKeysRef?: Ref<MenuKey[] | undefined>) {
  const { sidebarMenuAccordion } = storeToRefs(useConfigStore())
  const innerExpandedKeys = ref<MenuKey[]>()

  const singleBranchExpandEnabled = computed(() => {
    return sidebarMenuAccordion.value && props.location === 'sidebar'
  })

  const mergedExpandedKeys = computed<MenuKey[] | undefined>(() => {
    return innerExpandedKeys.value ?? (expandedKeysRef?.value as MenuKey[] | undefined) ?? (props.expandedKeys as MenuKey[] | undefined)
  })

  // watch controlled ref if provided, otherwise watch props.expandedKeys
  if (expandedKeysRef) {
    watch(expandedKeysRef, (keys) => {
      innerExpandedKeys.value = keys ? [...keys] : undefined
    }, { immediate: true, deep: true })
  }
  else {
    watch(() => props.expandedKeys as MenuKey[] | undefined, (keys) => {
      innerExpandedKeys.value = keys ? [...keys] : undefined
    }, { immediate: true, deep: true })
  }

  function emitExpandedKeys(keys: MenuKey[]) {
    innerExpandedKeys.value = keys
    if (expandedKeysRef) {
      expandedKeysRef.value = keys
    }
    callExpandedKeysHandler(props.onUpdateExpandedKeys as ExpandedKeysHandler | undefined, keys)
    callExpandedKeysHandler(props['onUpdate:expandedKeys'] as ExpandedKeysHandler | undefined, keys)
  }

  function commitExpandedKeys(keys: MenuKey[]) {
    if (isSameKeys(mergedExpandedKeys.value ?? [], keys)) {
      return
    }

    emitExpandedKeys(keys)
  }

  function normalizeExpandedKeys(keys: MenuKey[], keepKeys: MenuKey[] = []) {
    return normalizeSingleBranchExpandedKeys({
      currentExpandedKeys: mergedExpandedKeys.value,
      keys,
      keepKeys,
      menus: props.options ?? [],
      enabled: singleBranchExpandEnabled.value,
    })
  }

  function handleExpandedKeysUpdate(keys: MenuKey[]) {
    commitExpandedKeys(normalizeExpandedKeys(keys))
  }

  function syncExpandedKeysByValue(value: MenuKey | null | undefined) {
    if (!singleBranchExpandEnabled.value || value === null || value === undefined) {
      return
    }

    const menuKeyPath = findMenuKeyPath(value, props.options ?? [])

    if (menuKeyPath.length === 0) {
      return
    }

    const ancestorKeys = menuKeyPath.slice(0, -1)
    commitExpandedKeys(normalizeExpandedKeys(ancestorKeys, ancestorKeys))
  }

  watch(
    [() => props.value as MenuKey | null | undefined, () => props.options],
    ([value]) => {
      syncExpandedKeysByValue(value)
    },
    { immediate: true },
  )

  return {
    mergedExpandedKeys,
    handleExpandedKeysUpdate,
  }
}
