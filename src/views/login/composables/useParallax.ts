import type { ComputedRef } from 'vue'

import { useEventListener, useMediaQuery, useMouse, useWindowSize } from '@vueuse/core'
import { computed, ref } from 'vue'

interface ParallaxOptions {
  /** 视差倾斜强度（度），默认 10 */
  strength?: number
  /** 透视距离（px），默认 1000 */
  perspective?: number
}

/**
 * 鼠标视差倾斜 composable
 * 根据鼠标相对整个屏幕中心的位置，生成 3D 透视倾斜 transform。
 * 鼠标在屏幕任意位置移动都会触发；触屏设备（hover: none）返回 'none'，零干扰。
 */
export function useParallax(options: ParallaxOptions = {}): { transform: ComputedRef<string> } {
  const { strength = 10, perspective = 1000 } = options

  // 触屏设备无 hover，自动禁用
  const isTouch = useMediaQuery('(hover: none)')
  const { x, y } = useMouse()
  const { width, height } = useWindowSize()

  // 首帧鼠标坐标默认是 (0,0)，直接计算会让页面一打开就是斜的
  const moved = ref(false)
  useEventListener(window, 'mousemove', () => {
    moved.value = true
  })

  const transform = computed(() => {
    if (isTouch.value || !moved.value)
      return `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`

    // 归一化鼠标位置到 [-0.5, 0.5]，以屏幕中心为原点
    const px = width.value ? (x.value / width.value) - 0.5 : 0
    const py = height.value ? (y.value / height.value) - 0.5 : 0

    // strength 为单轴最大值，px/py 范围 ±0.5 → 乘 2 得 ±strength
    const rotateX = -py * strength * 2
    const rotateY = px * strength * 2
    return `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })

  return { transform }
}
