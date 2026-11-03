<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

import { ref } from 'vue'
import { PrismEditor } from 'vue-prism-editor'
import dataformat from '@/service/api/dataformat'
import toast from '@/utils/toast'

// 注册 JSON 语言
hljs.registerLanguage('json', json)

const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)
const readonly = ref(true)
const formModel = ref<{ id?: string, data?: string }>({})

function highlighter(code: string) {
  const res = hljs.highlight(code, { language: 'json' })
  return res.value
}

async function open(params: { user_id: string, name: string }) {
  readonly.value = true
  const { isSuccess, data } = await dataformat.getUserGrid(params.user_id, params.name)
  if (!isSuccess)
    return
  // 美化 JSON
  data.data = JSON.stringify(JSON.parse(data.data), null, 2)
  formModel.value = data
  modalRef.value?.open()
}

function toggleEdit() {
  readonly.value = !readonly.value
}

async function handleSubmit() {
  try {
    const data = JSON.parse(formModel.value.data!)
    btnLoading.value = true
    const { isSuccess } = await dataformat.updateUserGrid({ id: formModel.value.id, data })
    btnLoading.value = false
    if (!isSuccess)
      return
    toast.success('保存成功')
    readonly.value = true
    modalRef.value?.close()
  }
  catch {
    toast.error('JSON 格式错误')
  }
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'SystemUserGridView' }
</script>

<template>
  <SpModal ref="modalRef" width="900" height="600" title="详细信息">
    <PrismEditor
      v-model="formModel.data!"
      class="my-editor"
      :class="{ 'is-readonly': readonly }"
      :highlight="highlighter"
      :readonly="readonly"
      line-numbers
    />

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="readonly" type="primary" @click="toggleEdit">
          编辑
        </n-button>
        <n-button v-else @click="toggleEdit">
          取消编辑
        </n-button>
        <n-button
          v-if="!readonly"
          type="primary"
          :loading="btnLoading"
          @click="handleSubmit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
.my-editor {
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Fira Code', 'Fira Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 12px;
  height: 100%;
  overflow: auto;

  &.is-readonly {
    cursor: default;
  }
}

// 滚动条样式
:deep(.prism-editor__container) {
  height: 100% !important;
}

:deep(.prism-editor__textarea) {
  height: 100% !important;
}

:deep(.prism-editor__editor) {
  height: 100% !important;
  overflow-y: auto;
}
</style>
