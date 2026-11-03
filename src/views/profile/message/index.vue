<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { QueryGrid } from '@/components/QueryGrid'
import { SendMessageModal } from '@/components/SendMessageModal'
import { messageTypeOptions, useMessageApi } from '@/hooks/message'
import api from '@/service/api/message'
import { useMessageStore } from '@/store/modules/message'
import bus from '@/utils/bus'
import { getDateShortcuts } from '@/utils/dateUtil'
import toast from '@/utils/toast'

const router = useRouter()

const messageStore = useMessageStore()
const { messageKind, markRead, markAllRead } = useMessageApi()

// 筛选条件
const filterModel = reactive({
  page: 1,
  date: null as [number, number] | null,
  read: null as string | null,
  types: null as number | null,
  title: null as string | null,
  biz_id: null as string | null,
})

// 数据
const dataModel = ref<{ page?: number, pagesize?: number, totalcount?: number, list?: Message.Item[] }>({})

const getDataModel = computed(() => {
  const { page, pagesize, totalcount, list } = dataModel.value
  return {
    list: list || [],
    page: page || 1,
    pageSize: pagesize || 10,
    itemCount: totalcount || 0,
  }
})

// 获取数据
async function fetch() {
  const { isSuccess, data } = await api.search({
    page: filterModel.page,
    pagesize: 10,
    kind: messageKind,
    unread: filterModel.read === '未读',
    types: filterModel.types,
    title: filterModel.title,
    biz_id: filterModel.biz_id,
    ...(filterModel.date ? { time_begin: filterModel.date[0], time_end: filterModel.date[1] } : {}),
  })

  if (!isSuccess)
    return
  dataModel.value = data as unknown as typeof dataModel.value
}

// 搜索
function handleSearch() {
  filterModel.page = 1
  fetch()
}

// 更新页码
function updatePage(page: number) {
  filterModel.page = page
  fetch()
}

const dateShortcuts = getDateShortcuts()

// 发送消息弹窗
const sendModalRef = ref<InstanceType<typeof SendMessageModal> | null>(null)

function openSendModal() {
  sendModalRef.value?.open()
}

// 标记已读
async function handleRead(item: Message.Item) {
  if (!item.utime) {
    item.utime = Date.now()
  }
  await markRead(item.id)
  // 同步更新 Store
  messageStore.fetchUnread()
}

// 全部已读
function handleReadAll() {
  toast.infoModal('确定清空未读消息吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const success = await markAllRead()
      if (!success)
        return
      toast.success('操作成功')
      await fetch()
      // 同步更新 Store
      messageStore.fetchUnread()
    },
  })
}

// 查看关联业务
function handleView(item: Message.Item) {
  if (!item.biz_name)
    return

  const [first, second, ...rest] = item.biz_name.split('_')
  const isApprove = rest.length > 0
  const bizName = `${first}_${second}`

  if (Number(item.biz_id) === 1) {
    const url = bizName
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    router.push({ name: url })
    return
  }

  // 根据业务类型打开对应详情弹窗
  bus.emit('biz-detail:open', {
    biz_name: bizName,
    biz_id: item.biz_id,
    approve: isApprove,
    mode: isApprove ? 'approve' : 'apply',
  })
}

// 根据类型获取图标
function getTypeIcon(types: number) {
  return types === 0
    ? 'ant-design:check-circle-outlined'
    : types === 1
      ? 'ant-design:message-outlined'
      : 'ant-design:notification-outlined'
}

onMounted(() => {
  fetch()
})
</script>

<script lang="ts">
export default { name: 'MessageCenter' }
</script>

<template>
  <NaPage>
    <n-flex>
      <n-card :bordered="false" class="flex-shrink-0">
        <QueryGrid :cols="24" :show-fold="false">
          <n-gi span="6">
            <n-date-picker
              v-model:value="filterModel.date"
              placeholder="请选择日期"
              type="daterange"
              fast-month-select
              :shortcuts="dateShortcuts"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <n-select
              v-model:value="filterModel.read"
              placeholder="读取状态"
              :options="[{ label: '未读', value: '未读' }]"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <n-select
              v-model:value="filterModel.types"
              placeholder="消息类型"
              :options="messageTypeOptions"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input
              v-model:value="filterModel.title"
              placeholder="消息标题"
              clearable
            />
          </n-gi>
          <n-gi span="4">
            <n-input
              v-model:value="filterModel.biz_id"
              placeholder="关联业务ID"
              clearable
            />
          </n-gi>
        </QueryGrid>
      </n-card>

      <n-card :bordered="false" class="flex-1">
        <template #header>
          <n-flex justify="space-between" align="center">
            <n-space>
              <n-button type="primary" @click="handleSearch">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:reload-outlined" />
                  </n-icon>
                </template>
                查询
              </n-button>
              <n-button @click="openSendModal">
                <template #icon>
                  <NaIcon icon="ant-design:send-outlined" />
                </template>
                发送消息
              </n-button>
              <n-button @click="handleReadAll">
                <template #icon>
                  <NaIcon icon="ant-design:check-circle-outlined" />
                </template>
                全部已读
              </n-button>
            </n-space>
            <n-pagination
              :page="getDataModel.page"
              :item-count="getDataModel.itemCount"
              :page-size="getDataModel.pageSize"
              :page-slot="6"
              @update:page="updatePage"
            >
              <template #prefix="{ itemCount }">
                共 {{ itemCount }} 条
              </template>
            </n-pagination>
          </n-flex>
        </template>

        <!-- 滚动区域 -->
        <div class="min-h-0 flex-1 overflow-auto" style="max-height: calc(100vh - 300px);">
          <n-empty v-if="getDataModel.list.length === 0" description="暂无消息" class="py-20">
            <template #icon>
              <NaIcon icon="ant-design:inbox-outlined" :size="48" />
            </template>
          </n-empty>

          <template v-else>
            <div
              v-for="(item, index) in getDataModel.list"
              :key="index"
              class="message-item flex gap-4 px-6 py-4"
              :class="{ unread: !item.utime }"
            >
              <!-- 左侧图标 -->
              <div class="flex-shrink-0">
                <n-button circle secondary :type="item.utime ? 'default' : 'primary'" size="small">
                  <template #icon>
                    <NaIcon :icon="getTypeIcon(item.types ?? 0)" />
                  </template>
                </n-button>
              </div>

              <!-- 中间内容 -->
              <div class="min-w-0 flex-1">
                <n-flex align="center" :size="8">
                  <n-tag v-if="item.types !== undefined" size="small" :bordered="false" round>
                    {{ messageTypeOptions.find(o => o.value === item.types)?.label || '消息' }}
                  </n-tag>
                  <n-text class="text-base font-medium" :depth="item.utime ? 2 : 1">
                    {{ item.title }}
                  </n-text>
                </n-flex>
                <div class="message-content mt-2 text-sm leading-relaxed">
                  {{ item.content }}
                </div>
                <n-flex class="mt-3" align="center" :size="12">
                  <n-text depth="3" class="text-xs">
                    {{ item.ctime }}
                  </n-text>
                  <n-button
                    v-if="item.biz_name && item.biz_name !== 'mass'"
                    text
                    type="primary"
                    size="tiny"
                    @click="handleView(item)"
                  >
                    查看
                  </n-button>
                  <n-tag v-if="item.utime" size="tiny" :bordered="false" type="success">
                    已读
                  </n-tag>
                  <n-button
                    v-if="!item.utime"
                    text
                    type="primary"
                    size="tiny"
                    @click="handleRead(item)"
                  >
                    标记已读
                  </n-button>
                </n-flex>
              </div>
            </div>

            <!-- 底部分页 -->
            <div class="sticky bottom-0 flex justify-end bg-white p-4 dark:bg-dark">
              <n-pagination
                :page="getDataModel.page"
                :item-count="getDataModel.itemCount"
                :page-size="getDataModel.pageSize"
                @update:page="updatePage"
              >
                <template #prefix="{ itemCount }">
                  共 {{ itemCount }} 条
                </template>
              </n-pagination>
            </div>
          </template>
        </div>
      </n-card>

      <!-- 发送消息弹窗 -->
      <SendMessageModal ref="sendModalRef" @success="fetch" />
    </n-flex>
  </NaPage>
</template>

<style lang="less" scoped>
.message-item {
  min-height: 100px;
  transition: all 0.3s ease-in-out;
  border-bottom: 1px solid rgb(243, 244, 246);

  &:last-child {
    border-bottom-color: transparent;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.unread {
    background-color: rgba(45, 140, 240, 0.04);

    .text-base {
      font-weight: 600;
    }
  }

  .message-content {
    word-break: break-all;
    white-space: pre-wrap;
    line-height: 1.6;
  }
}

html[data-vxe-ui-theme='dark'] {
  .message-item {
    border-bottom: 1px solid transparent;

    &:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    &.unread {
      // background-color: rgba(45, 140, 240, 0.08);
    }
  }
}
</style>
