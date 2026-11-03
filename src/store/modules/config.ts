import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, reactive, ref, toRefs } from 'vue'
import { projectConfig } from '@/config'

function useMobile() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  return computed(() => {
    return breakpoints.between('sm', 'md').value || breakpoints.smallerOrEqual('sm').value
  })
}

// 平板（640 ~ 1280）：只用于隐藏多标签栏，不改变布局形态
function useTablet() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  return computed(() => {
    return breakpoints.greaterOrEqual('sm').value && breakpoints.smaller('xl').value
  })
}

export const useConfigStore = defineStore('config-store', () => {
  const mobile = useMobile()
  const tablet = useTablet()
  const system = reactive({ ...projectConfig.system })
  const loading = ref(false)

  function toggleCollapsed() {
    system.collapsed = !system.collapsed
  }
  function setMode(value: LayoutMode) {
    system.mode = value
    setIsMobile(value === 'mobile')
  }

  function setIsMobile(value: boolean) {
    system.isMobile = value
  }

  function resetStore() {
    Object.assign(system, { ...projectConfig.system })
  }

  return {
    mobile,
    tablet,
    toggleCollapsed,
    setMode,
    resetStore,
    loading,
    ...toRefs(system),
  }
}, {
  persist: {
    key: 'config-store',
    storage: localStorage,
  },
})
