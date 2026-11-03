/**
 * 全局注册自定义组件
 * @param app
 */
import type { App } from 'vue'
import { Icon } from '@iconify/vue'
import { NaAuthority } from '@/components/NaAuthority'
import { NaIcon } from '@/components/NaIcon'
import { NaPage } from '@/components/NaPage'
import { SpModal } from '@/components/SpModal'
import { SpSearch } from '@/components/SpSearch'
import { SpSliderCaptcha } from '@/components/SpSliderCaptcha'
import { SpTable } from '@/components/SpTable'

export function setupGlobalComponent(app: App) {
  app.component('NaPage', NaPage)
  app.component('NaAuthority', NaAuthority)
  app.component('NaIcon', NaIcon)
  app.component('Icon', Icon)
  app.component('SpTable', SpTable)
  app.component('SpModal', SpModal)
  app.component('SpSearch', SpSearch)
  app.component('SpSliderCaptcha', SpSliderCaptcha)
}
