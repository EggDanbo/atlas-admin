import { Icon } from '@iconify/vue'
import { NIcon } from 'naive-ui'
import { h } from 'vue'

// 开发模式下导入图标监察器
let recordIconUsage: ((icon: string, source: string) => void) | undefined
if (import.meta.env.DEV) {
  import('./iconTracker').then((module) => {
    recordIconUsage = module.recordIconUsage
  })
}

/**
 * 创建或渲染图标
 * @param icon 图标名称，支持 @iconify/vue 图标和本地 SVG 图标（以 'local:' 开头）
 * @param props 图标属性
 * @param shouldRender 是否返回渲染函数，默认为 false
 * @returns 如果 shouldRender 为 true，返回渲染函数；否则返回图标 VNode
 */
export function createIcon(icon?: string, props?: import('naive-ui').IconProps, shouldRender = true) {
  if (!icon)
    return

  // 开发模式监察（排除本地图标）
  if (import.meta.env.DEV && !icon.startsWith('local:') && recordIconUsage) {
    recordIconUsage(icon, 'createIcon')
  }

  const buildIcon = () => {
    const isLocal = icon.startsWith('local:')
    let innerIcon: any
    if (isLocal) {
      const svgName = icon.replace('local:', '')
      const svg = import.meta.glob('@/assets/svg-icons/*.svg', {
        query: '?raw',
        import: 'default',
        eager: true,
      })
      const target = svg[`/src/assets/svg-icons/${svgName}.svg`]
      innerIcon = h(NIcon, { ...props, innerHTML: target })
    }
    else {
      innerIcon = h(NIcon, props, { default: () => h(Icon, { icon }) })
    }
    return innerIcon
  }
  return shouldRender ? () => buildIcon() : buildIcon()
}
