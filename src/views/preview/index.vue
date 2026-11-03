<script lang="ts" setup>
import officePreset from '@file-viewer/preset-office'
import { textRenderer } from '@file-viewer/renderer-text'
import { useTitle } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '@file-viewer/vue3/dist/file-viewer3.css'

const route = useRoute()

const url = computed(() => (route.query.url as string) ?? '')
const fileName = computed(() => (route.query.name as string) ?? '')
const errorMsg = ref('')

// ===== 预览来源安全开关 =====
/**
 * 放行全部
 */
const ALLOW_ALL_PREVIEW = true
/**
 * 放行同源预览：true 时允许加载与当前页「同域名或同 IP」的文件 URL（端口可不同）。
 * 收紧安全时改为 false，届时仅放行 ALLOWED_PREVIEW_HOSTS 中列出的源。
 */
const ALLOW_SAME_HOST_PREVIEW = true
/**
 * 预览源白名单：补充允许的跨域域名/IP（端口可不同）。
 * ALLOW_SAME_HOST_PREVIEW=false 时只有此处的源会被放行。
 */
const ALLOWED_PREVIEW_HOSTS: string[] = []

/** 仅允许同域名/同 IP（端口可不同）或白名单内的来源，阻止任意 URL 被代理渲染 */
function isPreviewUrlAllowed(rawUrl: string): boolean {
  if (!rawUrl)
    return false
  if (ALLOW_ALL_PREVIEW)
    return true
  try {
    const { hostname } = new URL(rawUrl, window.location.href)
    if (ALLOW_SAME_HOST_PREVIEW && hostname === window.location.hostname)
      return true
    return ALLOWED_PREVIEW_HOSTS.includes(hostname)
  }
  catch {
    return false
  }
}

const allowed = computed(() => isPreviewUrlAllowed(url.value))
/** 阻断原因：未传 url / 来源不允许；与 errorMsg 互斥（errorMsg 仅在渲染失败后置位） */
const blockReason = computed(() => {
  if (!url.value)
    return '未指定预览文件'
  if (!allowed.value)
    return '不支持预览该来源的文件'
  return ''
})

useTitle(() => fileName.value ? `${fileName.value} - 文件预览` : '文件预览')

const ASSET_BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

// file-viewer 选项：办公文档(preset) + 文本/Markdown/代码(renderer)，工具栏含下载与打印
const viewerOptions = {
  preset: officePreset,
  renderers: [textRenderer],
  rendererMode: 'replace',
  theme: 'light',
  fit: 'actual',
  toolbar: {
    position: 'top-center',
    download: true,
    print: true,
    exportHtml: false,
  },
  pdf: {
    workerUrl: `${ASSET_BASE}/vendor/pdf/pdf.worker.mjs`,
    cMapUrl: `${ASSET_BASE}/vendor/pdf/cmaps/`,
    wasmUrl: `${ASSET_BASE}/vendor/pdf/wasm/`,
    standardFontDataUrl: `${ASSET_BASE}/vendor/pdf/standard_fonts/`,
  },
  docx: {
    workerUrl: `${ASSET_BASE}/vendor/docx/docx.worker.js`,
    workerJsZipUrl: `${ASSET_BASE}/vendor/docx/jszip.min.js`,
  },
  presentation: { workerUrl: `${ASSET_BASE}/vendor/pptx/pptx.worker.js` },
  spreadsheet: { workerUrl: `${ASSET_BASE}/vendor/xlsx/sheet.worker.js` },
}

// ===== 加载失败侦测 =====
// @file-viewer/vue3 3.x 组件没有对外错误事件（emits 仅 load/zoom/search 等状态类），
// 加载中/失败时只渲染内置的 Shadow DOM 状态面板（part 命名是官方文档承诺的稳定接口）。
// 侦测到 error-state 面板后切换到页面错误卡片，为用户提供下载出口。
const pageEl = ref<HTMLElement>()
let errorObserver: MutationObserver | null = null

function stopViewerErrorObserver() {
  errorObserver?.disconnect()
  errorObserver = null
}

function observeViewerErrors() {
  stopViewerErrorObserver()
  const shadowRoot = pageEl.value?.querySelector('.file-viewer')?.shadowRoot
  if (!shadowRoot)
    return
  errorObserver = new MutationObserver(() => {
    if (shadowRoot.querySelector('[part~="error-state"]')) {
      stopViewerErrorObserver()
      errorMsg.value = '文件预览失败，请下载后查看'
    }
  })
  errorObserver.observe(shadowRoot, { childList: true, subtree: true })
}

onMounted(observeViewerErrors)

// url 变化时组件复用（同路由不同 query）：清掉错误态并重新侦测新一次加载
watch(url, async () => {
  errorMsg.value = ''
  await nextTick()
  observeViewerErrors()
})

onBeforeUnmount(stopViewerErrorObserver)
</script>

<template>
  <div ref="pageEl" class="file-viewer-page">
    <div v-if="blockReason || errorMsg" class="file-viewer-error">
      <n-icon size="48">
        <Icon icon="ant-design:file-unknown-outlined" />
      </n-icon>
      <p>{{ errorMsg || blockReason }}</p>
      <n-button
        v-if="url && allowed"
        tag="a"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        type="primary"
      >
        下载文件
      </n-button>
    </div>
    <file-viewer
      v-else
      :url="url"
      :options="viewerOptions"
    />
  </div>
</template>

<style lang="less" scoped>
.file-viewer-page {
  width: 100vw;
  height: 100vh;
}

.file-viewer-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
}
</style>
