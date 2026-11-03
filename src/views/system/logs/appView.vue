<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { logApp as api } from '@/service/api/system'
import { downloadByData } from '@/utils/file/download'

const formModel = reactive<Recordable>({})

const defaultTab = ref('应用日志')

const modalRef = ref<ModalInst | null>(null)

function handleExport({ done }) {
  const b = new Blob([JSON.stringify(formModel, null, 4)], { type: 'application/json' })
  downloadByData(b, `应用日志-${formModel.id}.json`, 'application/json')
  done(false)
}

function renderLevel(level: number) {
  switch (level) {
    case 1: return 'Debug'
    case 2: return 'Information'
    case 3: return 'Warning'
    case 4: return 'Error'
    case 5: return 'Fatal'
    default: return 'Verbose'
  }
}

const exposed: OpenModal = {
  open: async (args?: any) => {
    defaultTab.value = '应用日志'
    const { isSuccess, data } = await api.detail(args.id)
    if (!isSuccess)
      return
    Object.assign(formModel, data)
    // 解析 content 中的 exinfo
    if (formModel.content) {
      try {
        const j = JSON.parse(formModel.content)
        formModel.exinfo = j.exinfo
        delete j.exinfo
        formModel.content = JSON.stringify(j, null, 4)
      }
      catch {
        // 解析失败则保持原样
      }
    }
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="900" height="680" title="详细信息" ok-text="导出" @ok="handleExport">
    <n-tabs v-model:value="defaultTab" type="line">
      <n-tab-pane name="应用日志" tab="应用日志">
        <div class="h-120 overflow-auto p-1">
          <n-descriptions label-placement="left" bordered :column="1">
            <n-descriptions-item label="发生时间">
              {{ formModel.time }}
            </n-descriptions-item>
            <n-descriptions-item label="应用名称">
              {{ formModel.appname }}
            </n-descriptions-item>
            <n-descriptions-item label="日志等级">
              {{ renderLevel(formModel.level) }}
            </n-descriptions-item>
            <n-descriptions-item label="进程地址">
              {{ formModel.progress }}
            </n-descriptions-item>
            <n-descriptions-item label="Host主机">
              {{ formModel.hostname }}
            </n-descriptions-item>
            <n-descriptions-item label="类型">
              {{ formModel.type }}
            </n-descriptions-item>
            <n-descriptions-item label="源">
              {{ formModel.source }}
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </n-tab-pane>
      <n-tab-pane name="消息内容" tab="消息内容">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.message" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="异常信息" tab="异常信息">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.exinfo" language="json" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="详细内容" tab="详细内容">
        <div class="h-120 overflow-auto">
          <n-code :code="formModel.content" language="json" />
        </div>
      </n-tab-pane>
    </n-tabs>
  </SpModal>
</template>
