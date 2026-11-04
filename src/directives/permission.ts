import type { ObjectDirective } from 'vue'
import { usePermission } from '@/hooks/permission/usePermission'

export const permission: ObjectDirective = {
  mounted(el: HTMLButtonElement, binding) {
    if (binding.value === undefined)
      return
    const { action, effect } = binding.value
    const { hasPermission } = usePermission()
    if (!hasPermission(action)) {
      if (effect === 'disabled') {
        el.disabled = true
        el.classList.add('n-button--disabled')
      }
      else {
        el.remove()
      }
    }
  },
}

export const perm: ObjectDirective = {
  mounted(el: HTMLButtonElement, binding) {
    if (binding.value === undefined)
      return
    const perms = binding.value
    const { hasPermission } = usePermission()
    if (!hasPermission(perms)) {
      el.disabled = true
      el.classList.add('n-button--disabled')
      // el.style['disabled'] = 'disabled'
    }
  },
}

export const permHide: ObjectDirective = {
  mounted(el: HTMLButtonElement, binding) {
    if (binding.value === undefined)
      return
    const perms = binding.value
    const { hasPermission } = usePermission()
    if (!hasPermission(perms)) {
      el.remove()
    }
  },
}
