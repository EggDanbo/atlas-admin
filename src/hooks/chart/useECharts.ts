import type { Fn } from '@vueuse/core'
import type { EChartsOption } from 'echarts'

import type { Ref } from 'vue'
import { tryOnUnmounted, useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, unref, watch } from 'vue'

import { useBreakpoint } from '@/hooks/help/useBreakpoint'
import { useEventListener } from '@/hooks/help/useEventListener'

import { useTimeoutFn } from '@/hooks/help/useTimeout'

import { useConfigStore } from '@/store/modules/config'
import { useThemeStore } from '@/store/modules/theme'
import echarts from '@/utils/lib/echarts'

export function useECharts(
  elRef: Ref<HTMLDivElement>,
  theme: 'light' | 'dark' | 'default' = 'default',
) {
  const { isDark } = storeToRefs(useThemeStore())
  const { collapsed, showSidebar } = storeToRefs(useConfigStore())

  const getDarkTheme = computed(() => {
    const sysTheme: string = isDark.value ? 'dark' : 'light'
    return theme === 'default' ? sysTheme : theme
  })

  let chartInstance: echarts.ECharts | null = null
  let resizeFn: Fn = resize
  const cacheOptions = ref({}) as Ref<EChartsOption>
  let removeResizeFn: Fn = () => {}
  resizeFn = useDebounceFn(resize, 200)

  const getOptions = computed(() => {
    if (getDarkTheme.value !== 'dark') {
      return cacheOptions.value as EChartsOption
    }
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value,
    }
  })

  function initCharts(t = theme) {
    const el = unref(elRef)
    if (!el || !unref(el)) {
      return
    }

    chartInstance = echarts.init(el, t)
    const { removeEvent } = useEventListener({
      el: window,
      name: 'resize',
      listener: resizeFn,
    })
    removeResizeFn = removeEvent
    const { widthRef, screenEnum } = useBreakpoint()
    if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
      useTimeoutFn(() => {
        resizeFn()
      }, 30)
    }
  }

  function setOptions(options: EChartsOption, clear = true) {
    cacheOptions.value = options
    return new Promise((resolve) => {
      if (unref(elRef)?.offsetHeight === 0) {
        useTimeoutFn(() => {
          setOptions(unref(getOptions))
          resolve(null)
        }, 30)
      }
      nextTick(() => {
        useTimeoutFn(() => {
          if (!chartInstance) {
            initCharts(getDarkTheme.value as 'default')

            if (!chartInstance)
              return
          }
          clear && chartInstance?.clear()

          chartInstance?.setOption(unref(getOptions))
          resolve(null)
        }, 30)
      })
    })
  }

  function resize() {
    chartInstance?.resize()
  }

  watch(
    () => getDarkTheme.value,
    (theme) => {
      if (chartInstance) {
        chartInstance.dispose()
        initCharts(theme as 'default')
        setOptions(cacheOptions.value)
      }
    },
  )

  tryOnUnmounted(() => {
    if (!chartInstance)
      return
    removeResizeFn()
    chartInstance.dispose()
    chartInstance = null
  })

  function getInstance(): echarts.ECharts | null {
    if (!chartInstance) {
      initCharts(getDarkTheme.value as 'default')
    }
    return chartInstance
  }

  watch([collapsed, showSidebar], (_) => {
    useTimeoutFn(() => {
      resizeFn()
    }, 300)
  })

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  }
}
