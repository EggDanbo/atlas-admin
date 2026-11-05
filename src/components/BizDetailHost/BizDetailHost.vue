<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import { useRouter } from 'vue-router'
import bus from '@/utils/bus'
import toast from '@/utils/toast'

/** 业务详情弹窗宿主组件 - 监听 biz-detail:open 事件，懒加载对应详情组件 */
defineOptions({ name: 'BizDetailHost' })

/** 创建异步组件配置（统一错误处理） */
function createAsyncComponent(loader: () => Promise<any>) {
  return defineAsyncComponent({
    loader,
    onError: error => console.error('[BizDetailHost] 组件加载失败:', error),
  })
}

/** 业务组件映射表 */
const BIZ_DETAIL_MAP: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  organ_team: createAsyncComponent(() => import('@/views/access/unit/detail.vue')),
  organ_user: createAsyncComponent(() => import('@/views/access/member/detail.vue')),
  organ_outer: createAsyncComponent(() => import('@/views/access/partner/detail.vue')),
  paper_borrow: createAsyncComponent(() => import('@/views/archive/borrow/detail.vue')),
}

/**
 * 没有独立详情弹窗的业务类型，点开时跳到对应列表页。
 * 重建后的模块只保留列表与分析，不再为每种单据维护详情表单。
 */
const BIZ_ROUTE_FALLBACK: Record<string, string> = {
  asset_info: '/asset/ledger/list',
  asset_apply: '/asset/flow/list',
  asset_order: '/asset/flow/list',
  asset_batch: '/asset/flow/list',
  asset_allot: '/asset/flow/list',
  asset_lease: '/asset/flow/list',
  asset_resume: '/asset/flow/list',
  asset_disuse: '/asset/flow/list',
  asset_repair: '/asset/maintain/list',
  pense_apply: '/expense/claim/list',
  pense_borrow: '/expense/claim/list',
  pense_contract: '/expense/contract/list',
}

const router = useRouter()
const currentBiz = ref<string | null>(null)
const pendingOpen = ref<Recordable | null>(null)
const componentRef = ref<OpenModal | null>(null)

const currentComponent = computed(() => currentBiz.value ? BIZ_DETAIL_MAP[currentBiz.value] : null)

// 组件渲染完成后执行待打开操作
watch(componentRef, (newInstance) => {
  if (newInstance && pendingOpen.value) {
    newInstance.open(pendingOpen.value)
    pendingOpen.value = null
  }
}, { flush: 'post' })

interface BizDetailOpenOptions {
  biz_name: string
  biz_id: string
  [key: string]: unknown
}

function handleOpen(data: unknown) {
  const options = data as BizDetailOpenOptions
  const { biz_name, biz_id, ...rest } = options

  if (!BIZ_DETAIL_MAP[biz_name]) {
    const fallback = BIZ_ROUTE_FALLBACK[biz_name]
    if (fallback) {
      toast.info('该单据已并入列表页，正在跳转')
      router.push(fallback)
      return
    }
    toast.warning(`不支持的业务类型: ${biz_name}`)
    return
  }

  // 同一业务类型且组件已存在时直接打开
  if (currentBiz.value === biz_name && componentRef.value) {
    componentRef.value.open({ id: biz_id, ...rest })
    return
  }

  // 切换业务类型：重置引用，保存参数，等组件渲染后自动打开
  componentRef.value = null
  currentBiz.value = biz_name
  pendingOpen.value = { id: biz_id, ...rest }
}

bus.on('biz-detail:open', handleOpen)

onUnmounted(() => {
  bus.off('biz-detail:open', handleOpen)
})
</script>

<template>
  <component :is="currentComponent" v-if="currentComponent" ref="componentRef" />
</template>
