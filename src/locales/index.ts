import type { App } from 'vue'
import type { I18n, I18nOptions } from 'vue-i18n'

import { createI18n } from 'vue-i18n'
import { localeSetting } from '@/config/locale'
import { useLocalesStoreWithOut } from '@/store/modules/locales-setting.ts'
import { setHtmlPageLang, setLoadLocalePool } from './helper'

const { fallback, availableLocales } = localeSetting

// eslint-disable-next-line import/no-mutable-exports
export let i18n: ReturnType<typeof createI18n>

async function getOptions(): Promise<I18nOptions> {
  const localeStore = useLocalesStoreWithOut()
  const locale = localeStore.getLocale
  const defaultLocal = await import(`./lang/${locale}.ts`)
  const message = defaultLocal.default?.message ?? {}
  setHtmlPageLang(locale)
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale)
  })

  return {
    legacy: false,
    locale,
    fallbackLocale: fallback,
    messages: {
      [locale]: message,
    },
    availableLocales,
    sync: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
  }
}

export async function setupI18n(app: App) {
  const options = await getOptions()
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  i18n = createI18n(options) as I18n
  app.use(i18n)
}
