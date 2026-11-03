<script lang="ts" setup>
import type { AccessToken } from '@/utils/token/types'
import { createWWLoginPanel, WWLoginPanelSizeType, WWLoginRedirectType, WWLoginType } from '@wecom/jssdk'
import wechatwork from '@/service/api/identity/wechatwork'
import { useUserStore } from '@/store/modules/user'
import toast from '@/utils/toast'

const userStore = useUserStore()

onMounted(async () => {
  try {
    const { isSuccess, data } = await wechatwork.getApp()
    if (!isSuccess)
      return

    const appid = data.appid ?? ''
    const agentid = data.agentid ?? undefined
    const { protocol, host } = window.location
    const baseURL = import.meta.env.VITE_PUBLIC_PATH as string
    const redirectUri = `${protocol}//${host}${baseURL}authorize/WorkQrcodeConnect`

    createWWLoginPanel({
      el: '#ww_login',
      params: {
        login_type: WWLoginType.corpApp,
        appid,
        agentid,
        redirect_uri: redirectUri,
        state: 'loginState',
        redirect_type: WWLoginRedirectType.callback,
        panel_size: WWLoginPanelSizeType.middle,
      },
      onCheckWeComLogin({ isWeComLogin }) {
        console.log('企业微信桌面端登录状态:', isWeComLogin)
      },
      async onLoginSuccess({ code }) {
        const stateRes = await wechatwork.getState()
        const res = await wechatwork.token({ code, state: stateRes.data })
        if (!res.isSuccess) {
          toast.info(res.message)
          return
        }
        const { access_token, token_type, expires_in, refresh_token, key } = res.data as AccessToken & { key?: string }
        if (key) {
          toast.info('请先在企业微信 App 中完成认证后再扫码登录')
          return
        }
        toast.success('登录成功，即将进入系统')
        await userStore.asyncLoginByWw({ access_token, token_type, expires_in, refresh_token } as AccessToken)
      },
      onLoginFail(err) {
        if (import.meta.env.DEV) {
          toast.info('当前环境不支持企业微信扫码登录')
        }
        else {
          toast.error(err.errMsg ?? '扫码登录失败')
        }
      },
    })
  }
  catch {
    toast.error('获取企业微信应用信息失败')
  }
})
</script>

<template>
  <div class="mb-4 flex justify-center pt-1">
    <div id="ww_login" class="w-65 flex items-center justify-center" :style="{ minHeight: '380px' }" />
  </div>
</template>
