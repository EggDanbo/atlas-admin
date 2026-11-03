import { isObject } from 'lodash-es'
import { defineStore } from 'pinia'

import { useGlobSetting } from '@/hooks/setting'
import { common } from '@/service/api/misc'
import { store } from '@/store'

const setting = useGlobSetting()

export const useAppInfoStore = defineStore(
  'appinfo-store',
  () => {
    const appInfo = ref<AppInfo | null>(null)

    /**
     * 异步记载应用信息
     */
    async function asyncAppInfo() {
      try {
        const { isSuccess, data } = await common.appinfo()
        if (!isSuccess)
          return

        if (data && isObject(data)) {
          appInfo.value = {
            ...appInfo.value,
            ...data,
          }
        }

        if (!appInfo.value?.appname)
          appInfo.value!.appname = setting.title
        return appInfo.value
      }
      catch (error) {
        console.error('获取应用信息失败:', error)
        return appInfo.value
      }
    }

    const appname = computed(() => appInfo.value?.appname)
    const logincaptcha = computed(() => appInfo.value?.logincaptcha)
    const version = computed(() => appInfo.value?.version)

    return {
      appInfo,
      asyncAppInfo,
      appname,
      logincaptcha,
      version,
    }
  },
  {
    persist: false,
  },
)

export function useAppInfoStoreWithOut() {
  return useAppInfoStore(store)
}
