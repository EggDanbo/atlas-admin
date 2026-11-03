import type { VNode } from 'vue'
import type { LoadingProps } from './typing'

import { createVNode, defineComponent, h, reactive, render } from 'vue'
import Loading from './Loading.vue'

export function createLoading(props?: Partial<LoadingProps>, target?: HTMLElement, wait = false) {
  let vm: Nullable<VNode> = null
  const data = reactive({
    tip: '',
    loading: true,
    background: '',
    ...props,
  })

  const LoadingWrap = defineComponent({
    render() {
      return h(Loading, { ...data })
    },
  })

  vm = createVNode(LoadingWrap)

  // 创建一个容器元素并渲染
  let container: Nullable<HTMLElement> = null
  if (wait) {
    setTimeout(() => {
      render(vm, (container = document.createElement('div')))
    }, 0)
  }
  else {
    render(vm, (container = document.createElement('div')))
  }

  function close() {
    if (vm?.el && vm.el.parentNode) {
      vm.el.parentNode.removeChild(vm.el)
    }
  }

  function open(target: HTMLElement = document.body) {
    if (!vm || !vm.el) {
      return
    }
    target.appendChild(vm.el as HTMLElement)
  }

  function destroy() {
    container && render(null, container)
    container = vm = null
  }

  if (target) {
    open(target)
  }

  return {
    vm,
    close,
    open,
    destroy,
    setTip: (tip: string) => {
      data.tip = tip
    },
    setLoading: (loading: boolean) => {
      data.loading = loading
    },
    setBackground: (color: string) => {
      data.background = color
    },
    get loading() {
      return data.loading
    },
    get background() {
      return data.background
    },
    get $el() {
      return vm?.el as HTMLElement
    },
  }
}
