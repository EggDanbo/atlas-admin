<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
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
  asset_info: createAsyncComponent(() => import('@/views/asset/info/detail.vue')),
  asset_apply: createAsyncComponent(() => import('@/views/asset/apply/detail.vue')),
  asset_order: createAsyncComponent(() => import('@/views/asset/order/detail.vue')),
  asset_batch: createAsyncComponent(() => import('@/views/asset/batch/detail.vue')),
  asset_allot: createAsyncComponent(() => import('@/views/asset/allot/detail.vue')),
  asset_lease: createAsyncComponent(() => import('@/views/asset/lease/detail.vue')),
  asset_resume: createAsyncComponent(() => import('@/views/asset/resume/detail.vue')),
  asset_disuse: createAsyncComponent(() => import('@/views/asset/disuse/detail.vue')),
  asset_repair: createAsyncComponent(() => import('@/views/asset/repair/detail.vue')),
  pense_contract: createAsyncComponent(() => import('@/views/expense/contract/detail.vue')),
  pense_order: createAsyncComponent(() => import('@/views/expense/purchase/detail.vue')),
  pense_travel: createAsyncComponent(() => import('@/views/expense/travel/detail.vue')),
  pense_serve: createAsyncComponent(() => import('@/views/expense/entertain/detail.vue')),
  pense_apply: createAsyncComponent(() => import('@/views/expense/payment/detail.vue')),
  pense_ansure: createAsyncComponent(() => import('@/views/expense/deposit/detail.vue')),
  pense_borrow: createAsyncComponent(() => import('@/views/expense/advance/detail.vue')),
  pense_payer: createAsyncComponent(() => import('@/views/expense/tax/detail.vue')),
  staff_info: createAsyncComponent(() => import('@/views/hr/roster/detail.vue')),
  staff_entry: createAsyncComponent(() => import('@/views/hr/movement/onboard/detail.vue')),
  staff_allot: createAsyncComponent(() => import('@/views/hr/movement/transfer/detail.vue')),
  staff_adjust: createAsyncComponent(() => import('@/views/hr/movement/adjust/detail.vue')),
  staff_grade: createAsyncComponent(() => import('@/views/hr/movement/promotion/detail.vue')),
  staff_retire: createAsyncComponent(() => import('@/views/hr/exit/resign/detail.vue')),
  staff_remove: createAsyncComponent(() => import('@/views/hr/exit/dismiss/detail.vue')),
  staff_refuse: createAsyncComponent(() => import('@/views/hr/exit/absent/detail.vue')),
  staff_scales: createAsyncComponent(() => import('@/views/hr/relation/level/detail.vue')),
  staff_because: createAsyncComponent(() => import('@/views/hr/relation/reward/detail.vue')),
  checkin_reissue: createAsyncComponent(() => import('@/views/hr/attendance-apply/makeup/detail.vue')),
  checkin_outside: createAsyncComponent(() => import('@/views/hr/attendance-apply/field/detail.vue')),
  checkin_overtime: createAsyncComponent(() => import('@/views/hr/attendance-apply/overtime/detail.vue')),
  checkin_vacation: createAsyncComponent(() => import('@/views/hr/attendance-apply/leave/detail.vue')),
  checkin_tanslate: createAsyncComponent(() => import('@/views/hr/attendance-apply/shift/detail.vue')),
  trade_project: createAsyncComponent(() => import('@/views/crm/project/detail.vue')),
  paper_borrow: createAsyncComponent(() => import('@/views/archive/borrow/detail.vue')),
}

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
