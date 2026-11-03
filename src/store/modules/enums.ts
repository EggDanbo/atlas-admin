import { isObject } from 'lodash-es'
import { defineStore } from 'pinia'

import { common } from '@/service/api/misc'
import { store } from '@/store'

/**
 * Naive UI Select 选项类型
 */
export type SelectOption = Required<DropDownItem>

/**
 * 枚举查找模式
 */
export type EnumMatchBy = 'value' | 'name' | 'label'

/**
 * 枚举选项取值字段
 */
export type EnumValueField = EnumMatchBy

/**
 * 规范化枚举取值字段：空或非法值回落 'value'
 */
export function normalizeEnumsType(field?: string | null): EnumValueField {
  return field === 'label' || field === 'name' ? field : 'value'
}

/**
 * 枚举 Store - 管理后端枚举数据
 *
 * 所有 get 方法都会自动触发加载，无需手动调用 asyncEnums
 *
 * @example
 * ```ts
 * // 基础使用 - 无感自动加载
 * const enumStore = useEnumStore()
 *
 * // 1. 获取枚举对象（首次调用自动加载）
 * const statusEnum = enumStore.getEnum('UserStatus')
 *
 * // 2. 获取 NSelect 选项
 * const options = enumStore.getEnumOptions('UserStatus')
 * // <n-select :options="options" />
 *
 * // 3. 根据 value 查询 label
 * const label = enumStore.getLabel('UserStatus', '1')
 *
 * // 4. 根据 name 查询 label
 * const label2 = enumStore.getLabel('UserStatus', 'active', 'name')
 * ```
 */
export const useEnumStore = defineStore(
  'enums-store',
  () => {
    /** 枚举数据 Map */
    const enumsMap = ref<Map<string, SystemEnums> | null>(null)
    /** 错误信息 */
    const error = ref<Error | null>(null)
    /** 加载 Promise 缓存（防止并发请求） */
    const loadPromise = ref<Promise<Map<string, SystemEnums>> | null>(null)
    /** 选项缓存 */
    const optionsCache = ref<Map<string, SelectOption[]>>(new Map())

    /** 是否正在加载 */
    const isLoading = computed(() => loadPromise.value !== null)
    /** 是否已加载 */
    const isLoaded = computed(() => enumsMap.value !== null)

    /**
     * 异步加载枚举数据
     * 首次访问时调用，刷新页面后需重新加载
     */
    async function asyncEnums(): Promise<Map<string, SystemEnums>> {
      // 已加载则直接返回
      if (enumsMap.value)
        return enumsMap.value

      // 如果正在加载，返回同一个 Promise（防止并发请求）
      if (loadPromise.value)
        return loadPromise.value

      // 创建并缓存加载 Promise
      loadPromise.value = performLoad()
      return loadPromise.value
    }

    /** 执行实际的加载逻辑 */
    async function performLoad(): Promise<Map<string, SystemEnums>> {
      try {
        error.value = null

        const { isSuccess, data } = await common.enums()
        if (!isSuccess || !data || !isObject(data)) {
          console.error('获取枚举数据失败：响应数据无效')
          return new Map()
        }

        // 加载成功后清除选项缓存
        optionsCache.value.clear()

        enumsMap.value = new Map(Object.entries(data))
        return enumsMap.value
      }
      catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        error.value = errorObj
        console.error('获取枚举数据失败:', errorObj)
        return new Map()
      }
      finally {
        loadPromise.value = null
      }
    }

    /**
     * 重试加载
     */
    async function retry(): Promise<Map<string, SystemEnums>> {
      enumsMap.value = null
      optionsCache.value.clear()
      return asyncEnums()
    }

    /**
     * 确保枚举已加载
     * 内部辅助方法，自动加载未加载的枚举数据
     */
    async function ensureLoaded(): Promise<Map<string, SystemEnums>> {
      if (!enumsMap.value) {
        return await asyncEnums()
      }
      return enumsMap.value
    }

    /**
     * 等待指定枚举加载完成
     * @param key - 枚举键名
     * @returns 枚举对象或 undefined
     */
    async function awaitEnum(key: string): Promise<SystemEnums | undefined> {
      await ensureLoaded()
      return enumsMap.value?.get(key)
    }

    /**
     * 获取枚举对象（同步）
     * 注意：首次调用时如果数据未加载，会返回 undefined
     * 如需确保数据已加载，请使用 awaitEnum()
     *
     * @param key - 枚举键名
     * @returns 枚举对象或 undefined
     *
     * @example
     * ```ts
     * const statusEnum = enumStore.getEnum('UserStatus')
     * console.log(statusEnum?.name) // "用户状态"
     * console.log(statusEnum?.items) // [{ name: 'active', label: '激活', value: '1' }]
     * ```
     */
    function getEnum(key: string): SystemEnums | undefined {
      // 触发自动加载（不等待）
      if (!enumsMap.value && !loadPromise.value) {
        void asyncEnums()
      }

      const result = enumsMap.value?.get(key)

      // 开发环境下警告无效键
      if (import.meta.env.DEV && enumsMap.value && !result) {
        console.warn(`[EnumStore] 枚举键 "${key}" 不存在`)
      }

      return result
    }

    /**
     * 获取枚举的所有键名
     * @returns 枚举键名数组
     */
    function getEnumKeys(): string[] {
      if (!enumsMap.value && !loadPromise.value) {
        void asyncEnums()
      }
      return enumsMap.value ? Array.from(enumsMap.value.keys()) : []
    }

    /**
     * 获取枚举选项（用于 NSelect 等组件）
     * @param key - 枚举键名
     * @param valueField - 选项取值字段，默认 'value'
     * @returns 选项数组 [{ label, value }]
     *
     * @example
     * ```vue
     * <template>
     *   <n-select :options="enumStore.getEnumOptions('UserStatus')" />
     * </template>
     * ```
     */
    function getEnumOptions(key: string, valueField: EnumValueField = 'value'): SelectOption[] {
      if (!enumsMap.value && !loadPromise.value) {
        void asyncEnums()
      }

      // 检查缓存（缓存键包含取值字段，避免不同模式互串）
      const cacheKey = `${key}@${valueField}`
      if (optionsCache.value.has(cacheKey)) {
        return optionsCache.value.get(cacheKey)!
      }

      const enumData = enumsMap.value?.get(key)
      if (!enumData?.items)
        return []

      const options = enumData.items.map(item => ({
        label: item.label,
        value: item[valueField],
      }))

      // 缓存结果
      optionsCache.value.set(cacheKey, options)

      return options
    }

    /**
     * 根据值、名称或标签查询标签
     * @param key - 枚举键名
     * @param matchValue - 匹配的值（value、name 或 label）
     * @param matchBy - 匹配方式，默认 'value'
     * @returns 标签文本，值为空返回空字符串，枚举不存在或未匹配返回原值
     *
     * @example
     * ```ts
     * // 根据 value 查询
     * getLabel('UserStatus', '1') // "激活"
     * getLabel('UserStatus', '1', 'value') // "激活"
     *
     * // 根据 name 查询
     * getLabel('UserStatus', 'active', 'name') // "激活"
     * ```
     */
    function getLabel(key: string, matchValue: string | number | null, matchBy: EnumMatchBy = 'value'): string {
      if (matchValue == null)
        return ''
      const enumData = getEnum(key)
      if (!enumData?.items)
        return matchValue.toString()

      const strVal = matchValue.toString()
      const item = enumData.items.find(item => item[matchBy] === strVal)
      return item?.label ?? ''
    }

    /**
     * 根据 value 或 name 查找完整的枚举项
     * @param key - 枚举键名
     * @param matchValue - 匹配的值（value 或 name）
     * @param matchBy - 匹配方式，默认 'value'
     * @returns 枚举项或 undefined
     */
    function getItem(key: string, matchValue: string | number | null, matchBy: EnumMatchBy = 'value'): SystemEnumItem | undefined {
      if (matchValue == null)
        return undefined
      const enumData = getEnum(key)
      if (!enumData?.items)
        return undefined
      const strVal = matchValue.toString()
      return enumData.items.find(item => item[matchBy] === strVal)
    }

    /**
     * 根据 value 查找完整的枚举项
     * @param key - 枚举键名
     * @param value - 枚举值
     * @returns 枚举项或 undefined
     */
    function getItemByValue(key: string, value: string | number): SystemEnumItem | undefined {
      return getItem(key, value, 'value')
    }

    /**
     * 根据 name 查找完整的枚举项
     * @param key - 枚举键名
     * @param name - 枚举名称
     * @returns 枚举项或 undefined
     */
    function getItemByName(key: string, name: string): SystemEnumItem | undefined {
      return getItem(key, name, 'name')
    }

    /**
     * 重置 store（清空枚举数据）
     */
    function resetStore(): void {
      enumsMap.value = null
      error.value = null
      loadPromise.value = null
      optionsCache.value.clear()
    }

    return {
      enumsMap,
      isLoading,
      error,
      isLoaded,
      asyncEnums,
      ensureLoaded,
      awaitEnum,
      retry,
      getEnum,
      getEnumKeys,
      getEnumOptions,
      getLabel,
      getItem,
      getItemByValue,
      getItemByName,
      resetStore,
    }
  },
  {
    // 非持久化，每次刷新重新加载
    persist: false,
  },
)

/**
 * 在组件外使用的 store hook
 */
export function useEnumStoreWithOut() {
  return useEnumStore(store)
}
