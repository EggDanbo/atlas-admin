<script lang="ts" setup>
import type { ModalInst } from '@/components/SpModal'
import { daily as api } from '@/service/api/hr/attendance'
import toast from '@/utils/toast'

const emit = defineEmits(['success'])

const modalRef = ref<ModalInst | null>(null)

const form = reactive<any>({
  id: null,
  types: '0',
  work_type: '0',
  adjust_time: null,
  memo: '',
  showTypes: false,
})

// 从统计矩阵等入口打开时的人员与卡别提示
const subtitle = ref('')

const typeOptions = [
  { label: '补卡', value: '0' },
  { label: '缺卡', value: '1' },
]

async function open(params: any) {
  form.id = params.id
  form.types = params.types ?? '0'
  form.work_type = params.work_type ?? '0'
  // 未打卡时上游传 0,?? 拦不住,时间戳 0 会被日期控件显示为 1970-01-01
  form.adjust_time = params.adjust_time || null
  form.memo = params.memo ?? ''
  form.showTypes = !!params.showTypes
  subtitle.value = params.subtitle ?? ''
  modalRef.value?.open()
}

async function handleOk() {
  if (!form.memo) {
    toast.info('请输入备注')
    return
  }
  // 补卡必须指定时间;缺卡(types=1)由后端按缺卡处理,无需时间
  if (form.types === '0' && !form.adjust_time) {
    toast.info('请选择校准时间')
    return
  }
  toast.infoModal('确定校准吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await api.adjust({ ...form })
      if (!isSuccess)
        return
      toast.success('操作成功')
      modalRef.value?.close()
      emit('success')
    },
  })
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'CheckinAdjustModal' }
</script>

<template>
  <SpModal ref="modalRef" title="校准" width="450" :mask="true">
    <template #default>
      <div v-if="subtitle" class="mb-4 mt-4 w-full">
        {{ subtitle }}
      </div>
      <div v-if="form.showTypes" class="mb-4 mt-4 w-full">
        <n-select v-model:value="form.types" :options="typeOptions" placeholder="校准类型" />
      </div>
      <div v-if="form.types === '0'" class="mb-4 mt-4 w-full">
        <n-date-picker v-model:value="form.adjust_time" type="datetime" placeholder="校准时间" />
      </div>
      <div class="mb-4 mt-4 w-full">
        <n-input v-model:value="form.memo" :maxlength="255" placeholder="备注" />
      </div>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="modalRef?.close()">
          关闭
        </n-button>
        <n-button type="primary" @click="handleOk">
          确定
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
