<script lang="ts" setup>
import type { PropType } from 'vue'
import { useModal } from '@/components/SpModal'
import { approve } from '@/service/api/workflow'
import toast from '@/utils/toast'

/**
 * 单据审批操作区
 *
 * 收敛详情页重复了三十余次的「同意 / 不同意 / 取消 / 撤回 / 作废」按钮、
 * 审批意见弹窗以及对应的接口调用。各页面只需传入单据模型与业务分类。
 */
const props = defineProps({
  /** 单据模型，需含 id 与 opt_confirm / opt_cancel / opt_revoke 开关 */
  model: {
    type: Object as PropType<Recordable>,
    required: true,
  },
  /** 业务分类，审批接口用它定位单据类型，如 Asset / Pense / Staff / Checkin */
  bizClass: {
    type: String,
    required: true,
  },
  /** 是否处于审批场景（从待办进入） */
  isApprove: {
    type: Boolean,
    default: false,
  },
  /** 详情打开模式，apply 时展示撤回/作废 */
  detailMode: {
    type: String as PropType<string | null>,
    default: null,
  },
  /** 同意时是否也先弹窗选择意见（多数单据直接提交，个别单据需要先选） */
  confirmWithRemark: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['done'])

const loading = ref(false)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

const processTitle = computed(() => `${processTypes.value ?? ''}原因`)

const [registerModal, { open: openModal, close: closeModal }] = useModal()

function handleProcess(opt: string) {
  processTypes.value = opt
  processRemark.value = null

  // 多数单据同意无需填写意见，直接提交；个别单据需先选意见
  if (opt === '同意' && !props.confirmWithRemark) {
    submit()
    return
  }
  openModal()
}

async function submit() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const list = [{ id: props.model.id, biz_class: props.bizClass }]
  const payload = { list, remark: processRemark.value }

  loading.value = true
  try {
    let isSuccess = false
    if (processTypes.value === '撤回') {
      ({ isSuccess } = await approve.revoke(payload))
    }
    else if (processTypes.value === '作废') {
      ({ isSuccess } = await approve.invalid(payload))
    }
    else {
      ({ isSuccess } = await approve.process({ ...payload, status: processTypes.value }))
    }

    if (!isSuccess)
      return

    toast.success('操作成功')
    closeModal()
    emit('done')
  }
  finally {
    loading.value = false
  }
}

function handleCancel() {
  toast.infoModal('确定取消审批吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      loading.value = true
      try {
        const { isSuccess } = await approve.cancel({
          list: [{ id: props.model.id, biz_class: props.bizClass }],
        })
        if (!isSuccess)
          return

        toast.success('操作成功')
        emit('done')
      }
      finally {
        loading.value = false
      }
    },
  })
}
</script>

<template>
  <n-button
    v-if="model.opt_confirm && isApprove"
    type="primary"
    @click="handleProcess('同意')"
  >
    同意
  </n-button>
  <n-button
    v-if="model.opt_confirm && isApprove"
    type="primary"
    @click="handleProcess('不同意')"
  >
    不同意
  </n-button>
  <n-button
    v-if="model.opt_cancel && isApprove"
    type="primary"
    :loading="loading"
    @click="handleCancel"
  >
    取消
  </n-button>
  <n-button
    v-if="model.opt_revoke && detailMode === 'apply'"
    type="primary"
    :loading="loading"
    @click="handleProcess('撤回')"
  >
    撤回
  </n-button>
  <n-button
    v-if="model.opt_revoke && detailMode === 'apply'"
    type="primary"
    :loading="loading"
    @click="handleProcess('作废')"
  >
    作废
  </n-button>

  <SpModal
    width="460"
    :title="processTitle"
    :mask="true"
    :draggable="true"
    @register="registerModal"
  >
    <div class="flex flex-col gap-3">
      <n-radio-group v-if="processTypes === '同意'" v-model:value="processRemark">
        <n-space>
          <n-radio value="拟同意，提交">
            拟同意，提交
          </n-radio>
          <n-radio value="同意">
            同意
          </n-radio>
        </n-space>
      </n-radio-group>

      <n-input
        v-model:value="processRemark"
        type="textarea"
        :rows="5"
        clearable
        :readonly="processTypes === '同意'"
        placeholder="请填写原因（必填）"
      />
    </div>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="closeModal">
          关闭
        </n-button>
        <n-button type="primary" :loading="loading" @click="submit">
          提交
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
