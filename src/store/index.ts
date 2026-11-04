import type { App } from 'vue'
import { createPinia, getActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useGlobSetting } from '@/hooks/setting'

const globSetting = useGlobSetting()

const store = createPinia()

/**
 * 所有 store ids
 */
const allStoreIds = [
  'theme-store',
  'language-store',
  'tabbar-store',
  'config-store',
  'user-store',
  'async-route-store',
]

/**
 * 初始化 store
 * @param app
 */
export function setupStore(app: App<Element>) {
  store.use(createPersistedState({
    storage: sessionStorage,
    key: id => `__${globSetting.shortName}__${id}`,
  }))
  app.use(store)
}

/**
 * 重置 store
 * @param options - 选项
 * @param options.storeIds 重置 StoreIds
 * @param options.excludeIds 排除 StoreIds
 */
export function resetStore(options?: { storeIds?: string[], excludeIds?: string[] }) {
  const storeIds = options?.storeIds || allStoreIds
  const excludeIds = options?.excludeIds || []
  const activePinia = getActivePinia()
  if (activePinia) {
    Object.entries(activePinia.state.value).forEach(([name]) => {
      if (!excludeIds.includes(name) && storeIds.includes(name)) {
        // 清除持久化存储
        const key = `__${globSetting.shortName}__${name}`
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key)
        }
        sessionStorage.removeItem(key)
      }
    })
  }
}

export { store }
