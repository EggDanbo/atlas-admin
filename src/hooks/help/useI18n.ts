import type { Locale, TranslateOptions } from 'vue-i18n'
import { isString } from 'lodash-es'
import { i18n } from '@/locales'

interface I18nGlobalTranslation {
  (key: string): string
  (key: string, locale: Locale): string
  (key: string, locale: Locale, list: unknown[]): string
  (key: string, locale: Locale, named: Record<string, unknown>): string
  (key: string, list: unknown[]): string
  (key: string, named: Record<string, unknown>): string
  (key: string, named: Record<string, unknown>, options: TranslateOptions): string
}

function getKey(namespace: string | undefined, key: string) {
  if (!namespace) {
    return key
  }
  if (key.startsWith(namespace)) {
    return key
  }
  return `${namespace}.${key}`
}

export function useI18n(namespace?: string): {
  t: I18nGlobalTranslation
} {
  const normalFn = {
    t: (key: string) => {
      return getKey(namespace, key)
    },
  }

  if (!i18n) {
    return normalFn
  }

  const { t: globalT, ...methods } = i18n.global

  const tFn: I18nGlobalTranslation = ((key: string, ...args: any[]) => {
    if (!key)
      return ''
    if (!isString(key))
      return key
    if (!key.includes('.') && !namespace)
      return key

    // 通过类型断言解决调用问题
    return (globalT as (...args: any[]) => string)(getKey(namespace, key), ...args)
  }) as I18nGlobalTranslation

  return {
    ...methods,
    t: tFn,
  }
}

// 为全局t函数提供更完整的类型定义
export const t: I18nGlobalTranslation = (key: string) => {
  if (!key)
    return ''
  if (!isString(key))
    return key
  return key
}
