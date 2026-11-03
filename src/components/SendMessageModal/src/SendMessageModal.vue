<script lang="ts" setup>
import { UserSelect } from '@/components/TableSelect'
import { messageSendTypeOptions } from '@/hooks/message'
import api from '@/service/api/message'
import toast from '@/utils/toast'

const emit = defineEmits(['success'])

const modalRef = ref<any>(null)

const sendModel = reactive({
  types: '0',
  user_id: [] as string[],
  content: '',
})

function open() {
  sendModel.types = '0'
  sendModel.user_id = []
  sendModel.content = ''
  modalRef.value?.open()
}

async function handleSend({ done }) {
  if (!sendModel.content) {
    toast.info('消息内容不能为空')
    done(false)
    return
  }

  const { isSuccess } = await api.massSend({
    type: sendModel.types,
    receive_user_id: sendModel.user_id,
    content: sendModel.content,
  })
  done(false)
  if (!isSuccess)
    return
  toast.success('消息发送成功')
  emit('success')
}

defineExpose({ open })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="发送消息"
    width="700"
    ok-text="发送"
    @ok="handleSend"
  >
    <n-form label-placement="left" label-width="80">
      <n-form-item label="发送对象">
        <n-radio-group v-model:value="sendModel.types" name="sendType">
          <n-space>
            <n-radio
              v-for="item in messageSendTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item v-if="sendModel.types === '0'" label="选择用户">
        <UserSelect
          v-model:value="sendModel.user_id"
          multiple
          placeholder="请选择用户"
        />
      </n-form-item>
      <n-form-item label="消息内容">
        <n-input
          v-model:value="sendModel.content"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-count
          placeholder="请输入消息内容"
        />
      </n-form-item>
    </n-form>
  </SpModal>
</template>
