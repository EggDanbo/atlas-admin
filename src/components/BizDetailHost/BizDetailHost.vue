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
  organ_team: createAsyncComponent(() => import('@/views/organ/team/detail.vue')),
  organ_user: createAsyncComponent(() => import('@/views/organ/user/detail.vue')),
  organ_outer: createAsyncComponent(() => import('@/views/organ/outer/detail.vue')),
  asset_info: createAsyncComponent(() => import('@/views/asset/info/detail.vue')),
  asset_apply: createAsyncComponent(() => import('@/views/asset/apply/detail.vue')),
  asset_order: createAsyncComponent(() => import('@/views/asset/order/detail.vue')),
  asset_batch: createAsyncComponent(() => import('@/views/asset/batch/detail.vue')),
  asset_allot: createAsyncComponent(() => import('@/views/asset/allot/detail.vue')),
  asset_lease: createAsyncComponent(() => import('@/views/asset/lease/detail.vue')),
  asset_resume: createAsyncComponent(() => import('@/views/asset/resume/detail.vue')),
  asset_disuse: createAsyncComponent(() => import('@/views/asset/disuse/detail.vue')),
  asset_repair: createAsyncComponent(() => import('@/views/asset/repair/detail.vue')),
  pense_contract: createAsyncComponent(() => import('@/views/pense/contract/detail.vue')),
  pense_order: createAsyncComponent(() => import('@/views/pense/order/detail.vue')),
  pense_travel: createAsyncComponent(() => import('@/views/pense/travel/detail.vue')),
  pense_serve: createAsyncComponent(() => import('@/views/pense/serve/detail.vue')),
  pense_apply: createAsyncComponent(() => import('@/views/pense/apply/detail.vue')),
  pense_ansure: createAsyncComponent(() => import('@/views/pense/ansure/detail.vue')),
  pense_borrow: createAsyncComponent(() => import('@/views/pense/borrow/detail.vue')),
  pense_payer: createAsyncComponent(() => import('@/views/pense/payer/detail.vue')),
  staff_info: createAsyncComponent(() => import('@/views/staff/info/detail.vue')),
  staff_entry: createAsyncComponent(() => import('@/views/staff/alter/entry/detail.vue')),
  staff_allot: createAsyncComponent(() => import('@/views/staff/alter/allot/detail.vue')),
  staff_adjust: createAsyncComponent(() => import('@/views/staff/alter/adjust/detail.vue')),
  staff_grade: createAsyncComponent(() => import('@/views/staff/alter/grade/detail.vue')),
  staff_retire: createAsyncComponent(() => import('@/views/staff/leave/retire/detail.vue')),
  staff_remove: createAsyncComponent(() => import('@/views/staff/leave/remove/detail.vue')),
  staff_refuse: createAsyncComponent(() => import('@/views/staff/leave/refuse/detail.vue')),
  staff_scales: createAsyncComponent(() => import('@/views/staff/daily/scales/detail.vue')),
  staff_because: createAsyncComponent(() => import('@/views/staff/daily/because/detail.vue')),
  checkin_reissue: createAsyncComponent(() => import('@/views/staff/apply/reissue/detail.vue')),
  checkin_outside: createAsyncComponent(() => import('@/views/staff/apply/outside/detail.vue')),
  checkin_overtime: createAsyncComponent(() => import('@/views/staff/apply/overtime/detail.vue')),
  checkin_vacation: createAsyncComponent(() => import('@/views/staff/apply/vacation/detail.vue')),
  checkin_tanslate: createAsyncComponent(() => import('@/views/staff/apply/translate/detail.vue')),
  trade_project: createAsyncComponent(() => import('@/views/trade/project/detail.vue')),
  vouch_entry: createAsyncComponent(() => import('@/views/vouch/entry/detail.vue')),
  paper_borrow: createAsyncComponent(() => import('@/views/paper/borrow/detail.vue')),
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
  console.log(data)
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
