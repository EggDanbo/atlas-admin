import type { AccessToken } from '@/utils/token/types'
import { isObject } from 'lodash-es'
import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { TABS_ROUTES } from '@/config/common'
import {
  HOME_ROUTE_PATH,
  LOGIN_ROUTE_NAME,
} from '@/config/page.ts'
import { authorize, permit, profile } from '@/service/api/identity'
import { resetStore } from '@/store'
import { useAsyncRouteStore } from '@/store/modules/async-route'
import crypto from '@/utils/crypto'
import userNet from '@/utils/net/user'
import { storage } from '@/utils/storage'
import { tenantStorage } from '@/utils/tenant'
import token from '@/utils/token'

export const useUserStore = defineStore(
  'user-store',
  () => {
    const route = useRoute()
    const router = useRouter()
    const asyncRouteStore = useAsyncRouteStore()
    const loading = ref(false)
    const userInfo = ref<Auth.UserCurrent | null>(null)
    const userPermissions = ref<string[]>([])
    const allPermissions = ref<Auth.Permission[]>([])

    /**
     * 异步登录方法
     * @param params 登录参数，具体结构取决于login方法的期望参数
     */
    async function asyncLogin(params: Auth.PasswordTokenCommand) {
      try {
        loading.value = true
        const username = crypto.encrypt(params.username)
        const password = crypto.encrypt(params.password)

        const { isSuccess, data, message } = await authorize.tokenSafety({
          username,
          password,
          verifyToken: params.verifyToken,
        })
        if (!isSuccess)
          return { isSuccess: false, message }
        const { access_token, token_type, expires_in, refresh_token } = data
        token.set(
          {
            access_token,
            token_type,
            expires_in,
            refresh_token,
          },
          false,
        )
        const redirect = (route.query.redirect as string) ?? HOME_ROUTE_PATH

        if (route.name === LOGIN_ROUTE_NAME) {
          await router.replace('/').catch(() => {
            loading.value = false
          })
        }
        else {
          await router.replace(redirect).catch(() => {
            loading.value = false
          })
        }

        return { isSuccess, data, message }
      }
      finally {
        loading.value = false
      }
    }

    /**
     * 异步短信方法
     * @param params 登录参数，具体结构取决于login方法的期望参数
     */
    async function asyncLoginBySms(params: Auth.VerifyCodeTokenCommand) {
      try {
        loading.value = true

        const { isSuccess, data, message } = await authorize.sms(params)
        if (!isSuccess)
          return { isSuccess: false, message }
        const { access_token, token_type, expires_in, refresh_token } = data
        token.set(
          {
            access_token,
            token_type,
            expires_in,
            refresh_token,
          },
          false,
        )
        const redirect = (route.query.redirect as string) ?? HOME_ROUTE_PATH

        if (route.name === LOGIN_ROUTE_NAME) {
          await router.replace('/').catch(() => {
            loading.value = false
          })
        }
        else {
          await router.replace(redirect).catch(() => {
            loading.value = false
          })
        }

        return { isSuccess, data, message }
      }
      finally {
        loading.value = false
      }
    }

    /**
     * 异步获取用户信息并更新状态
     */
    async function asyncUserInfo() {
      try {
        const { isSuccess, data } = await profile.get()
        if (!isSuccess)
          return

        if (data && isObject(data)) {
          userInfo.value = {
            ...userInfo.value,
            ...data,
          }
        }
        return userInfo.value
      }
      catch (error) {
        console.error('获取用户信息失败:', error)
        return userInfo.value
      }
    }

    /**
     * 获取用户权限
     */
    async function asyncPermission(): Promise<string[]> {
      const { isSuccess, data } = await permit.get()
      if (isSuccess) {
        allPermissions.value = data
      }
      const res = await permit.currentUser()
      if (res.isSuccess) {
        userPermissions.value = res.data
      }
      return userPermissions.value
    }

    function logoutRedirect(redirect?: string) {
      // 重置全局配置信息
      // 重置主题配置信息
      const baseURL = (import.meta.env.VITE_PUBLIC_PATH as string) ?? '/'

      window.location.href = `${baseURL}login${redirect ? `?redirect=${redirect}` : ``}`
    }

    /**
     * 登出
     */
    async function logout() {
      const accessToken = token.get()
      if (accessToken) {
        try {
          await authorize.unToken(accessToken.refresh_token)
        }
        catch {

        }
      }

      userInfo.value = null
      token.remove()
      tenantStorage.remove()
      // 标记未添加路由
      asyncRouteStore.setIsAddRoute(false)
      // 移除标签页
      storage.remove(TABS_ROUTES)

      // 按需重置 Store
      resetStore({
        excludeIds: [
          'theme-store',
          'language-store',
          'config-store',
        ],
      })

      await userNet.stop()
    }

    /**
     * 企业微信扫码登录
     */
    async function asyncLoginByWw(accessToken: AccessToken) {
      try {
        loading.value = true
        token.set(accessToken, false)
        const redirect = (route.query.redirect as string) ?? HOME_ROUTE_PATH

        if (route.name === LOGIN_ROUTE_NAME) {
          await router.replace('/').catch(() => {
            loading.value = false
          })
        }
        else {
          await router.replace(redirect).catch(() => {
            loading.value = false
          })
        }
      }
      finally {
        loading.value = false
      }
    }

    // 超级管理员标识：演示环境不匹配任何账号，使演示账号走「全权限普通用户」视图
    const ADMIN_USER_ID = 'system-admin'
    const isAdmin = computed(() => userInfo.value?.userid === ADMIN_USER_ID)

    return {
      userInfo,
      userPermissions,
      allPermissions,
      asyncPermission,
      loginLoading: loading,
      asyncUserInfo,
      logout,
      asyncLogin,
      asyncLoginBySms,
      asyncLoginByWw,
      logoutRedirect,
      isAdmin,
    }
  },
  {
    persist: false,
  },
)
