<script lang="ts" setup>
import type { OptionsType, PrintInst } from './types'

import { computed, ref } from 'vue'

import { SpModal, useModal } from '@/components/SpModal'
import { usePdfSetting } from './hooks/usePdfSetting'
import { basicProps } from './props'

const props = defineProps({ ...basicProps })

const loading = ref(false)

const pdfSetting = usePdfSetting()
const { formModel, pagesModel } = pdfSetting

const [modalRegister, pdfSettingModal] = useModal()

const MODAL_HEIGHT = 388

const options = ref<OptionsType | null>(null)

const getPages = computed(() => {
  const arr = [
    {
      label: '用户自定义',
      value: 'UserDefine',
    },
  ]
  for (const item of pagesModel.value) {
    arr.push({ label: item.name, value: item.name })
  }
  return arr
})

async function show(params: OptionsType) {
  options.value = params
  await pdfSetting.loadPages()
  await pdfSetting.bind(params.name)
  if (params.direct && params.callback) {
    await params.callback(formModel, preview)
  }
  else if (!params.direct) {
    pdfSettingModal.setProps({ title: params.title || '打印设置', mask: props.mask })
    pdfSettingModal.open()
  }
}

/** 通用操作处理 */
async function handleAction(handler: (url: string) => void) {
  if (!options.value)
    return
  loading.value = true
  try {
    await pdfSetting.save()
    await options.value.callback(formModel, handler)
  }
  finally {
    loading.value = false
  }
}

function handlePreview() {
  handleAction(preview)
}

function handleDownload() {
  handleAction(download)
}

function preview(url: string) {
  if (url)
    pdfSetting.preview(url)
}

function download(url: string) {
  if (url)
    location.href = url
}

function close() {
  pdfSettingModal.close()
}

function handlePageChange(name: string) {
  const item = pagesModel.value.find(q => q.name === name)
  if (item) {
    formModel.paper_width = item.width
    formModel.paper_height = item.height
  }
}

const exposed: PrintInst = {
  close,
  show,
}

defineExpose(exposed)
</script>

<template>
  <SpModal width="500" :height="MODAL_HEIGHT" @register="modalRegister">
    <template #default>
      <n-form label-placement="left" require-mark-placement="left" :label-width="70">
        <n-grid :cols="24" responsive="screen" :collapsed-rows="1">
          <n-form-item-gi :span="19" label="纸张" path="paper_type">
            <n-select
              v-model:value="formModel.paper_type"
              filterable
              :options="getPages"
              @update:value="handlePageChange"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="5" label=" " :label-width="20" path="paper_direction">
            <n-switch v-model:value="formModel.paper_direction">
              <template #checked>
                横向
              </template>
              <template #unchecked>
                纵向
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="宽" path="paper_width">
            <n-input-number
              v-model:value="formModel.paper_width"
              :min="0"
              :show-button="false"
              :disabled="formModel.paper_type !== 'UserDefine'"
            >
              <template #suffix>
                毫米
              </template>
            </n-input-number>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="高" path="paper_height">
            <n-input-number
              v-model:value="formModel.paper_height"
              :min="0"
              :show-button="false"
              :disabled="formModel.paper_type !== 'UserDefine'"
            >
              <template #suffix>
                毫米
              </template>
            </n-input-number>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="双页打印" path="double_printed">
            <n-switch v-model:value="formModel.double_printed">
              <template #checked>
                是
              </template>
              <template #unchecked>
                否
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="装订线宽" path="double_printed_left">
            <n-input-number
              v-model:value="formModel.double_printed_left"
              :disabled="!formModel.double_printed"
              :min="0"
              :show-button="false"
            >
              <template #suffix>
                毫米
              </template>
            </n-input-number>
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="自动编号" path="group_seq">
            <n-switch v-model:value="formModel.group_seq">
              <template #checked>
                是
              </template>
              <template #unchecked>
                否
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="起始页码" :label-width="76" path="page_start">
            <n-input-number
              v-model:value="formModel.page_start"
              :disabled="formModel.group_seq"
              :min="1"
              :show-button="false"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="每页列数" :label-width="90" path="columns">
            <n-input-number
              v-model:value="formModel.columns"
              :precision="0"
              :min="0"
              :show-button="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </template>
    <template #footer>
      <n-flex justify="end">
        <n-button :disabled="loading" :loading="loading" type="primary" @click="handlePreview">
          预览
        </n-button>
        <n-button :disabled="loading" :loading="loading" type="primary" @click="handleDownload">
          下载
        </n-button>
        <n-button @click="close()">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
