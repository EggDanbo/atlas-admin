import type { Directive } from 'vue'
import type { LoadingOptions } from './types'
import { createLoading } from '@/components/NaLoading'

interface LoadingHTMLElement extends HTMLElement {
  instance?: ReturnType<typeof createLoading>
}

export const loading: Directive<LoadingHTMLElement, LoadingOptions> = {
  mounted(el, binding) {
    const { loading, tip = '加载中...', fullscreen = false, background = 'rgba(0, 0, 0, 0.08)' } = binding.value
    el.instance = createLoading(
      {
        tip,
        background,
        loading,
        absolute: !fullscreen,
      },
      fullscreen ? document.body : el,
    )
  },
  updated(el, binding) {
    const instance = el.instance
    if (!instance)
      return
    const { loading, tip = '加载中...', background } = binding.value
    instance.setTip(tip)
    if (binding.oldValue !== binding.value) {
      instance.setLoading?.(!!(loading && !instance.loading))
      instance.setBackground?.(background)
      instance.setTip?.(tip)
    }
  },
  unmounted(el) {
    el?.instance?.destroy()
  },
}
