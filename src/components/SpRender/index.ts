import { isFunction } from 'lodash-es'
import { h } from 'vue'
import { useI18n } from '@/hooks/help/useI18n'

export function getRender(value): any {
  const { t } = useI18n()
  return isFunction(value) ? value() : h('span', {}, { default: () => t(value) })
}

export { default as SpRender } from './src/SpRender.vue'
