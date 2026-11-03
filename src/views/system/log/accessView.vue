<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'

import { logAccess as api } from '@/service/api/system'
import { downloadByData } from '@/utils/file/download'

const formModel = reactive<Recordable>({})

const defaultTab = ref('来源信息')

const modalRef = ref<ModalInst | null>(null)

function handleExport({ done }) {
  const b = new Blob([JSON.stringify(formModel, null, 4)], { type: 'application/json' })
  downloadByData(b, `来访日志-${formModel.id}.json`, 'applicaion/json')
  done(false)
}

const exposed: OpenModal = {
  open: async (args?: any) => {
    defaultTab.value = '来源信息' // 控制Tabs默认第一个显示
    const { isSuccess, data } = await api.detail(args.id)
    if (!isSuccess)
      return
    Object.assign(formModel, data)
    formModel.httpheadersStr = JSON.stringify(data.httpheaders, null, 4)
    formModel.httpqueryStr = JSON.stringify(data.httpquery, null, 4)
    formModel.httpformStr = JSON.stringify(data.httpform, null, 4)
    try {
      const rbody = JSON.parse(formModel.httprequestbody)
      formModel.httprequestbody = JSON.stringify(rbody, null, 4)
    }
    catch {
    }
    try {
      const pbody = JSON.parse(formModel.httpresponsebody)
      formModel.httpresponsebody = JSON.stringify(pbody, null, 4)
    }
    catch {
    }
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="900" height="680" title="详细信息" ok-text="导出" @ok="handleExport">
    <n-tabs v-model:value="defaultTab" type="line">
      <n-tab-pane name="来源信息" tab="来源信息">
        <div class="h-120 overflow-auto p-1">
          <n-descriptions label-placement="left" bordered :column="1">
            <n-descriptions-item label="访问时间">
              {{ formModel.requesttime }} 耗时{{ formModel.elapsedtime }}ms
            </n-descriptions-item>
            <n-descriptions-item label="主机头">
              {{ formModel.host }}
            </n-descriptions-item>
            <n-descriptions-item label="基础地址">
              {{ formModel.requestpathbase }}
            </n-descriptions-item>
            <n-descriptions-item label="请求地址">
              {{ formModel.requestpath }}
            </n-descriptions-item>
            <n-descriptions-item label="来源地址">
              {{ formModel.urlreferrer }}
            </n-descriptions-item>
            <n-descriptions-item label="路由地址">
              {{ formModel.routeendpoint }}
            </n-descriptions-item>
            <n-descriptions-item label="状态码">
              {{ formModel.httpstatuscode }}
            </n-descriptions-item>
            <n-descriptions-item label="请求长度">
              {{ formModel.requestcontentlength }}
            </n-descriptions-item>
            <n-descriptions-item label="响应长度">
              {{ formModel.responsecontentlength }}
            </n-descriptions-item>
            <n-descriptions-item label="请求类型">
              {{ formModel.requestcontenttype }}
            </n-descriptions-item>
            <n-descriptions-item label="响应类型">
              {{ formModel.responsecontenttype }}
            </n-descriptions-item>
            <n-descriptions-item label="IP地址">
              {{ formModel.ip }}
            </n-descriptions-item>
            <!-- <n-descriptions-item label="IP归属地">{{ formModel.ipgeo }}</n-descriptions-item> -->
            <n-descriptions-item label="宿主机">
              {{ formModel.hostname }}
            </n-descriptions-item>
            <n-descriptions-item label="UserAgent">
              {{ formModel.useragent }}
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </n-tab-pane>
      <n-tab-pane name="用户信息" tab="用户信息">
        <div class="h-120 overflow-auto">
          <n-descriptions label-placement="left" bordered :column="1">
            <n-descriptions-item v-for="(item, k) in formModel.userinfo" :key="k" :label="`${k}`">
              {{ item }}
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </n-tab-pane>
      <n-tab-pane name="请求头" tab="请求头">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.httpheadersStr" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Body" tab="Body">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.httprequestbody" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Query" tab="Query">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.httpqueryStr" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Form" tab="Form">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.httpformStr" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="响应内容" tab="响应内容">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.httpresponsebody" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="异常信息" tab="异常信息">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.exceptiondetail" language="json" />
        </div>
      </n-tab-pane>
    </n-tabs>
  </SpModal>
</template>
