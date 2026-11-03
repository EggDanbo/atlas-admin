import type { DirectiveBinding } from 'vue'

let throttleTimer: NodeJS.Timeout | null

export const throttle = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const eventType: string = Object.keys(binding.modifiers)[0] || 'click'

    el.addEventListener(eventType, () => {
      const delay: number = binding.arg ? Number.parseInt(binding.arg) : 300
      const fn: unknown = binding.value

      if (Number.isNaN(delay)) {
        throw new TypeError('v-throttle:arg必须为数字!')
      }

      if (typeof fn !== 'function') {
        throw new TypeError('v-throttle绑定值必须为函数!')
      }

      if (throttleTimer) {
        return
      }

      throttleTimer = setTimeout(() => {
        fn()
        throttleTimer = null
      }, delay)
    })
  },
}
