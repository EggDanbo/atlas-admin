import { storage } from '@/utils/storage'

const TENANT_KEY = 'FILTER_TENANT'

export const tenantStorage = {
  get: () => storage.get(TENANT_KEY) as string | null,
  set: (value: string) => storage.set(TENANT_KEY, value),
  remove: () => storage.remove(TENANT_KEY),
}
