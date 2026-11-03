<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { BizSendMessageModal } from '@/components/BizSendMessageModal'
import { NaIconButton } from '@/components/NaIconButton'
import { messageTypeOptions, useMessageNotification } from '@/hooks/message'
import { useMessageStore } from '@/store/modules/message'
import bus from '@/utils/bus'
import { createIcon } from '@/utils/iconify'

const router = useRouter()
const messageStore = useMessageStore()

// 启动通知监听
const { startNotification, stopNotification } = useMessageNotification({
  onView: (msg) => {
    // 根据业务类型打开对应详情弹窗
    if (msg.biz_name && Number(msg.biz_id) !== 0) {
      const [first, second, ...rest] = msg.biz_name.split('_')
      const isApprove = rest.length > 0
      const bizName = `${first}_${second}`

      if (Number(msg.biz_id) === 1) {
        const url = bizName
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
        router.push({ name: url })
      }
      else {
        bus.emit('biz-detail:open', {
          biz_name: bizName,
          biz_id: msg.biz_id,
          approve: isApprove,
          mode: isApprove ? 'approve' : 'apply',
        })
      }
    }
  },
})

// 根据类型获取图标
function getTypeIcon(types: number | string) {
  const typeNum = typeof types === 'string' ? Number(types) : types
  return typeNum === 0
    ? 'ant-design:check-circle-outlined'
    : typeNum === 1
      ? 'ant-design:message-outlined'
      : 'ant-design:notification-outlined'
}

// 左侧筛选选项
const filterOptions = computed(() => [
  { label: '全部', key: 'all', icon: createIcon('ant-design:appstore-outlined') },
  ...messageTypeOptions.map(o => ({
    label: o.label,
    key: String(o.value),
    icon: createIcon(getTypeIcon(o.value!)),
  })),
])

// 当前筛选标签
const currentFilterLabel = computed(() => {
  if (messageStore.filterType === null)
    return '全部'
  return messageTypeOptions.find(o => o.value === messageStore.filterType)?.label || '全部'
})

// 当前筛选图标
const currentFilterIcon = computed(() => {
  if (messageStore.filterType === null)
    return 'ant-design:appstore-outlined'
  return getTypeIcon(messageStore.filterType)
})

// 标记已读
async function handleRead(id: string) {
  await messageStore.markRead(id)
}

// 查看关联业务
function handleBizView(item: Message.Item) {
  if (item.biz_name && Number(item.biz_id) !== 0) {
    const [first, second, ...rest] = item.biz_name.split('_')
    const isApprove = rest.length > 0
    const bizName = `${first}_${second}`

    if (Number(item.biz_id) === 1) {
      const url = bizName
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
      router.push({ name: url })
    }
    else {
      bus.emit('biz-detail:open', {
        biz_name: bizName,
        biz_id: item.biz_id,
        approve: isApprove,
        mode: isApprove ? 'approve' : 'apply',
      })
    }
  }
}

// 标记全部已读
function handleReadAll() {
  window.$dialog.info({
    title: '提示',
    content: '确定标记所有消息为已读吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const success = await messageStore.markAllRead()
      if (success) {
        window.$message.success('操作成功')
      }
    },
  })
}

// 切换筛选类型
function handleFilterSelect(key: string) {
  messageStore.setFilterType(key === 'all' ? null : Number(key) as Message.Type)
}

// 打开发送消息弹窗
const sendModalRef = ref<InstanceType<typeof BizSendMessageModal> | null>(null)
function handleSend() {
  sendModalRef.value?.open()
}

// 查看更多
function handleViewMore() {
  router.push('/user/message')
}

onMounted(() => {
  messageStore.fetchUnread()
  startNotification()
})

onUnmounted(() => {
  stopNotification()
})
</script>

<template>
  <n-popover trigger="hover" style="padding: 0; width: 480px;" scrollable>
    <template #trigger>
      <n-badge :value="messageStore.unreadCount" :offset="[-7, 5]" :show="messageStore.unreadCount > 0">
        <NaIconButton icon="ant-design:bell-outlined" />
      </n-badge>
    </template>
    <n-card
      size="small"
      :bordered="false"
      :segmented="{ content: true }"
      header-style="padding: 8px 0;"
      content-style="padding: 0;"
    >
      <template #header>
        <n-flex class="w-full" justify="space-between" align="center">
          <!-- 左侧筛选 -->
          <n-dropdown trigger="hover" :options="filterOptions" @select="handleFilterSelect">
            <div class="flex cursor-pointer items-center gap-1">
              <NaIcon :icon="currentFilterIcon" />
              <span class="text-sm">{{ currentFilterLabel }}</span>
              <NaIcon icon="ant-design:down-outlined" :size="14" />
            </div>
          </n-dropdown>
        </n-flex>
      </template>

      <!-- 消息列表：固定高度，可滚动 -->
      <div class="max-h-120 overflow-auto">
        <n-empty v-if="messageStore.unreadMessages.length === 0" description="暂无消息" class="py-8">
          <template #icon>
            <NaIcon icon="ant-design:inbox-outlined" :size="36" />
          </template>
        </n-empty>

        <div v-else style="padding-bottom: 10px;">
          <div
            v-for="item in messageStore.unreadMessages"
            :key="item.id"
            class="message-item flex gap-3 px-4 py-3"
            :class="{ unread: !item.utime }"
          >
            <!-- 左侧图标 -->
            <div class="flex-shrink-0">
              <NButton circle secondary :type="item.utime ? 'default' : 'primary'" size="small">
                <template #icon>
                  <NaIcon :icon="getTypeIcon(item.types ?? 0)" />
                </template>
              </NButton>
            </div>

            <!-- 右侧内容 -->
            <div class="min-w-0 flex-1">
              <div class="line-clamp-1 text-base font-medium">
                {{ item.title }}
              </div>
              <div v-if="item.content" class="line-clamp-2 mt-1">
                {{ item.content }}
              </div>
              <n-flex class="mt-1" align="center" :size="8">
                <n-text depth="3" class="text-xs">
                  {{ item.ctime }}
                </n-text>
                <NButton
                  v-if="item.biz_name && item.biz_id !== '0'"
                  text
                  type="primary"
                  size="tiny"
                  @click.stop="handleBizView(item)"
                >
                  查看
                </NButton>
                <NButton v-if="!item.utime" text type="primary" size="tiny" @click.stop="handleRead(item.id)">
                  标记已读
                </NButton>
              </n-flex>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <n-flex justify="center" :size="8">
          <NButton
            size="small" quaternary @click="handleSend"
          >
            <template #icon>
              <NaIcon icon="ant-design:send-outlined" />
            </template>
            发送消息
          </NButton>
          <NButton size="small" quaternary @click="handleReadAll">
            <template #icon>
              <NaIcon icon="ant-design:check-circle-outlined" />
            </template>
            标记全部已读
          </NButton>
          <NButton size="small" quaternary @click="handleViewMore">
            <template #icon>
              <NaIcon icon="ant-design:more-outlined" />
            </template>
            查看更多
          </NButton>
        </n-flex>
      </template>
    </n-card>
  </n-popover>

  <!-- 发送消息弹窗 -->
  <BizSendMessageModal ref="sendModalRef" @success="messageStore.fetchUnread()" />
</template>

<style lang="less" scoped>
.message-item {
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid rgb(243, 244, 246);

  &:last-child {
    border-bottom-color: transparent;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.unread {
    .text-sm {
      font-weight: 600;
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .message-item {
    border-bottom-color: rgba(255, 255, 255, 0.08);

    &:last-child {
      border-bottom-color: transparent;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    &.unread {
      // background-color: rgba(45, 140, 240, 0.08);
    }
  }
}
</style>
